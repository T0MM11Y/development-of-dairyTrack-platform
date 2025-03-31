from django.urls import path
from .views import *

urlpatterns = [
    path('health-checks/', HealthCheckListCreateView.as_view(), name='health_checks'),
    path('health-checks/<int:pk>/', HealthCheckDetailView.as_view(), name='health_check_detail'),
    path('symptoms/', SymptomListCreateView.as_view(), name='symptoms'),
    path('symptoms/<int:pk>/', SymptomDetailView.as_view(), name='symptom_detail'),   
    path('disease-history/', DiseaseHistoryListCreateView.as_view(), name='disease_history'),
    path('disease-history/<int:pk>/', DiseaseHistoryDetailView.as_view(), name='disease_history_detail'),
    path('reproduction/', ReproductionListCreateView.as_view(), name='reproduction'),
    path('reproduction/<int:pk>/', ReproductionDetailView.as_view(), name='reproduction_detail'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
]