from django.contrib import admin
from django.urls import path, include
from health.views import home

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('health.urls')),  # Pastikan tidak ada 'api/' di health.urls
]
