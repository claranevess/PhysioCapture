from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet, 
    MedicalRecordViewSet, 
    dashboard_statistics,
    dashboard_statistics_gestor,
    dashboard_statistics_fisioterapeuta
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/', dashboard_statistics, name='dashboard-statistics'),
    path('dashboard-stats/gestor/', dashboard_statistics_gestor, name='dashboard-statistics-gestor'),
    path('dashboard-stats/fisioterapeuta/', dashboard_statistics_fisioterapeuta, name='dashboard-statistics-fisioterapeuta'),
]
