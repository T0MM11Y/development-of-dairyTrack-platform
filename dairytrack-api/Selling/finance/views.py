from rest_framework import generics
from .models import Expense, Income, Finance
from .serializers import ExpenseSerializer, IncomeSerializer, FinanceSerializer, SalesTransactionSerializer
from sales.models import SalesTransaction

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
