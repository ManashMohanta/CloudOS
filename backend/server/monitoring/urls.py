from django.urls import path
from . import views

urlpatterns = [

    # System APIs
    path('system/', views.SystemInfo, name='system_info'),
    path('metrics/', views.SystemMetrics, name='system_metrics'),

    # Server Management APIs
    path('servers/', views.ServerList, name='server_list'),
    path('servers/<int:pk>/', views.ServerDetail, name='server_detail'),
    path('servers/<int:pk>/health/', views.ServerHealth, name='server_health'),
]