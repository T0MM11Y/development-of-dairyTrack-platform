from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

# Create your views here.
from rest_framework import generics, serializers
from .serializers import RawMilkSerializer, ProductTypeSerializer, ProductStockSerializer, StockHistorySerializer
from .models import RawMilk, ProductType, ProductStock, StockHistory

# Create filtering
from django_filters.rest_framework import DjangoFilterBackend # pylint: disable=import-error
from rest_framework import filters
from .filters import StockHistoryFilter


# Untuk list & create RawMilk (tanpa `pk`)
class RawMilkListCreateView(generics.ListCreateAPIView):
    queryset = RawMilk.objects.all()
    serializer_class = RawMilkSerializer

# Untuk retrieve, update, dan delete RawMilk (dengan `pk`)
class RawMilkRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RawMilk.objects.all()
    serializer_class = RawMilkSerializer

# Untuk list & create ProductType (tanpa `pk`)
class ProductTypeCreateView(generics.ListCreateAPIView):
    queryset = ProductType.objects.all()
    serializer_class = ProductTypeSerializer

# Untuk retrieve, update, dan delete ProductType (dengan `pk`)
class ProductTypeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductType.objects.all()
    serializer_class = ProductTypeSerializer

class ProductStockCreateView(generics.ListCreateAPIView):
    queryset = ProductStock.objects.all()
    serializer_class = ProductStockSerializer

    def perform_create(self, serializer):
        """Kurangi RawMilk dan cek status expired saat ProductStock dibuat"""
        product_stock = serializer.save()

        try:
            product_stock.deduct_raw_milk()
            if product_stock.expiry_at < timezone.now():
                product_stock.status = "expired"
                product_stock.quantity = 0
                StockHistory.objects.create(
                    product_stock=product_stock,
                    change_type="expired",
                    quantity_change=product_stock.quantity
                )
                product_stock.save()

        except Exception as e:
            raise serializers.ValidationError({"error": str(e)})

class ProductStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductStock.objects.all()
    serializer_class = ProductStockSerializer

class StockHistoryCreateView(generics.ListCreateAPIView):
    queryset = StockHistory.objects.all()
    serializer_class = StockHistorySerializer

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = StockHistoryFilter
    ordering_fields = ['change_date']
    ordering = ['-change_date']  # default: terbaru duluan

# API untuk menjual produk
class SellProductView(APIView):
    def post(self, request):
        product_type_id = request.data.get("product_type_id")
        quantity = request.data.get("quantity")

        product_type = get_object_or_404(ProductType, id=product_type_id)  # Gunakan get_object_or_404 untuk menangani error
        try:
            ProductStock.sell_product(product_type, quantity)
            return Response({"message": "Produk berhasil dijual!"})
        except ValidationError as e:
            return Response({"error": str(e)}, status=400)