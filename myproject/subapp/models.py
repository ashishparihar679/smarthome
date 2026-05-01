from django.db import models

# Create your models here.
class Student(models.Model):
    name = models.CharField(max_length=50)
    age = models.IntegerField()
    mobile = models.CharField(max_length=50)
    email = models.EmailField()
    password = models.CharField(max_length=50)

    def __str__(self):
        return self.name
class user_record(models.Model):
    fkey=models.ForeignKey(Student,on_delete=models.CASCADE)
    pimage=models.ImageField(upload_to="User_image/")
    address=models.CharField(max_length=50)
    def __str__(self):
        return self.fkey.name