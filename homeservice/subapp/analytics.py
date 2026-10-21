from datetime import datetime, time, timedelta

from django.db.models import Avg, Case, CharField, Count, Q, Value, When
from django.db.models.functions import Lower, TruncDay, TruncMonth, TruncWeek
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Booking, City, Review, Service, User, Worker


STATUS_VALUES = ("PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED")
RANGE_VALUES = ("today", "7d", "30d", "month", "custom")
BUCKETS = {"day": TruncDay, "week": TruncWeek, "month": TruncMonth}


def _admin_only(user):
    return user.is_authenticated and (user.is_staff or user.role == "ADMIN")


def _window(params):
    range_name = params.get("range", "30d")
    if range_name not in RANGE_VALUES:
        return None, None, {"range": ["Choose today, 7d, 30d, month, or custom."]}

    today = timezone.localdate()
    if range_name == "today":
        start_date = end_date = today
    elif range_name == "7d":
        start_date, end_date = today - timedelta(days=6), today
    elif range_name == "30d":
        start_date, end_date = today - timedelta(days=29), today
    elif range_name == "month":
        start_date, end_date = today.replace(day=1), today
    else:
        start_date = parse_date(params.get("start", ""))
        end_date = parse_date(params.get("end", ""))
        if not start_date or not end_date:
            return None, None, {"date_range": ["Custom ranges need valid start and end dates."]}
        if end_date < start_date:
            return None, None, {"date_range": ["End date must be on or after start date."]}
        if (end_date - start_date).days > 3660:
            return None, None, {"date_range": ["Date ranges cannot exceed ten years."]}

    tz = timezone.get_current_timezone()
    start_at = timezone.make_aware(datetime.combine(start_date, time.min), tz)
    end_at = timezone.make_aware(datetime.combine(end_date + timedelta(days=1), time.min), tz)
    return (start_date, end_date, start_at, end_at, range_name), None, None


def _count_statuses(queryset):
    return queryset.aggregate(
        total=Count("id"),
        pending=Count("id", filter=Q(status="PENDING")),
        accepted=Count("id", filter=Q(status="ACCEPTED")),
        in_progress=Count("id", filter=Q(status="IN_PROGRESS")),
        completed=Count("id", filter=Q(status="COMPLETED")),
        cancelled=Count("id", filter=Q(status="CANCELLED")),
        rejected=Count("id", filter=Q(status="REJECTED")),
    )


def _bucket_key(value):
    if hasattr(value, "date"):
        value = value.date()
    return value.isoformat() if value else None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    if not _admin_only(request.user):
        return Response({"detail": "Administrator access required."}, status=403)

    window, _, error = _window(request.query_params)
    if error:
        return Response(error, status=400)
    start_date, end_date, start_at, end_at, range_name = window

    bucket = request.query_params.get("bucket", "day")
    if bucket not in BUCKETS:
        return Response({"bucket": ["Choose day, week, or month."]}, status=400)

    city_id = request.query_params.get("city", "")
    service_id = request.query_params.get("service", "")
    status_value = request.query_params.get("status", "")
    if status_value and status_value not in STATUS_VALUES:
        return Response({"status": ["Choose a valid booking status."]}, status=400)

    city_records = list(City.objects.order_by(Lower("name"), "id").values("id", "name"))
    city_options, seen_cities = [], set()
    for city in city_records:
        key = " ".join(city["name"].split()).casefold()
        if key and key not in seen_cities:
            city_options.append({"id": city["id"], "name": " ".join(city["name"].split()), "key": key})
            seen_cities.add(key)
    selected_city = None
    if city_id:
        try:
            city_record = next((row for row in city_records if str(row["id"]) == city_id), None)
        except (TypeError, ValueError):
            city_record = None
        if not city_record:
            return Response({"city": ["Choose a city from the available list."]}, status=400)
        selected_city = " ".join(city_record["name"].split())

    services = list(Service.objects.order_by(Lower("name"), "id").values("id", "name"))
    if service_id:
        try:
            selected_service_id = int(service_id)
        except (TypeError, ValueError):
            return Response({"service": ["Choose a valid service."]}, status=400)
        if not any(service["id"] == selected_service_id for service in services):
            return Response({"service": ["Choose a service from the available list."]}, status=400)
    else:
        selected_service_id = None

    user_lifetime = User.objects.aggregate(
        total=Count("id"),
        customers=Count("id", filter=Q(role="USER", is_staff=False)),
        professionals=Count("id", filter=Q(role="WORKER", is_staff=False)),
        administrators=Count("id", filter=Q(role="ADMIN") | Q(is_staff=True)),
        active=Count("id", filter=Q(is_active=True)),
        inactive=Count("id", filter=Q(is_active=False)),
    )
    user_period_qs = User.objects.filter(date_joined__gte=start_at, date_joined__lt=end_at)
    user_period = user_period_qs.aggregate(
        total=Count("id"),
        customers=Count("id", filter=Q(role="USER", is_staff=False)),
        professionals=Count("id", filter=Q(role="WORKER", is_staff=False)),
        administrators=Count("id", filter=Q(role="ADMIN") | Q(is_staff=True)),
    )
    growth_rows = user_period_qs.annotate(bucket_at=BUCKETS[bucket]("date_joined", tzinfo=timezone.get_current_timezone())).values("bucket_at").annotate(users=Count("id")).order_by("bucket_at")
    user_growth = [{"date": _bucket_key(row["bucket_at"]), "users": row["users"]} for row in growth_rows]

    city_cases = [When(Q(address__icontains=city["name"]) | Q(worker__service_area__icontains=city["name"]), then=Value(city["key"])) for city in city_options]
    if city_cases:
        city_expression = Case(*city_cases, default=Value("unmapped"), output_field=CharField())
    else:
        city_expression = Value("unmapped", output_field=CharField())

    filtered_bookings = Booking.objects.filter(created_at__gte=start_at, created_at__lt=end_at)
    if selected_city:
        filtered_bookings = filtered_bookings.filter(Q(address__icontains=selected_city) | Q(worker__service_area__icontains=selected_city))
    if selected_service_id:
        filtered_bookings = filtered_bookings.filter(service_id=selected_service_id)
    if status_value:
        filtered_bookings = filtered_bookings.filter(status=status_value)

    bookings_lifetime = _count_statuses(Booking.objects.all())
    bookings_period = _count_statuses(filtered_bookings)
    role_distribution = [
        {"name": "Customers", "value": user_lifetime["customers"], "role": "USER"},
        {"name": "Professionals", "value": user_lifetime["professionals"], "role": "WORKER"},
        {"name": "Administrators", "value": user_lifetime["administrators"], "role": "ADMIN"},
    ]
    booking_status_distribution = [
        {"name": label, "value": bookings_period[key.lower()], "status": key}
        for key, label in (("PENDING", "Pending"), ("ACCEPTED", "Accepted"), ("IN_PROGRESS", "In progress"), ("COMPLETED", "Completed"), ("CANCELLED", "Cancelled"), ("REJECTED", "Rejected"))
    ]

    booking_growth_rows = filtered_bookings.annotate(bucket_at=BUCKETS[bucket]("created_at", tzinfo=timezone.get_current_timezone())).values("bucket_at").annotate(bookings=Count("id")).order_by("bucket_at")
    booking_growth = [{"date": _bucket_key(row["bucket_at"]), "bookings": row["bookings"]} for row in booking_growth_rows]
    service_growth_rows = filtered_bookings.annotate(bucket_at=BUCKETS[bucket]("created_at", tzinfo=timezone.get_current_timezone())).values("bucket_at", "service_id", "service__name").annotate(bookings=Count("id")).order_by("bucket_at", "service__name")
    service_growth = [{"date": _bucket_key(row["bucket_at"]), "service_id": row["service_id"], "service": row["service__name"], "bookings": row["bookings"]} for row in service_growth_rows]

    booking_service_rows = filtered_bookings.values("service_id").annotate(
        total=Count("id"),
        pending=Count("id", filter=Q(status="PENDING")),
        accepted=Count("id", filter=Q(status="ACCEPTED")),
        in_progress=Count("id", filter=Q(status="IN_PROGRESS")),
        completed=Count("id", filter=Q(status="COMPLETED")),
        cancelled=Count("id", filter=Q(status="CANCELLED")),
        rejected=Count("id", filter=Q(status="REJECTED")),
        average_rating=Avg("review__rating"),
    )
    booking_service_map = {row["service_id"]: row for row in booking_service_rows}
    worker_query = Worker.objects.all()
    if selected_city:
        worker_query = worker_query.filter(service_area__icontains=selected_city)
    if selected_service_id:
        worker_query = worker_query.filter(service_id=selected_service_id)
    worker_service_rows = worker_query.values("service_id").annotate(
        professionals=Count("id"),
        available=Count("id", filter=Q(approved=True, available=True)),
    )
    worker_service_map = {row["service_id"]: row for row in worker_service_rows}
    service_analytics = []
    for service in services:
        if selected_service_id and service["id"] != selected_service_id:
            continue
        booking_row = booking_service_map.get(service["id"], {})
        worker_row = worker_service_map.get(service["id"], {})
        total = booking_row.get("total", 0)
        completed = booking_row.get("completed", 0)
        service_analytics.append({
            "id": service["id"], "name": service["name"], "total": total,
            "pending": booking_row.get("pending", 0), "accepted": booking_row.get("accepted", 0),
            "in_progress": booking_row.get("in_progress", 0), "completed": completed,
            "cancelled": booking_row.get("cancelled", 0), "rejected": booking_row.get("rejected", 0),
            "professionals": worker_row.get("professionals", 0), "available_professionals": worker_row.get("available", 0),
            "completion_rate": round(completed * 100 / total, 1) if total else 0,
            "average_rating": round(float(booking_row.get("average_rating") or 0), 1),
        })

    workers_lifetime = Worker.objects.aggregate(total=Count("id"), pending_approval=Count("id", filter=Q(approved=False)), approved_total=Count("id", filter=Q(approved=True)), available_total=Count("id", filter=Q(approved=True, available=True)))
    area_values = Worker.objects.exclude(service_area__isnull=True).exclude(service_area__exact="").values_list("service_area", flat=True)
    distinct_areas = {" ".join(area.split()).casefold() for area in area_values if area and " ".join(area.split())}
    catalog_city_count = len(seen_cities)
    total_bookings_by_city = filtered_bookings.annotate(city_key=city_expression).values("city_key").annotate(
        total=Count("id"), customers=Count("user_id", distinct=True), services=Count("service_id", distinct=True),
    )
    city_booking_map = {row["city_key"]: row for row in total_bookings_by_city}
    worker_city_cases = [When(service_area__icontains=city["name"], then=Value(city["key"])) for city in city_options]
    worker_city_expression = Case(*worker_city_cases, default=Value("unmapped"), output_field=CharField()) if worker_city_cases else Value("unmapped", output_field=CharField())
    city_worker_query = Worker.objects.filter(approved=True, available=True)
    if selected_city:
        city_worker_query = city_worker_query.filter(service_area__icontains=selected_city)
    city_worker_rows = city_worker_query.annotate(city_key=worker_city_expression).values("city_key").annotate(professionals=Count("id"))
    city_worker_map = {row["city_key"]: row["professionals"] for row in city_worker_rows}
    city_service_rows = filtered_bookings.annotate(city_key=city_expression).values("city_key", "service__name").annotate(total=Count("id")).order_by("-total", "service__name")
    city_services = {}
    for row in city_service_rows:
        if row["city_key"] != "unmapped":
            city_services.setdefault(row["city_key"], []).append(row["service__name"])

    city_analytics = []
    for city in city_options:
        if selected_city and city["key"] != " ".join(selected_city.split()).casefold():
            continue
        booking_row = city_booking_map.get(city["key"], {})
        available = city_worker_map.get(city["key"], 0)
        total = booking_row.get("total", 0)
        city_analytics.append({
            "id": city["id"], "name": city["name"], "bookings": total,
            "customers_with_bookings": booking_row.get("customers", 0),
            "available_professionals": available,
            "services": city_services.get(city["key"], [])[:3],
            "availability_gap": total > 0 and available == 0,
        })

    lifetime_rating = Review.objects.aggregate(value=Avg("rating"))["value"]
    filtered_rating = filtered_bookings.aggregate(value=Avg("review__rating"))["value"]
    global_stats = {
        **user_lifetime,
        "professionals": workers_lifetime["total"],
        "registered_professionals": user_lifetime["professionals"],
        "pending_professional_approvals": workers_lifetime["pending_approval"],
        "approved_professionals": workers_lifetime["approved_total"],
        "available_professionals": workers_lifetime["available_total"],
        "service_categories": len(services),
        "cities": catalog_city_count,
        "service_areas": len(distinct_areas),
        "bookings": bookings_lifetime,
        "average_rating": round(float(lifetime_rating or 0), 1),
        "review_count": Review.objects.count(),
    }

    return Response({
        "filters": {"range": range_name, "start": start_date.isoformat(), "end": end_date.isoformat(), "bucket": bucket, "city": city_id or "", "service": str(selected_service_id or ""), "status": status_value},
        "choices": {"cities": [{"id": city["id"], "name": city["name"]} for city in city_options], "services": services, "statuses": [{"value": value, "label": label} for value, label in Booking.STATUS]},
        "global": global_stats,
        "period": {"users": user_period, "bookings": bookings_period, "average_rating": round(float(filtered_rating or 0), 1)},
        "role_distribution": role_distribution,
        "booking_status_distribution": booking_status_distribution,
        "user_growth": user_growth,
        "booking_growth": booking_growth,
        "service_growth": service_growth,
        "cities": city_analytics,
        "services": service_analytics,
    })
