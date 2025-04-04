from rest_framework import serializers
from .models import RawMilk, ProductType, ProductStock, StockHistory

class RawMilkSerializer(serializers.ModelSerializer):

    class Meta:
        model = RawMilk
        fields = ['cow_id', 'production_time', 'expiration_time', 'available_stocks', 'previous_volume', 'status', 'daily_total_id', 'session', 'volume_liters']


class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = '__all__'


class ProductStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductStock
        fields = '__all__'
        read_only_fields = ['quantity']  # Quantity tidak perlu diisi user

    def create(self, validated_data):
        # Set quantity sama dengan initial_quantity
        validated_data['quantity'] = validated_data['initial_quantity']
        return super().create(validated_data)


class StockHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockHistory
        fields = ['change_type', 'quantity_change', 'product_stock', 'total_price', 'change_date']