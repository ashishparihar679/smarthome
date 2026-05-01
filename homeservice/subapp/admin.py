from django.contrib import admin
from .models import Booking,Worker,Service
# Register your models here.
admin.site.register(Booking)
admin.site.register(Worker)
admin.site.register(Service)