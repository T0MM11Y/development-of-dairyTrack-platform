# stock/views.py
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, serializers
from .serializers import ProductTypeSerializer, ProductStockSerializer, StockHistorySerializer
from .models import ProductType, ProductStock, StockHistory
from django_filters.rest_framework import DjangoFilterBackend # pylint: disable=import-error
from rest_framework import filters
from .filters import StockHistoryFilter


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .tasks import check_product_expiration
from rest_framework import filters
import logging

logger = logging.getLogger('stock')

# Untuk list & create ProductType (tanpa `pk`)
class ProductTypeCreateView(generics.ListCreateAPIView):
    queryset = ProductType.objects.all()
    serializer_class = ProductTypeSerializer

    def perform_create(self, serializer):
        try:
            instance = serializer.save()
            return Response({
                "message": "ProductType created successfully!",
                "data": ProductTypeSerializer(instance).data
            }, status=201)
        except serializers.ValidationError as e:
            # Return error dictionary as-is
            return Response(e.detail, status=400)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.perform_create(serializer)

# Untuk retrieve, update, dan delete ProductType (dengan `pk`)
class ProductTypeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductType.objects.all()
    serializer_class = ProductTypeSerializer

    def perform_update(self, serializer):
        try:
            instance = serializer.save()
            return Response({
                "message": "ProductType updated successfully!",
                "data": ProductTypeSerializer(instance).data
            }, status=200)
        except serializers.ValidationError as e:
            # Return error dictionary as-is
            return Response(e.detail, status=400)

    def perform_destroy(self, instance):
        try:
            instance.delete()
            return Response({
                "message": "ProductType deleted successfully!"
            }, status=204)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=400)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        return self.perform_update(serializer)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        return self.perform_destroy(instance)

# Untuk list & create ProductStock
class ProductStockCreateView(generics.ListCreateAPIView):
    queryset = ProductStock.objects.all()
    serializer_class = ProductStockSerializer

    def perform_create(self, serializer):
        try:
            product_stock = serializer.save()
            product_stock.deduct_milk_batch()
            if product_stock.expiry_at < timezone.now():
                product_stock.status = "expired"
                product_stock.quantity = 0
                StockHistory.objects.create(
                    product_stock=product_stock,
                    change_type="expired",
                    quantity_change=product_stock.quantity
                )
                product_stock.save()
                return Response({
                    "message": "ProductStock created successfully but marked as expired!",
                    "data": ProductStockSerializer(product_stock).data
                }, status=201)
            return Response({
                "message": "ProductStock created successfully!",
                "data": ProductStockSerializer(product_stock).data
            }, status=201)
        except ValidationError as e:
            return Response({
                "error": str(e)
            }, status=400)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.perform_create(serializer)

# Untuk retrieve, update, dan delete ProductStock
class ProductStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductStock.objects.all()
    serializer_class = ProductStockSerializer

    def perform_update(self, serializer):
        try:
            instance = serializer.save()
            return Response({
                "message": "ProductStock updated successfully!",
                "data": ProductStockSerializer(instance).data
            }, status=200)
        except serializers.ValidationError as e:
            return Response({
                "error": str(e)
            }, status=400)

    def perform_destroy(self, instance):
        try:
            instance.delete()
            return Response({
                "message": "ProductStock deleted successfully!"
            }, status=204)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=400)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        return self.perform_update(serializer)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        return self.perform_destroy(instance)

# Untuk list & create StockHistory
class StockHistoryCreateView(generics.ListCreateAPIView):
    queryset = StockHistory.objects.all()
    serializer_class = StockHistorySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = StockHistoryFilter
    ordering_fields = ['change_date']
    ordering = ['-change_date']

    def perform_create(self, serializer):
        try:
            instance = serializer.save()
            return Response({
                "message": "StockHistory created successfully!",
                "data": StockHistorySerializer(instance).data
            }, status=201)
        except serializers.ValidationError as e:
            return Response({
                "error": str(e)
            }, status=400)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.perform_create(serializer)

# API untuk menjual produk
class SellProductView(APIView):
    def post(self, request):
        product_type_id = request.data.get("product_type_id")
        quantity = request.data.get("quantity")

        if not product_type_id or not quantity:
            return Response({
                "error": "product_type_id and quantity are required!"
            }, status=400)

        product_type = get_object_or_404(ProductType, id=product_type_id)
        try:
            stock_usage = ProductStock.sell_product(product_type, quantity)
            return Response({
                "message": "Product sold successfully!",
                "data": stock_usage
            }, status=200)
        except ValidationError as e:
            return Response({
                "error": str(e)
            }, status=400)
        

        # Endpoint untuk cron-job.org
@csrf_exempt
@require_POST
def trigger_cron(request):
    """
    Endpoint untuk cron-job.org untuk menjalankan pengecekan stok kadaluarsa.
    """
    try:
        logger.info("Cron trigger endpoint called at %s WIB", timezone.now().astimezone(timezone.get_current_timezone()))
        check_product_expiration()
        logger.info("Cron job completed successfully")
        return JsonResponse({'status': 'success', 'message': 'Expiration check completed'}, status=200)
    except Exception as e:
        logger.error("Error in cron trigger: %s", str(e), exc_info=True)
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        