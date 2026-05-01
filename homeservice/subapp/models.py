from django.db import models
from django.contrib.auth.models import AbstractUser


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

class Worker(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    available = models.BooleanField(default=True)
    approved = models.BooleanField(default=False)
    



class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)

    booking_date = models.DateField()
    address = models.CharField(max_length=255)

    STATUS = (
        ('PENDING','Pending'),
        ('ACCEPTED','Accepted'),
        ('COMPLETED','Completed'),
        ('REJECTED','Rejected'),
    )
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')

    created_at = models.DateTimeField(auto_now_add=True)
