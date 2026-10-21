from rest_framework import serializers
from django.utils import timezone
from .models import Service, Worker, Booking, User, Review


class ServiceSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()

    def get_average_rating(self, obj):
        from django.db.models import Avg
        from .models import Review
        average = Review.objects.filter(worker__service=obj, worker__approved=True).aggregate(value=Avg('rating'))['value']
        return round(average or 0, 1)

    def get_rating_count(self, obj):
        from .models import Review
        return Review.objects.filter(worker__service=obj, worker__approved=True).count()

    class Meta:
        model = Service
        fields = '__all__'


class WorkerSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=1, read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    verified = serializers.BooleanField(source='approved', read_only=True)
    profile_photo = serializers.SerializerMethodField()

    def get_profile_photo(self, obj):
        if not obj.profile_photo:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.profile_photo.url) if request else obj.profile_photo.url

    class Meta:
        model = Worker
        fields = ['id','user','name','phone','service','service_name','available','approved','verified','experience','service_area','skills','bio','profile_photo','average_rating','rating_count']


class BookingSerializer(serializers.ModelSerializer):

    service_name = serializers.CharField(source="service.name", read_only=True)
    worker_name = serializers.CharField(source="worker.name", read_only=True, allow_null=True)
    worker_rating = serializers.DecimalField(source='worker.average_rating', max_digits=3, decimal_places=1, read_only=True, allow_null=True)
    worker_rating_count = serializers.IntegerField(source='worker.rating_count', read_only=True, allow_null=True)
    worker_photo = serializers.SerializerMethodField()
    review = serializers.SerializerMethodField()

    def get_worker_photo(self, obj):
        if not obj.worker or not obj.worker.profile_photo:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.worker.profile_photo.url) if request else obj.worker.profile_photo.url

    def get_review(self, obj):
        try:
            review = obj.review
            return {'id': review.id, 'rating': review.rating, 'comment': review.comment, 'created_at': review.created_at}
        except Review.DoesNotExist:
            return None

    def validate_booking_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError('Choose today or a future date.')
        return value

    def validate_contact_phone(self, value):
        if not value:
            raise serializers.ValidationError('A contact phone number is required.')
        return value

    class Meta:
        model = Booking
        fields = ['id','user','worker','service','service_name','worker_name','worker_rating','worker_rating_count','worker_photo','booking_date','time_slot','address','contact_phone','problem_description','instructions','status','created_at','review']
        read_only_fields = ['user','status','created_at']


class ReviewSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    class Meta:
        model = Review
        fields = ['id','booking','customer','worker','rating','comment','created_at','customer_name']
        read_only_fields = ['booking','customer','worker','created_at']
        extra_kwargs = {'rating': {'min_value': 1, 'max_value': 5}}




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

    def validate_role(self, value):
        if value not in ('USER', 'WORKER'):
            raise serializers.ValidationError('Administrator accounts can only be created by an administrator.')
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters.')
        return value


    
    def create(self, validated_data):

        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)  

        user.save()

        return user
