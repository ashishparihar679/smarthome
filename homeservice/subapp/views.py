from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password

from .models import Service, City, Worker, Booking,User
from .serializers import ServiceSerializer, WorkerSerializer, BookingSerializer, UserSerializer


# -------------------------
# SERVICES LIST
# -------------------------
@api_view(['GET','POST'])
def services(request):

    if request.method == "GET":
        data = Service.objects.all()
        serializer = ServiceSerializer(data, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = ServiceSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)
# -------------------------
# service delete
@api_view(['DELETE'])
def delete_service(request,id):

    service = get_object_or_404(Service,id=id)

    service.delete()

    return Response({"message":"Service Deleted"})

@api_view(['GET', 'POST'])
def cities(request):
    if request.method == 'GET':
        return Response([{"id": city.id, "name": city.name} for city in City.objects.order_by('name')])

    name = request.data.get('name', '').strip()
    if not name:
        return Response({"name": ["Enter a city name."]}, status=status.HTTP_400_BAD_REQUEST)
    if City.objects.filter(name__iexact=name).exists():
        return Response({"name": ["This city already exists."]}, status=status.HTTP_400_BAD_REQUEST)
    city = City.objects.create(name=name)
    return Response({"id": city.id, "name": city.name}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def delete_city(request, id):
    city = get_object_or_404(City, id=id)
    city.delete()
    return Response({"message": "City Deleted"})
# WORKERS LIST (FILTER BY SERVICE)
# -------------------------
@api_view(['GET','POST'])
def workers(request):

    if request.method == "GET":

        workers = Worker.objects.all()
        serializer = WorkerSerializer(workers, many=True)
        return Response(serializer.data)

    if request.method == "POST":

        serializer = WorkerSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)


# -------------------------
# CREATE BOOKING
# -------------------------
@api_view(['GET','POST'])
def create_booking(request):

    if request.method == "GET":

        bookings = Booking.objects.all()
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    if request.method == "POST":

        serializer = BookingSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)
# -------------------------
# WORKER BOOKINGS
# -------------------------
@api_view(['GET'])
def worker_bookings(request):

    worker_id = request.GET.get("worker")

    bookings = Booking.objects.filter(worker_id=worker_id)

    serializer = BookingSerializer(bookings, many=True)

    return Response(serializer.data)


# -------------------------
# ACCEPT BOOKING
# -------------------------
@api_view(['PUT'])
def accept_booking(request, id):

    booking = get_object_or_404(Booking, id=id)

    booking.status = "ACCEPTED"
    booking.save()

    return Response({"message": "Booking Accepted"})


# -------------------------
# REJECT BOOKING
# -------------------------
@api_view(['PUT'])
def reject_booking(request, id):

    booking = get_object_or_404(Booking, id=id)

    booking.status = "REJECTED"
    booking.save()

    return Response({"message": "Booking Rejected"})


# -------------------------
# COMPLETE BOOKING
# -------------------------
@api_view(['PUT'])
def complete_booking(request, id):

    booking = get_object_or_404(Booking, id=id)

    booking.status = "COMPLETED"
    booking.save()

    return Response({"message": "Service Completed"})


# -------------------------
# REGISTER USER
# -------------------------

@api_view(['POST'])
def register(request):

    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():

        user = serializer.save()

        # अगर worker signup कर रहा है
        if user.role == "WORKER":

            Worker.objects.create(
                name=user.first_name,
                phone=user.phone,
                service_id=request.data.get("service"),
                available=True,
                approved=False
            )

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

    return Response({
        "message":"Login Successful",
        "role":user.role,
        "user_id":user.id,
        "email":user.email
    })
@api_view(['PUT'])
def approve_worker(request,id):

    worker = get_object_or_404(Worker,id=id)

    worker.approved = True
    worker.save()

    return Response({"message":"Worker Approved"})

@api_view(['PUT'])
def toggle_worker_availability(request, id):
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
def user_profile(request,id):

    user = get_object_or_404(User,id=id)

    if request.method == "GET":
        data = {
            "id":user.id,
            "username":user.username,
            "first_name":user.first_name,
            "last_name":user.last_name,
            "email":user.email,
            "phone":user.phone
        }
        return Response(data)

    if request.method == "PUT":

        user.first_name = request.data.get("first_name",user.first_name)
        user.last_name = request.data.get("last_name",user.last_name)
        user.email = request.data.get("email",user.email)
        user.phone = request.data.get("phone",user.phone)

        user.save()

        return Response({"message":"Profile Updated"})
    
@api_view(['PUT'])
def cancel_booking(request,id):

    booking = get_object_or_404(Booking,id=id)

    booking.status = "CANCELLED"
    booking.save()

    return Response({"message":"Booking Cancelled"})

    
# Get All Users
@api_view(['GET'])
def all_users(request):
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
def add_user(request):

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
def update_user(request,id):

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
def delete_user(request,id):

    user = get_object_or_404(User,id=id)
    user.delete()

    return Response({"message":"User Deleted"})
