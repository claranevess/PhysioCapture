from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet, 
    MedicalRecordViewSet, 
    TreatmentPlanViewSet,
    PhysioSessionViewSet,
    DischargeViewSet,
    dashboard_statistics,
    dashboard_statistics_gestor,
    dashboard_statistics_gestor_filial,
    dashboard_statistics_fisioterapeuta,
    list_transfer_requests,
    create_transfer_request,
    approve_transfer_request,
    reject_transfer_request,
    cancel_transfer_request
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')
router.register(r'treatment-plans', TreatmentPlanViewSet, basename='treatment-plan')
router.register(r'sessions', PhysioSessionViewSet, basename='session')
router.register(r'discharges', DischargeViewSet, basename='discharge')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/', dashboard_statistics, name='dashboard-statistics'),
    path('dashboard-stats/gestor/', dashboard_statistics_gestor, name='dashboard-statistics-gestor'),
    path('dashboard-stats/gestor-filial/', dashboard_statistics_gestor_filial, name='dashboard-statistics-gestor-filial'),
    path('dashboard-stats/fisioterapeuta/', dashboard_statistics_fisioterapeuta, name='dashboard-statistics-fisioterapeuta'),
    # Solicitações de Transferência
    path('transfer-requests/', list_transfer_requests, name='list-transfer-requests'),
    path('transfer-requests/create/', create_transfer_request, name='create-transfer-request'),
    path('transfer-requests/<int:pk>/approve/', approve_transfer_request, name='approve-transfer-request'),
    path('transfer-requests/<int:pk>/reject/', reject_transfer_request, name='reject-transfer-request'),
    path('transfer-requests/<int:pk>/cancel/', cancel_transfer_request, name='cancel-transfer-request'),
]

