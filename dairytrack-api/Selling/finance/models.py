from django.db import models
from django.utils.timezone import now  

# kemudian bagaimana caranya agar ketika ada expense maka data juga akan tertambah ke dalam finance
class Expense(models.Model):
    
    class Meta:
        db_table = "expense"
    
    EXPENSE_TYPES = [
        ('material_purchase', 'Material Purchase'),
        ('feed_purchase', 'Feed Purchase'),
        ('medicine_purchase', 'Medicine Purchase'),
        ('employee_salary', 'Employee Salary'),
        ('operational', 'Operational'),
        ('equipment_purchase', 'Equipment Purchase'),
        ('marketing', 'Marketing'),
        ('other', 'Other'),
    ]

    objects = models.Manager()
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    transaction_date = models.DateTimeField(default=now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Tambahkan ke Finance sebagai income jika belum ada
        if not Finance.objects.filter(description=self.description, amount=self.amount).exists():
            Finance.objects.create(
                transaction_date=self.created_at,
                transaction_type='expense',
                description=self.description, 
                amount=self.amount
            )

    def __str__(self):
        return f"{self.expense_type} - {self.amount}"



class Income(models.Model):
    
    class Meta:
        db_table = "income"
    
    INCOME_TYPES = [
        ('sales', 'Sales'),
        ('investment', 'Investment'),
        ('other', 'Other'),
    ]

    ''' modikasilah berdasarkan deskripsi yang saya berikan ini saya ingin jika terjadi sales transaction maka akan otomatis terhitung sebagai income dan diberi income type sales'''
    objects = models.Manager()
    income_type = models.CharField(max_length=20, choices=INCOME_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    transaction_date = models.DateTimeField(default=now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Tambahkan ke Finance sebagai income
        Finance.objects.create( # pylint: disable=no-member
            transaction_date=self.created_at,
            transaction_type='income',
            description=self.description if self.description else f"Income from {self.income_type}",
            amount=self.amount
        )

    def __str__(self):
        return f"{self.income_type} - {self.amount}"


class Finance(models.Model):
    
    class Meta:
        db_table = "finance"
    
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    ''' modikasilah berdasarkan deskripsi yang saya berikan ini saya ingin di dalam model finance hanya akan ada column transaction_date, transaction_type(incoome or expense), description, amount, created_at and updated_at'''
    objects = models.Manager()
    transaction_date = models.DateTimeField(auto_now_add=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.description} - {self.amount}"
