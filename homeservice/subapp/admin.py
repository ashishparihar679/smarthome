from django.contrib import admin
from .models import Booking,Worker,Service,Review
# Register your models here.
admin.site.register(Booking)
admin.site.register(Worker)
admin.site.register(Service)
admin.site.register(Review)
