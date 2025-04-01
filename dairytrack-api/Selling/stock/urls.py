from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

urlpatterns = [
    
    # ================================ RAW MILK ========================
    path("raw-milk", views.RawMilkListCreateView.as_view(), name="rawmilk_view_create"), # GET (all) & POST
    path("raw-milk/<int:pk>/", views.RawMilkRetrieveUpdateDestroyView.as_view(), name="rawmilk_detail"), # GET (one), PUT, PATCH, DELETE
    
    # GET	/rawmilk/	Ambil semua data RawMilk
    # POST	/rawmilk/	Tambah data baru
    # GET	/rawmilk/1/	Ambil data dengan id=1
    # PUT	/rawmilk/1/	Update seluruh data id=1
    # PATCH	/rawmilk/1/	Update sebagian data id=1
    # DELETE	/rawmilk/1/	Hapus data id=1
    # ==================================================================


    # ================================ Product Type ========================
    path("product-type", views.ProductTypeCreateView.as_view(), name="product_type_view_create"), # GET (all) & POST
    path("product-type/<int:pk>/", views.ProductTypeRetrieveUpdateDestroyView.as_view(), name="product_type_detail"), # GET (one), PUT, PATCH, DELETE


    # ================================ Product Stok ========================
    path("product-stock", views.ProductStockCreateView.as_view(), name="product_stock_view_create"), # GET (all) & POST
    path("product-stock/<int:pk>/", views.ProductStockRetrieveUpdateDestroyView.as_view(), name="product_stock_detail"), # GET (one), PUT, PATCH, DELETE
    
    
    # ================================ Sell Product ========================
    path("sell-product/", views.SellProductView.as_view(), name="sell_product"),
    # Cara menggunakna metode post
    #  {
    #     "product_type_id": 1,
    #     "quantity": 5
    # }



    # ================================ Product History ========================
    path("product-history", views.StockHistoryCreateView.as_view(), name="product_history_view_create"), # GET (all) & POST
]
    # Menyajikan file media hanya dalam mode DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
