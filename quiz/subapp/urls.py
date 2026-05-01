from django.urls import path
from .views import quizz

urlpatterns = [
    path('',quizz),
]