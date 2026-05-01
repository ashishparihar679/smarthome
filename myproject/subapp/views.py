from django.shortcuts import render , redirect
from django.http import HttpResponse
from .models import Student,user_record
from django.contrib.auth import authenticate, login

def user_home(request):
    # if request.method == "POST":
    #     uname = request.POST.get('name')
    #     uage = request.POST.get('age')

    # # # return HttpResponse("Users Sub App")
    # # s = Student(name=uname, age=uage)
    # # s.save()
    # # # return HttpResponse("Student Added")
    # # print("adddddddddddddddddddddddddd")
    #     Student.objects.create(
    #         name=uname,
    #         age=uage
    #     )
    #     return redirect('user_home') 

    stu = Student.objects.all()
    return render(request, 'index.html',{'as':stu})

def add_data(request):
    if request.method == "POST":
        uname = request.POST.get('name')
        uage = request.POST.get('age')
        umobile = request.POST.get('mobile')
        uemail = request.POST.get('email')
        upassword = request.POST.get('password')

        Student.objects.create(
            name=uname,
            age=uage,
            mobile=umobile,
            email=uemail,
            password=upassword
        )
        
        return redirect('user_homeww')
    return render(request,'add.html')
def user_delete(request,id):
    # print(id)
    ob=Student.objects.get(id=id)
    ob.delete()
    return redirect('user_homeww')
def edit_user(request,id):
    ob=Student.objects.get(id=id)
    if request.method == "POST":
        ob.name=request.POST.get('name')
        ob.age = request.POST.get('age')
        ob.mobile = request.POST.get('mobile')
        ob.email = request.POST.get('email')
        ob.password = request.POST.get('password')
        ob.save()
        return redirect('user_homeww')
    return render(request, 'edit.html', {'stu': ob})
def login_u(request):
    if request.method == 'POST':
        u=request.POST.get('nm')
        p=request.POST.get('password')

        try:
            ob=Student.objects.get(email=u,password=p)
            request.session['ob_em']=ob.id
            request.session['ob_id']=ob.name

                    # 🔥 AUTO LOGIN (SESSION)
            request.session['ob_em'] = ob.id
            request.session['ob_id'] = ob.name

            return redirect('dashboard') 
            # return redirect('user_homeww')
        except Student.DoesNotExist:
            return render(request, 'login.html', {
                'error': 'Wrong email or password'
            })

    return render(request, 'login.html')
# def img(request):
def signup_u(request):
    if request.method == "POST":
        name = request.POST.get('name')
        age = request.POST.get('age')
        mobile = request.POST.get('mobile')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # email already exist check
        if Student.objects.filter(email=email).exists():
            return render(request, 'signup.html', {
                'error': 'Email already registered'
            })

        ob = Student.objects.create(
            name=name,
            age=age,
            mobile=mobile,
            email=email,
            password=password
        )

        # 🔥 AUTO LOGIN (SESSION)
        request.session['ob_em'] = ob.id
        request.session['ob_id'] = ob.name

        return redirect('dashboard')   # 👈 dashboard par redirect

    return render(request, 'signup.html')



def dashboard(request):
    if not request.session.get('ob_em'):
        return redirect('login')

    student = Student.objects.get(id=request.session['ob_em'])

    record =user_record.objects.filter(fkey=student).first()


    return render(request, 'dashboard.html', {'student': student , 'record' : record})
def logout_u(request):
    request.session.flush()
    return redirect('login')




def delete_account(request):
    if not request.session.get('ob_em'):
        return redirect('login')

    student = Student.objects.get(id=request.session['ob_em'])

    # related image record delete
    user_record.objects.filter(fkey=student).delete()

    # student delete
    student.delete()

    # logout
    request.session.flush()

    return redirect('login')