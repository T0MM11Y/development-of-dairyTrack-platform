from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'list', NotificationViewSet, basename='notification')

urlpatterns = router.urls
