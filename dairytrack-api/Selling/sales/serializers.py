from django.db.models import Sum
from rest_framework import serializers
from .models import Order, OrderItem, ProductType, ProductStock
from stock.serializers import ProductTypeSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    # product_type = serializers.PrimaryKeyRelatedField(queryset=ProductType.objects.all())  # Pastikan menggunakan model yang benar
    product_type = ProductTypeSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_type', 'quantity', 'total_price']
        read_only_fields = ['total_price'] # Tambahkan product_stock agar tidak bisa diubah setelah dibuat

    # Override untuk menangani penulisan (write) product_type saat create/update
    def create(self, validated_data):
        # Saat create, product_type diharapkan sebagai objek (bukan hanya ID)
        return OrderItem.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class OrderSerializer(serializers.ModelSerializer):
    # Remove read_only=True so we can accept nested order items in create
    order_items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = ['id', 'order_no', 'customer_name', 'email', 'phone_number', 
                  'location', 'shipping_cost', 'total_price', 'status', 
                  'payment_method', 'created_at', 'order_items']
        read_only_fields = ['order_no', 'total_price']

        # Move create method outside of Meta class
    def create(self, validated_data):

        # Pastikan shipping_cost bisa kosong saat dibuat
        validated_data.setdefault('shipping_cost', 0)

        order_items_data = validated_data.pop('order_items', [])
        
        if not order_items_data:
            raise serializers.ValidationError({"order_items": "Minimal satu item harus dipesan."})
        
        # Create the order first
        order = Order.objects.create(**validated_data)
        
        # Create each order item with proper product_type assignment
        for item_data in order_items_data:
            product_type_obj = item_data.get('product_type')
            
            # Pastikan stok mencukupi
            total_stock = ProductStock.objects.filter(product_type=product_type_obj).aggregate(total=Sum('quantity'))['total'] or 0
            if item_data['quantity'] > total_stock:
                # If stock insufficient, delete the order and raise error
                order.delete()
                raise serializers.ValidationError({"order_items": f"Stok untuk {product_type_obj} tidak mencukupi."})
            
            # Create order item with price_per_unit explicitly set
            # This is critical because OrderItem.save() uses this value to calculate total_price
            price_per_unit = product_type_obj.price  # Get price from product_type
            
            OrderItem.objects.create(
                order=order,
                product_type=product_type_obj,
                quantity=item_data.get('quantity'),
                price_per_unit=price_per_unit  # Explicitly set price_per_unit
            )
        
        # Manually update the total price to ensure it's calculated
        order.update_total_price()
        
        # Refresh order to get updated values
        order.refresh_from_db()
        return order


    def update(self, instance, validated_data):
        # Ambil data shipping cost saat ini dan yang baru
        current_shipping_cost = instance.shipping_cost
        new_shipping_cost = validated_data.get("shipping_cost", current_shipping_cost)
        shipping_cost_changed = current_shipping_cost != new_shipping_cost
        
        # Jika shipping cost diubah dari 0 ke nilai yang lebih besar dan status masih 'Requested'
        if shipping_cost_changed and instance.status == 'Requested':
            validated_data['status'] = 'Processed'  # Set status menjadi 'Processed'
        
        new_status = validated_data.get("status", instance.status)
        payment_method = validated_data.get("payment_method", instance.payment_method)

        if new_status == "Completed" and not payment_method:
            raise serializers.ValidationError(
                {"payment_method": "Metode pembayaran harus diisi sebelum menyelesaikan pesanan."}
            )

        # Validasi stok sebelum menyimpan
        if new_status == "Completed":
            for item in instance.order_items.all():
                total_stock = ProductStock.objects.filter(product_type=item.product_type).aggregate(total=Sum('quantity'))['total'] or 0
                if item.quantity > total_stock:
                    raise serializers.ValidationError(
                        {"error": f"Stok untuk {item.product_type} tidak mencukupi!"}
                    )

        # Update attributes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Save instance akan memicu method save() di model
        # yang akan otomatis mengupdate total_price juga
        instance.save()
        
        # Refresh instance dari database untuk mendapatkan nilai terbaru
        instance.refresh_from_db()
        return instance
