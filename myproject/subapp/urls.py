from django.urls import path
# from . import views

from .views import user_home,add_data,user_delete,edit_user,login_u,signup_u,dashboard,logout_u,delete_account

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('show', user_home, name='user_homeww'),
    path('addd', add_data, name='add_data'),
    path('delete/<int:id>/', user_delete, name='delete_user'),
    path('edit/<int:id>/', edit_user, name='user_edit'),
    path('', login_u, name='login'),
    # path('show', views.user_home name='user_homeww')
    path('signup/', signup_u, name='signup'),
    path('dashboard/', dashboard, name='dashboard'),
    path('logout/', logout_u, name='logout'),
    path('delete-account/', delete_account, name='delete_account'),

 

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
