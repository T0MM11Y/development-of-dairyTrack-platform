from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views, views_export

urlpatterns = [
    # ================================ Product Type ========================
    path("product-type", views.ProductTypeCreateView.as_view(), name="product_type_view_create"),
    path("product-type/<int:pk>/", views.ProductTypeRetrieveUpdateDestroyView.as_view(), name="product_type_detail"),

    # ================================ Product Stok ========================
    path("product-stock", views.ProductStockCreateView.as_view(), name="product_stock_view_create"),
    path("product-stock/<int:pk>/", views.ProductStockRetrieveUpdateDestroyView.as_view(), name="product_stock_detail"),
    
    # ================================ Sell Product ========================
    path("sell-product/", views.SellProductView.as_view(), name="sell_product"),

    # ================================ Product History ========================
    path("product-history/", views.StockHistoryCreateView.as_view(), name="product_history_view_create"),
    path("product-history/export/pdf/", views_export.export_pdf, name="product_history_export_pdf"),
    path("product-history/export/excel/", views_export.export_excel, name="product_history_export_excel"),


    # New endpoint for cron job
    path("trigger-cron/", views.trigger_cron, name="trigger-cron"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)