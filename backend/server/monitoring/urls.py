from django.urls import path
from . import views

urlpatterns = [
    path('system/', views.SystemInfo, name='system_info'),
]