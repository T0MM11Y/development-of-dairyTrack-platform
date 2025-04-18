from rest_framework import generics
from .models import Expense, Income, Finance
from .serializers import ExpenseSerializer, IncomeSerializer, FinanceSerializer, SalesTransactionSerializer
from sales.models import SalesTransaction
from django_filters.rest_framework import DjangoFilterBackend # pylint: disable=import-error
from rest_framework import filters
from .filters import FinanceFilter

# ✅ Expense View (Otomatis catat ke Finance)
class ExpenseListCreateView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

# ✅ Income View (Otomatis catat ke Finance)
class IncomeListCreateView(generics.ListCreateAPIView):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer

class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer

# ✅ Sales Transaction View (Otomatis catat ke Income dan Finance)
class SalesTransactionListCreateView(generics.ListCreateAPIView):
    queryset = SalesTransaction.objects.all()
    serializer_class = SalesTransactionSerializer

class SalesTransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SalesTransaction.objects.all()
    serializer_class = SalesTransactionSerializer

# ✅ Finance View (Read Only)
class FinanceListView(generics.ListAPIView):
    queryset = Finance.objects.all()
    serializer_class = FinanceSerializer

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = FinanceFilter
    ordering_fields = ['transaction_date', 'amount']
    ordering = ['-transaction_date']
