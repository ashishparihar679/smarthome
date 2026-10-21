from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Avg, Count
from django.utils.dateparse import parse_date
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Service, City, Worker, Booking, User, Review
from .serializers import ServiceSerializer, WorkerSerializer, BookingSerializer, UserSerializer, ReviewSerializer


def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.role == 'ADMIN')


def worker_for_user(user):
    return Worker.objects.filter(user=user).first() or Worker.objects.filter(phone=user.phone).first()


# -------------------------
# SERVICES LIST
# -------------------------
@api_view(['GET','POST'])
@permission_classes([AllowAny])
def services(request):

    if request.method == "GET":
        data = Service.objects.all()
        serializer = ServiceSerializer(data, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)
        serializer = ServiceSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)
# -------------------------
# service delete
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_service(request,id):
    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)

    service = get_object_or_404(Service,id=id)

    service.delete()

    return Response({"message":"Service Deleted"})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cities(request):
    if request.method == 'GET':
        return Response([{"id": city.id, "name": city.name} for city in City.objects.order_by('name')])

    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)
    name = request.data.get('name', '').strip()
    if not name:
        return Response({"name": ["Enter a city name."]}, status=status.HTTP_400_BAD_REQUEST)
    if City.objects.filter(name__iexact=name).exists():
        return Response({"name": ["This city already exists."]}, status=status.HTTP_400_BAD_REQUEST)
    city = City.objects.create(name=name)
    return Response({"id": city.id, "name": city.name}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_city(request, id):
    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)
    city = get_object_or_404(City, id=id)
    city.delete()
    return Response({"message": "City Deleted"})
# WORKERS LIST (FILTER BY SERVICE)
# -------------------------
@api_view(['GET','POST'])
@permission_classes([AllowAny])
def workers(request):

    if request.method == "GET":

        workers = Worker.objects.select_related('service').annotate(_rating=Avg('reviews__rating'), _count=Count('reviews'))
        if not is_admin(request.user):
            workers = workers.filter(approved=True, available=True)
        serializer = WorkerSerializer(workers, many=True, context={'request': request})
        return Response(serializer.data)

    return Response({'detail': 'Professional profiles are created during account registration.'}, status=405)


# -------------------------
# CREATE BOOKING
# -------------------------
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):

    if request.method == "GET":

        if is_admin(request.user):
            bookings = Booking.objects.all()
        elif request.user.role == 'WORKER':
            worker = worker_for_user(request.user)
            bookings = Booking.objects.filter(worker=worker) if worker else Booking.objects.none()
        else:
            bookings = Booking.objects.filter(user=request.user)
        bookings = bookings.select_related('service','worker','user').order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True, context={'request': request})
        return Response(serializer.data)

    if request.method == "POST":

        if request.user.role != 'USER':
            return Response({'detail': 'Only customers can create bookings.'}, status=403)
        service_id = request.data.get('service')
        worker_id = request.data.get('worker')
        worker = None
        if worker_id:
            worker = Worker.objects.filter(pk=worker_id, service_id=service_id, approved=True, available=True).first()
            if not worker:
                return Response({'worker': ['Select an available professional for this service.']}, status=400)
        else:
            worker = Worker.objects.filter(service_id=service_id, approved=True, available=True).order_by('id').first()
        serializer = BookingSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            booking = serializer.save(user=request.user, worker=worker)
            return Response(BookingSerializer(booking, context={'request': request}).data, status=201)

        return Response(serializer.errors, status=400)
# -------------------------
# WORKER BOOKINGS
# -------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def worker_bookings(request):
    worker = worker_for_user(request.user)
    if not worker or (request.user.role != 'WORKER' and not is_admin(request.user)):
        return Response({'detail': 'Professional access required.'}, status=403)
    bookings = Booking.objects.filter(worker=worker)

    serializer = BookingSerializer(bookings, many=True, context={'request': request})

    return Response(serializer.data)


# -------------------------
# ACCEPT BOOKING
# -------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def accept_booking(request, id):

    booking = get_object_or_404(Booking, id=id)
    worker = worker_for_user(request.user)
    if not worker or booking.worker_id != worker.id or request.user.role != 'WORKER':
        return Response({'detail': 'You may only update your assigned bookings.'}, status=403)
    if booking.status != 'PENDING': return Response({'detail': 'Only pending bookings can be accepted.'}, status=400)

    booking.status = "ACCEPTED"
    booking.save()

    return Response({"message": "Booking Accepted"})


# -------------------------
# REJECT BOOKING
# -------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def reject_booking(request, id):

    booking = get_object_or_404(Booking, id=id)
    worker = worker_for_user(request.user)
    if not worker or booking.worker_id != worker.id or request.user.role != 'WORKER':
        return Response({'detail': 'You may only update your assigned bookings.'}, status=403)
    if booking.status != 'PENDING': return Response({'detail': 'Only pending bookings can be rejected.'}, status=400)

    booking.status = "REJECTED"
    booking.save()

    return Response({"message": "Booking Rejected"})


# -------------------------
# COMPLETE BOOKING
# -------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def complete_booking(request, id):

    booking = get_object_or_404(Booking, id=id)
    worker = worker_for_user(request.user)
    if not worker or booking.worker_id != worker.id or request.user.role != 'WORKER':
        return Response({'detail': 'You may only update your assigned bookings.'}, status=403)
    if booking.status not in ('ACCEPTED','IN_PROGRESS'): return Response({'detail': 'Only accepted bookings can be completed.'}, status=400)

    booking.status = "COMPLETED"
    booking.save()

    return Response({"message": "Service Completed"})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def start_booking(request, id):
    booking = get_object_or_404(Booking, id=id)
    worker = worker_for_user(request.user)
    if request.user.role != 'WORKER' or not worker or booking.worker_id != worker.id:
        return Response({'detail': 'You may only update your assigned bookings.'}, status=403)
    if booking.status != 'ACCEPTED':
        return Response({'detail': 'Only accepted bookings can be started.'}, status=400)
    booking.status = 'IN_PROGRESS'
    booking.save(update_fields=['status'])
    return Response({'message': 'Service started'})


# -------------------------
# REGISTER USER
# -------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):

    if request.data.get('role', 'USER') == 'WORKER' and not Service.objects.filter(id=request.data.get('service')).exists():
        return Response({'service': ['Select a valid service.']}, status=400)
    if request.data.get('role', 'USER') == 'WORKER':
        name = f"{request.data.get('first_name', '').strip()} {request.data.get('last_name', '').strip()}".strip()
        if not name or len(name) > 100:
            return Response({'first_name': ['Enter a professional name up to 100 characters.']}, status=400)
        if len(request.data.get('skills', '')) > 500:
            return Response({'skills': ['Skills must be 500 characters or fewer.']}, status=400)
        if len(request.data.get('service_area', '')) > 120:
            return Response({'service_area': ['Service area must be 120 characters or fewer.']}, status=400)
        try:
            experience = int(request.data.get('experience') or 0)
        except (TypeError, ValueError):
            return Response({'experience': ['Enter a whole number from 0 to 60.']}, status=400)
        if not 0 <= experience <= 60:
            return Response({'experience': ['Enter a whole number from 0 to 60.']}, status=400)
        photo = request.FILES.get('profile_photo')
        if photo:
            if photo.size > 5 * 1024 * 1024:
                return Response({'profile_photo': ['Image must be 5 MB or smaller.']}, status=400)
            try:
                serializers.ImageField().run_validation(photo)
            except (serializers.ValidationError, DjangoValidationError) as error:
                messages = error.detail if isinstance(error, serializers.ValidationError) else error.messages
                return Response({'profile_photo': messages}, status=400)

    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():

        user = serializer.save()

        if user.role == "WORKER":
            service_id = request.data.get('service')
            if not service_id:
                user.delete()
                return Response({'service': ['A service is required for professional registration.']}, status=400)
            Worker.objects.create(user=user, name=f'{user.first_name} {user.last_name}'.strip() or user.username,
                phone=user.phone, service_id=service_id, experience=request.data.get('experience') or 0,
                service_area=request.data.get('service_area', ''), skills=request.data.get('skills', ''),
                bio=request.data.get('bio', ''), profile_photo=request.data.get('profile_photo'),
                available=True, approved=False)

        return Response({
            "message": "Account created successfully"
        }, status=201)

    return Response(serializer.errors, status=400)

@api_view(['POST'])
def login(request):

    email = request.data.get("email")
    password = request.data.get("password")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error":"Invalid Email or Password"}, status=400)

    # password verify
    if not check_password(password, user.password):
        return Response({"error":"Invalid Email or Password"}, status=400)

    refresh = RefreshToken.for_user(user)
    return Response({
        "message":"Login Successful",
        "role":user.role,
        "user_id":user.id,
        "email":user.email,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def approve_worker(request,id):

    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)

    worker = get_object_or_404(Worker,id=id)

    worker.approved = True
    worker.save()

    return Response({"message":"Worker Approved"})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def toggle_worker_availability(request, id):
    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)
    worker = get_object_or_404(Worker, id=id)
    worker.available = not worker.available
    worker.save(update_fields=['available'])
    return Response({"available": worker.available})

@api_view(['GET'])
def user_profile(request, id):

    user = get_object_or_404(User, id=id)

    data = {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role
    }

    return Response(data)

@api_view(['GET','PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request,id):

    user = get_object_or_404(User,id=id)
    if user.id != request.user.id and not is_admin(request.user):
        return Response({'detail': 'You may only access your own profile.'}, status=403)

    if request.method == "GET":
        data = {
            "id":user.id,
            "username":user.username,
            "first_name":user.first_name,
            "last_name":user.last_name,
            "email":user.email,
            "phone":user.phone
        }
        if user.role == 'WORKER':
            worker = worker_for_user(user)
            if worker:
                data['professional_profile'] = WorkerSerializer(worker, context={'request': request}).data
        return Response(data)

    if request.method == "PUT":

        user.first_name = request.data.get("first_name",user.first_name)
        user.last_name = request.data.get("last_name",user.last_name)
        user.email = request.data.get("email",user.email)
        user.phone = request.data.get("phone",user.phone)

        user.save()

        return Response({"message":"Profile Updated"})
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_booking(request,id):

    booking = get_object_or_404(Booking,id=id)
    if booking.user_id != request.user.id and not is_admin(request.user):
        return Response({'detail': 'You may only cancel your own bookings.'}, status=403)
    if booking.status not in ('PENDING','ACCEPTED'):
        return Response({'detail': 'This booking can no longer be cancelled.'}, status=400)

    booking.status = "CANCELLED"
    booking.save()

    return Response({"message":"Booking Cancelled"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request, id):
    booking = get_object_or_404(Booking.objects.select_related('worker'), id=id)
    if booking.user_id != request.user.id:
        return Response({'detail': 'You can only review your own booking.'}, status=403)
    if booking.status != 'COMPLETED' or not booking.worker_id:
        return Response({'detail': 'A completed booking with an assigned professional is required.'}, status=400)
    if Review.objects.filter(booking=booking).exists():
        return Response({'detail': 'This booking has already been reviewed.'}, status=409)
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        review = serializer.save(booking=booking, customer=request.user, worker=booking.worker)
        return Response(ReviewSerializer(review).data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def worker_reviews(request, id):
    worker = get_object_or_404(Worker, id=id)
    if not worker.approved and not (request.user.is_authenticated and (worker.user_id == request.user.id or is_admin(request.user))):
        return Response({'detail': 'Professional profile not found.'}, status=404)
    reviews = Review.objects.filter(worker=worker).select_related('customer','booking')
    data = ReviewSerializer(reviews, many=True).data
    summary = {str(star): reviews.filter(rating=star).count() for star in range(1, 6)}
    return Response({'average_rating': round(reviews.aggregate(value=Avg('rating'))['value'] or 0, 1),
                     'rating_count': reviews.count(), 'distribution': summary, 'reviews': data})

    
# Get All Users
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_users(request):
    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)
    users = User.objects.all().values(
        "id","username","first_name","last_name","email","phone","role"
    )
    data = list(users)
    workers_by_phone = {worker.phone: worker for worker in Worker.objects.select_related('service').all()}
    for user in data:
        worker = workers_by_phone.get(user['phone'])
        user['service'] = worker.service_id if worker else None
    return Response(data)


# Add User
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_user(request):
    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)

    role = request.data.get("role")
    service_id = request.data.get("service")
    service = get_object_or_404(Service, id=service_id) if role == "WORKER" and service_id else None
    if role == "WORKER" and not service_id:
        return Response({"error": "Service is required for workers"}, status=400)

    user = User.objects.create_user(
        username=request.data.get("username"),
        password=request.data.get("password"),
        first_name=request.data.get("first_name"),
        last_name=request.data.get("last_name"),
        email=request.data.get("email"),
        phone=request.data.get("phone"),
        role=role
    )

    if role == "WORKER":
        Worker.objects.update_or_create(
            phone=user.phone,
            defaults={"name": user.first_name or user.username, "service": service}
        )

    return Response({"message":"User Created"})


# Update User
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request,id):
    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)

    user = get_object_or_404(User,id=id)

    role = request.data.get("role", user.role)
    service_id = request.data.get("service")
    service = get_object_or_404(Service, id=service_id) if role == "WORKER" and service_id else None
    if role == "WORKER" and not service_id:
        return Response({"error": "Service is required for workers"}, status=400)

    user.first_name = request.data.get("first_name",user.first_name)
    user.last_name = request.data.get("last_name",user.last_name)
    user.email = request.data.get("email",user.email)
    user.phone = request.data.get("phone",user.phone)
    user.role = role
    new_password = request.data.get("password")
    if new_password:
        if len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters"}, status=400)
        user.set_password(new_password)

    user.save()

    if role == "WORKER":
        Worker.objects.update_or_create(
            phone=user.phone,
            defaults={"name": user.first_name or user.username, "service": service}
        )

    return Response({"message":"User Updated"})


# Delete User
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request,id):
    if not is_admin(request.user): return Response({'detail': 'Administrator access required.'}, status=403)

    user = get_object_or_404(User,id=id)
    user.delete()

    return Response({"message":"User Deleted"})
