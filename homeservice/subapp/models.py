from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver


class User(AbstractUser):
    ROLE_CHOICES = (
        ('USER','User'),
        ('WORKER','Worker'),
        ('ADMIN','Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='USER')
    phone = models.CharField(max_length=15)

class Service(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class City(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Worker(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='worker_profile')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    experience = models.PositiveSmallIntegerField(default=0)
    service_area = models.CharField(max_length=120, blank=True)
    skills = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    profile_photo = models.ImageField(upload_to='professionals/', blank=True, null=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    available = models.BooleanField(default=True)
    approved = models.BooleanField(default=False)
    



class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)

    booking_date = models.DateField()
    time_slot = models.CharField(max_length=40, blank=True)
    address = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=15, blank=True)
    problem_description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)

    STATUS = (
        ('PENDING','Pending'),
        ('ACCEPTED','Accepted'),
        ('COMPLETED','Completed'),
        ('REJECTED','Rejected'),
        ('IN_PROGRESS','In Progress'),
        ('CANCELLED','Cancelled'),
    )
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')

    created_at = models.DateTimeField(auto_now_add=True)


class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @staticmethod
    def refresh_worker_rating(worker_id):
        from django.db.models import Avg, Count
        summary = Review.objects.filter(worker_id=worker_id).aggregate(avg=Avg('rating'), count=Count('id'))
        Worker.objects.filter(id=worker_id).update(
            average_rating=round(summary['avg'] or 0, 1), rating_count=summary['count'] or 0
        )

    def __str__(self):
        return f'{self.rating}/5 for booking {self.booking_id}'


@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_worker_rating_summary(sender, instance, **kwargs):
    Review.refresh_worker_rating(instance.worker_id)
