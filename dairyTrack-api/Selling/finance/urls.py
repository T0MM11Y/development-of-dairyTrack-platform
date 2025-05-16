from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    ExpenseListCreateView, ExpenseRetrieveUpdateDestroyView,
    IncomeListCreateView, IncomeRetrieveUpdateDestroyView,
    SalesTransactionListCreateView, SalesTransactionRetrieveUpdateDestroyView,
    FinanceListView,
    ExpenseTypeListCreateView, ExpenseTypeRetrieveUpdateDestroyView,
    IncomeTypeListCreateView, IncomeTypeRetrieveUpdateDestroyView,
)
from . import views_export

urlpatterns = [
    path('expense-types/', ExpenseTypeListCreateView.as_view(), name='expense-type-list'),
    path('expense-types/<int:pk>/', ExpenseTypeRetrieveUpdateDestroyView.as_view(), name='expense-type-detail'),
    
    path('income-types/', IncomeTypeListCreateView.as_view(), name='income-type-list'),
    path('income-types/<int:pk>/', IncomeTypeRetrieveUpdateDestroyView.as_view(), name='income-type-detail'),
    
    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list'),
    path('expenses/<int:pk>/', ExpenseRetrieveUpdateDestroyView.as_view(), name='expense-detail'),
    
    path('incomes/', IncomeListCreateView.as_view(), name='income-list'),
    path('incomes/<int:pk>/', IncomeRetrieveUpdateDestroyView.as_view(), name='income-detail'),
    
    path('sales-transactions/', SalesTransactionListCreateView.as_view(), name='sales-transaction-list'),
    path('sales-transactions/<int:pk>/', SalesTransactionRetrieveUpdateDestroyView.as_view(), name='sales-transaction-detail'),
    
    path('finance/', FinanceListView.as_view(), name='finance-list'),
    
    path('export/pdf/', views_export.export_finance_pdf, name='export_finance_pdf'),
    path('export/excel/', views_export.export_finance_excel, name='export_finance_excel'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)