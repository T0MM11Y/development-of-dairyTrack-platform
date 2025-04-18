import django_filters # pylint: disable=import-error
from .models import Finance

class FinanceFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name='transaction_date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='transaction_date', lookup_expr='lte')
    transaction_type = django_filters.CharFilter(lookup_expr='iexact')  # "income", "expense"

    class Meta:
        model = Finance
        fields = ['transaction_type', 'start_date', 'end_date']