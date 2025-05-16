from django.db.models import Sum
from rest_framework import serializers
from .models import Order, OrderItem, ProductType, ProductStock
from stock.serializers import ProductTypeSerializer
import logging

logger = logging.getLogger(__name__)

class OrderItemSerializer(serializers.ModelSerializer):
    product_type = serializers.PrimaryKeyRelatedField(
        queryset=ProductType.objects.all(),
        write_only=True
    )
    product_type_detail = ProductTypeSerializer(source='product_type', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_type', 'product_type_detail', 'quantity', 'total_price']
        read_only_fields = ['total_price']

    def create(self, validated_data):
        return OrderItem.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = ['id', 'order_no', 'customer_name', 'email', 'phone_number',
                  'location', 'shipping_cost', 'total_price', 'status',
                  'payment_method', 'created_at', 'order_items', 'notes']
        read_only_fields = ['order_no', 'total_price', 'created_at']

    def create(self, validated_data):
        logger.debug(f"Validated data: {validated_data}")
        validated_data.setdefault('shipping_cost', 0)
        order_items_data = validated_data.pop('order_items', [])
        logger.debug(f"Order items data: {order_items_data}")

        if not order_items_data:
            raise serializers.ValidationError({"order_items": "Minimal satu item harus dipesan."})

        # Merge order_items with the same product_type
        merged_items = {}
        for item_data in order_items_data:
            product_type_id = item_data.get('product_type').id
            quantity = item_data.get('quantity')
            if product_type_id in merged_items:
                merged_items[product_type_id]['quantity'] += quantity
            else:
                merged_items[product_type_id] = {
                    'product_type': item_data.get('product_type'),
                    'quantity': quantity
                }

        order = Order.objects.create(**validated_data)

        for item_data in merged_items.values():
            product_type_obj = item_data.get('product_type')
            logger.debug(f"Product type: {product_type_obj}, price: {product_type_obj.price}")
            if not product_type_obj:
                order.delete()
                raise serializers.ValidationError({"order_items": "Product type tidak valid."})

            total_stock = ProductStock.objects.filter(product_type=product_type_obj).aggregate(total=Sum('quantity'))['total'] or 0
            if item_data['quantity'] > total_stock:
                order.delete()
                raise serializers.ValidationError({"order_items": f"Stok untuk {product_type_obj.product_name} tidak mencukupi."})

            price_per_unit = product_type_obj.price
            logger.debug(f"Creating OrderItem: product_type={product_type_obj}, price_per_unit={price_per_unit}, quantity={item_data.get('quantity')}")
            OrderItem.objects.create(
                order=order,
                product_type=product_type_obj,
                quantity=item_data.get('quantity'),
                price_per_unit=price_per_unit
            )

        order.update_total_price()
        order.refresh_from_db()
        logger.info(f"Order created: {order.order_no}, total_price={order.total_price}")

        if order.phone_number and order.status == 'Requested':
            try:
                order.send_order_details_to_whatsapp()
            except Exception as e:
                logger.error(f"Failed to send WhatsApp message for order {order.order_no}: {str(e)}")

        return order

    def update(self, instance, validated_data):
        # Ambil data order_items dari validated_data jika ada
        order_items_data = validated_data.pop('order_items', None)
        new_status = validated_data.get("status", instance.status)
        payment_method = validated_data.get("payment_method", instance.payment_method)

        # Validasi status Completed
        if new_status == "Completed" and not payment_method:
            raise serializers.ValidationError(
                {"payment_method": "Metode pembayaran harus diisi sebelum menyelesaikan pesanan."}
            )

        # Perbarui atribut lain dari Order
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Tangani pembaruan order_items jika ada
        if order_items_data is not None:
            # Hapus semua order_items yang ada
            instance.order_items.all().delete()

            # Gabungkan order_items dengan product_type yang sama
            merged_items = {}
            for item_data in order_items_data:
                product_type_id = item_data.get('product_type').id
                quantity = item_data.get('quantity')
                if product_type_id in merged_items:
                    merged_items[product_type_id]['quantity'] += quantity
                else:
                    merged_items[product_type_id] = {
                        'product_type': item_data.get('product_type'),
                        'quantity': quantity
                    }

            # Validasi stok dan buat OrderItem baru
            for item_data in merged_items.values():
                product_type_obj = item_data.get('product_type')
                if not product_type_obj:
                    raise serializers.ValidationError({"order_items": "Product type tidak valid."})

                # Validasi stok
                total_stock = ProductStock.objects.filter(product_type=product_type_obj).aggregate(total=Sum('quantity'))['total'] or 0
                if item_data['quantity'] > total_stock:
                    raise serializers.ValidationError(
                        {"order_items": f"Stok untuk {product_type_obj.product_name} tidak mencukupi."}
                    )

                # Buat OrderItem baru
                price_per_unit = product_type_obj.price
                OrderItem.objects.create(
                    order=instance,
                    product_type=product_type_obj,
                    quantity=item_data.get('quantity'),
                    price_per_unit=price_per_unit
                )

        instance.save()
        instance.update_total_price()
        instance.refresh_from_db()
        return instance