from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentCategoryViewSet, DocumentViewSet
from .views_ocr import digitalize_document, reprocess_ocr, quick_scan

router = DefaultRouter()
router.register(r'categories', DocumentCategoryViewSet, basename='document-category')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
    # Endpoints de digitalização e OCR
    path('digitalize/', digitalize_document, name='digitalize-document'),
    path('documents/<int:document_id>/reprocess-ocr/', reprocess_ocr, name='reprocess-ocr'),
    path('quick-scan/', quick_scan, name='quick-scan'),
]
