from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Order
from .serializers import OrderSerializer

# List all orders & Create a new order
class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

# Retrieve, Update, Delete an order
class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Cegah update order jika sudah Completed atau Cancelled
        if instance.status in ['Completed', 'Cancelled']:
            return Response({"error": "Pesanan yang sudah selesai atau dibatalkan tidak bisa diperbarui."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # # Jika status masih Requested dan shipping_cost berubah, ubah ke Processed
        # if 'shipping_cost' in request.data and instance.status == 'Requested':
        #     if instance.shipping_cost > 0:
        #         instance.status = 'Processed'

        # # Validasi sebelum menyelesaikan pesanan
        # if request.data.get('status') == 'Completed' and not instance.payment_method:
        #     return Response({"error": "Metode pembayaran harus diisi sebelum menyelesaikan pesanan."}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
