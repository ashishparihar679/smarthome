from rest_framework import serializers
from .models import Service, Worker, Booking, User


class ServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    class Meta:
        model = Service
        fields = '__all__'


class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):

    service_name = serializers.CharField(source="service.name", read_only=True)
    worker_name = serializers.CharField(source="worker.name", read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'




class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role"
        ]

        extra_kwargs = {
            "password": {"write_only": True}
        }


    
    def validate_username(self, value):

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")

        return value




    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")

        return value


    
    def create(self, validated_data):

        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)  

        user.save()

        return user
