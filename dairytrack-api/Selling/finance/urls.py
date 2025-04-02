from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    ExpenseListCreateView, ExpenseDetailView,
    IncomeListCreateView, IncomeDetailView,
    SalesTransactionListCreateView, SalesTransactionDetailView,
    FinanceListView
)

urlpatterns = [
    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),

    path('incomes/', IncomeListCreateView.as_view(), name='income-list'),
    path('incomes/<int:pk>/', IncomeDetailView.as_view(), name='income-detail'),

    path('sales-transactions/', SalesTransactionListCreateView.as_view(), name='sales-transaction-list'),
    path('sales-transactions/<int:pk>/', SalesTransactionDetailView.as_view(), name='sales-transaction-detail'),

    path('finance/', FinanceListView.as_view(), name='finance-list'),
]

    # Menyajikan file media hanya dalam mode DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
