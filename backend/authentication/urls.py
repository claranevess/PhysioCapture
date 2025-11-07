from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_user,
    create_lead,
    login_user,
    logout_user,
    current_user,
    update_profile,
    change_password,
    list_fisioterapeutas,
    create_fisioterapeuta,
    UserViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Autenticação
    path('register/', register_user, name='register'),  # DESABILITADO - Retorna erro 403
    path('leads/', create_lead, name='create-lead'),  # NOVO - Captura de leads da landing page
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('me/', current_user, name='current-user'),
    path('profile/', update_profile, name='update-profile'),
    path('change-password/', change_password, name='change-password'),
    
    # Fisioterapeutas (apenas Gestores)
    path('fisioterapeutas/', list_fisioterapeutas, name='list-fisioterapeutas'),
    path('fisioterapeutas/create/', create_fisioterapeuta, name='create-fisioterapeuta'),
    
    # Rotas do ViewSet
    path('', include(router.urls)),
]
