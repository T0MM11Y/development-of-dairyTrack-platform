from rest_framework import serializers
from django.conf import settings
from .models import ProductType, ProductStock, StockHistory, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'role_id']

class ProductTypeSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    updated_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    updated_by_detail = UserSerializer(source='updated_by', read_only=True)

    class Meta:
        model = ProductType
        fields = ['id', 'product_name', 'product_description', 'image', 'price', 'unit', 
                  'created_at', 'updated_at', 'created_by', 'updated_by', 
                  'created_by_detail', 'updated_by_detail']

    def to_internal_value(self, data):
        data = data.copy()
        
        if 'created_by' in data and isinstance(data['created_by'], str):
            try:
                data['created_by'] = int(data['created_by'])
            except ValueError:
                raise serializers.ValidationError({"created_by": "Invalid user ID format. Must be an integer or valid string representation of an integer."})

        if 'updated_by' in data and isinstance(data['updated_by'], str):
            try:
                data['updated_by'] = int(data['updated_by']) if data['updated_by'] else None
            except ValueError:
                raise serializers.ValidationError({"updated_by": "Invalid user ID format. Must be an integer or valid string representation of an integer."})

        return super().to_internal_value(data)

    def validate_created_by(self, value):
        if not User.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("User does not exist!")
        return value

    def validate_updated_by(self, value):
        if value and not User.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("User does not exist!")
        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and request:
            representation['image'] = request.build_absolute_uri(f"{settings.MEDIA_URL}{instance.image}")
        else:
            representation['image'] = None
        representation['created_by'] = representation.pop('created_by_detail')
        representation['updated_by'] = representation.pop('updated_by_detail')
        return representation

class ProductStockSerializer(serializers.ModelSerializer):
    product_type_detail = serializers.SerializerMethodField()
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    updated_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    updated_by_detail = UserSerializer(source='updated_by', read_only=True)

    class Meta:
        model = ProductStock
        fields = ['id', 'product_type', 'product_type_detail', 'initial_quantity', 'quantity',
                  'production_at', 'expiry_at', 'status', 'total_milk_used', 'created_at', 
                  'updated_at', 'created_by', 'updated_by', 'created_by_detail', 'updated_by_detail']
        read_only_fields = ['quantity']

    def to_internal_value(self, data):
        data = data.copy()
        
        if 'created_by' in data and isinstance(data['created_by'], str):
            try:
                data['created_by'] = int(data['created_by'])
            except ValueError:
                raise serializers.ValidationError({"created_by": "Invalid user ID format. Must be an integer or valid string representation of an integer."})

        if 'updated_by' in data and isinstance(data['updated_by'], str):
            try:
                data['updated_by'] = int(data['updated_by']) if data['updated_by'] else None
            except ValueError:
                raise serializers.ValidationError({"updated_by": "Invalid user ID format. Must be an integer or valid string representation of an integer."})

        return super().to_internal_value(data)

    def validate_created_by(self, value):
        if not User.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("User does not exist!")
        return value

    def validate_updated_by(self, value):
        if value and not User.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("User does not exist!")
        return value

    def get_product_type_detail(self, obj):
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
        validated_data['quantity'] = validated_data['initial_quantity']
        return super().create(validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['created_by'] = representation.pop('created_by_detail')
        representation['updated_by'] = representation.pop('updated_by_detail')
        return representation

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