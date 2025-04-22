from rest_framework import serializers
from django.conf import settings  # Untuk mengakses settings.MEDIA_URL
from .models import RawMilk, ProductType, ProductStock, StockHistory

class RawMilkSerializer(serializers.ModelSerializer):

    class Meta:
        model = RawMilk
        fields = ['cow_id', 'production_time', 'expiration_time', 'available_stocks', 'previous_volume', 'status', 'daily_total_id', 'session', 'volume_liters']


class ProductTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductType
        fields = '__all__'

    def to_representation(self, instance):
        # Override untuk menangani image URL dengan domain lengkap
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and request:
            representation['image'] = request.build_absolute_uri(f"{settings.MEDIA_URL}{instance.image}")
        else:
            representation['image'] = None
        return representation


class ProductStockSerializer(serializers.ModelSerializer):
    product_type_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductStock
        fields = ['id', 'product_type', 'product_type_detail', 'initial_quantity', 'quantity', 
                  'production_at', 'expiry_at', 'status', 'total_milk_used', 'created_at', 'updated_at']
        read_only_fields = ['quantity']  # Quantity tidak perlu diisi user

    def get_product_type_detail(self, obj):
        # Mengembalikan data ProductType yang terkait dengan penanganan image URL
        product_type = obj.product_type
        request = self.context.get('request')
        image_url = None
        if product_type.image and request:
            image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{product_type.image}")
        
        return {
            'id': product_type.id,
            'product_name': product_type.product_name,
            'product_description': product_type.product_description,
            'price': str(product_type.price),
            'unit': product_type.unit,
            'image': image_url
        }
    def create(self, validated_data):
        # Set quantity sama dengan initial_quantity
        validated_data['quantity'] = validated_data['initial_quantity']
        return super().create(validated_data)

class StockHistorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product_stock.product_type.product_name', read_only=True)
    unit = serializers.CharField(source='product_stock.product_type.unit', read_only=True)

    class Meta:
        model = StockHistory
        fields = [
            'change_type',
            'quantity_change',
            'product_stock',
            'product_name',
            'unit',
            'total_price',
            'change_date'
        ]


# class StockHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = StockHistory
#         fields = ['change_type', 'quantity_change', 'product_stock', 'total_price', 'change_date']