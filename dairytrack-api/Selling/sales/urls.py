from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

urlpatterns = [
    path('orders/', views.OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),

    # GET /orders/ → List semua order.

    # POST /orders/ → Membuat order baru.
    
    #     {
    #     "customer_name": "Kenan Tomfie Bukit",
    #     "email": "kenan@example.com",
    #     "phone_number": "08123456789",
    #     "location": "Jakarta",
    #     "shipping_cost": 5000,
    #     "order_items": [
    #         {
    #             "product_type": 1,
    #             "quantity": 2,
    #             "price_per_unit": 10000
    #         },
    #         {
    #             "product_type": 2,
    #             "quantity": 1,
    #             "price_per_unit": 5000
    #         }
    #     ]
    # }


    # GET /orders/{id}/ → Melihat detail order tertentu.

    # PUT/PATCH /orders/{id}/ → Mengupdate order (contohnya menambah biaya pengiriman).

    # DELETE /orders/{id}/ → Menghapus order.
]

    # Menyajikan file media hanya dalam mode DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
