from django.db.models import Sum
from rest_framework import serializers
from .models import Order, OrderItem, ProductType, ProductStock


class OrderItemSerializer(serializers.ModelSerializer):
    product_type = serializers.PrimaryKeyRelatedField(queryset=ProductType.objects.all())  # Pastikan menggunakan model yang benar

    class Meta:
        model = OrderItem
        fields = ['id', 'product_type', 'quantity', 'total_price']
        read_only_fields = ['total_price'] # Tambahkan product_stock agar tidak bisa diubah setelah dibuat

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'order_no', 'customer_name', 'email', 'phone_number', 
                  'location', 'shipping_cost', 'total_price', 'status', 
                  'payment_method', 'created_at', 'order_items']
        read_only_fields = ['order_no', 'total_price']

    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items', [])

        if not order_items_data:
            raise serializers.ValidationError({"order_items": "Minimal satu item harus dipesan."})

        order_items = []

        # Cek apakah stok cukup untuk setiap item
        for item_data in order_items_data:
            product_type = item_data.pop('product_type')  # Ambil product_type
            product_type_obj = ProductType.objects.get(id=product_type.id)  # Ambil objek

            # Pastikan stok mencukupi
            total_stock = ProductStock.objects.filter(product_type=product_type_obj).aggregate(total=Sum('quantity'))['total'] or 0
            if item_data['quantity'] > total_stock:
                raise serializers.ValidationError({"order_items": f"Stok untuk {product_type_obj} tidak mencukupi."})

            # Jika stok mencukupi, buat objek order_item
            order_item = OrderItem(**item_data)
            order_items.append(order_item)

        # Sekarang buat Order karena kita sudah yakin stoknya cukup
        order = Order.objects.create(**validated_data)

        # Setelah Order dibuat, buat OrderItem dan hitung total harga
        for order_item in order_items:
            order_item.order = order
            order_item.save()  # Simpan OrderItem ke dalam database

        order.total_price = sum(item.total_price for item in order_items) + order.shipping_cost
        order.save()
        return order

    def update(self, instance, validated_data):
        new_status = validated_data.get("status", instance.status)
        payment_method = validated_data.get("payment_method", instance.payment_method)

        if new_status == "Completed" and not payment_method:
            raise serializers.ValidationError(
                {"payment_method": "Metode pembayaran harus diisi sebelum menyelesaikan pesanan."}
            )

        # **🔍 Validasi stok sebelum menyimpan**
        if new_status == "Completed":
            for item in instance.order_items.all():
                total_stock = ProductStock.objects.filter(product_type=item.product_type).aggregate(total=Sum('quantity'))['total'] or 0
                if item.quantity > total_stock:
                    raise serializers.ValidationError(
                        {"error": f"Stok untuk {item.product_type} tidak mencukupi!"}
                    )

        # ✅ Update hanya jika stok cukup
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
