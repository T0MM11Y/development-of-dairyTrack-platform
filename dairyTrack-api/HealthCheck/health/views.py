from rest_framework import generics
from .models import *
from .serializers import *
from django.http import JsonResponse
from .models import Reproduction
from .serializers import (
    ReproductionListSerializer,
    ReproductionCreateSerializer,
    ReproductionUpdateSerializer
)


def home(request):
    return JsonResponse({"message": "Welcome to Cattle Health API!"})

# ✅ HealthCheck - create & list
class HealthCheckListCreateView(generics.ListCreateAPIView):
    queryset = HealthCheck.objects.select_related("cow").all().order_by("-created_at")

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return HealthCheckCreateSerializer
        return HealthCheckListSerializer

class HealthCheckDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HealthCheck.objects.select_related("cow").all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return HealthCheckEditSerializer  # ✅ gunakan serializer untuk edit
        return HealthCheckListSerializer  # ✅ gunakan serializer list/detail



# ✅ CRUD untuk Symptoms
class SymptomListCreateView(generics.ListCreateAPIView):
    queryset = Symptom.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SymptomReadSerializer
        return SymptomCreateSerializer  # jika kamu pakai create serializer


class SymptomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Symptom.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SymptomReadSerializer
        return SymptomWriteSerializer



# ✅ CRUD untuk DiseaseHistory
class DiseaseHistoryListCreateView(generics.ListCreateAPIView):
    queryset = DiseaseHistory.objects.select_related("health_check").all().order_by("-created_at")

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DiseaseHistoryCreateSerializer
        return DiseaseHistoryListSerializer


class DiseaseHistoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiseaseHistory.objects.select_related("health_check").all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DiseaseHistoryUpdateSerializer  # ✅ gunakan serializer edit
        return DiseaseHistoryListSerializer



# ✅ List dan Create
class ReproductionListCreateView(generics.ListCreateAPIView):
    queryset = Reproduction.objects.select_related("cow").all().order_by("-recorded_at")

    def get_serializer_class(self):
        if self.request.method == 'POST':
                    return ReproductionCreateSerializer
        return ReproductionListSerializer


# ✅ Detail, Update, Delete
class ReproductionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reproduction.objects.select_related("cow").all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return  ReproductionUpdateSerializer
        return ReproductionListSerializer

class NotificationListView(generics.ListAPIView):
    queryset = Notification.objects.all().order_by('-created_at')  # ✅ Urutkan berdasarkan waktu dibuat
    serializer_class = NotificationSerializer