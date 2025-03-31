from rest_framework import generics
from .models import *
from .serializers import *
from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Welcome to Cattle Health API!"})

# ✅ CRUD untuk HealthCheck
class HealthCheckListCreateView(generics.ListCreateAPIView):
    queryset = HealthCheck.objects.all()
    serializer_class = HealthCheckSerializer

class HealthCheckDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HealthCheck.objects.all()
    serializer_class = HealthCheckSerializer

# ✅ CRUD untuk Symptoms
class SymptomListCreateView(generics.ListCreateAPIView):
    queryset = Symptom.objects.all()
    serializer_class = SymptomSerializer

class SymptomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Symptom.objects.all()
    serializer_class = SymptomSerializer

# ✅ CRUD untuk DiseaseHistory
class DiseaseHistoryListCreateView(generics.ListCreateAPIView):
    queryset = DiseaseHistory.objects.all()
    serializer_class = DiseaseHistorySerializer

class DiseaseHistoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiseaseHistory.objects.all()
    serializer_class = DiseaseHistorySerializer

# ✅ CRUD untuk Reproduction
class ReproductionListCreateView(generics.ListCreateAPIView):
    queryset = Reproduction.objects.all()
    serializer_class = ReproductionSerializer

class ReproductionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reproduction.objects.all()
    serializer_class = ReproductionSerializer

class NotificationListView(generics.ListAPIView):
    queryset = Notification.objects.all().order_by('-notification_date')
    serializer_class = NotificationSerializer