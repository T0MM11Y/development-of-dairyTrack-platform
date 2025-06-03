from django.db import models
from django.utils.timezone import now
from stock.models import User

class ExpenseType(models.Model):
    class Meta:
        db_table = "expense_type"
        managed = False

    objects = models.Manager()
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expense_type_created", null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="expense_type_updated", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"self.name"

class IncomeType(models.Model):
    class Meta:
        db_table = "income_type"
        managed = False

    objects = models.Manager()
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="income_type_created", null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="income_type_updated", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"self.name"

class Expense(models.Model):
    class Meta:
        db_table = "expense"
        managed = False

    objects = models.Manager()
    expense_type = models.ForeignKey(ExpenseType, on_delete=models.CASCADE, related_name="expenses")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    transaction_date = models.DateTimeField(default=now)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expense_created", null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="expense_updated", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Tambahkan ke Finance sebagai expense jika belum ada
        if not Finance.objects.filter(
            description=self.description,
            amount=self.amount,
            transaction_type='expense',
            transaction_date=self.created_at
        ).exists():
            Finance.objects.create(
                transaction_date=self.created_at,
                transaction_type='expense',
                description=f"{self.expense_type.name}: {self.description}",
                amount=self.amount
            )

    def __str__(self):
        return f"{self.expense_type.name} - {self.amount}"

class Income(models.Model):
    class Meta:
        db_table = "income"
        managed = False

    objects = models.Manager()
    income_type = models.ForeignKey(IncomeType, on_delete=models.CASCADE, related_name="incomes")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    transaction_date = models.DateTimeField(default=now)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="income_created", null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="income_updated", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Tambahkan ke Finance sebagai income jika belum ada
        if not Finance.objects.filter(
            description=self.description or f"Income from {self.income_type.name}",
            amount=self.amount,
            transaction_type='income',
            transaction_date=self.created_at
        ).exists():
            Finance.objects.create(
                transaction_date=self.created_at,
                transaction_type='income',
                description=self.description or f"Income from {self.income_type.name}",
                amount=self.amount
            )

    def __str__(self):
        return f"{self.income_type.name} - {self.amount}"

class Finance(models.Model):
    class Meta:
        db_table = "finance"
        managed = False

    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    objects = models.Manager()
    transaction_date = models.DateTimeField(default=now)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.description} - {self.amount}"