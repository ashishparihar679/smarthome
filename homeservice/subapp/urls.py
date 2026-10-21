from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [

    path('services/', views.services),
    path('services/delete/<int:id>/', views.delete_service),
    path('cities/', views.cities),
    path('cities/delete/<int:id>/', views.delete_city),

    path('workers/', views.workers),

    path('bookings/', views.create_booking),
    path('bookings/<int:id>/review/', views.create_review),
    path('professionals/<int:id>/reviews/', views.worker_reviews),
    

    path('worker/bookings/', views.worker_bookings),

    path('booking/accept/<int:id>/', views.accept_booking),

    path('booking/reject/<int:id>/', views.reject_booking),

    path('booking/complete/<int:id>/', views.complete_booking),
    path('booking/start/<int:id>/', views.start_booking),

    path('register/', views.register),
    path('login/', views.login),
    path('worker/approve/<int:id>/', views.approve_worker),
    path('worker/availability/<int:id>/', views.toggle_worker_availability),
    path('user/profile/<int:id>/', views.user_profile),

    path('user/profile/<int:id>/',views.user_profile),
path('booking/cancel/<int:id>/',views.cancel_booking),

path("users/",views.all_users),
path("user/add/",views.add_user),
path("user/update/<int:id>/",views.update_user),
path("user/delete/<int:id>/",views.delete_user),

    # path('login/', TokenObtainPairView.as_view()),
    # path('refresh/', TokenRefreshView.as_view()),

]
