from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from .models import User, Lead
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    LoginSerializer,
    UserProfileSerializer,
    LeadSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    ❌ ENDPOINT DESABILITADO - Registro público removido
    
    O PhysioCapture é um produto B2B corporativo.
    Apenas a equipe Core Hive pode cadastrar novas clínicas e usuários.
    
    Para contratar o serviço, preencha o formulário de interesse na landing page.
    """
    return Response({
        'error': 'Registro público desabilitado.',
        'message': 'Entre em contato com a Core Hive para contratar o PhysioCapture.',
        'contact': 'contato@corehive.com.br'
    }, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_lead(request):
    """
    Captura de interesse de novas clínicas (Landing Page)
    POST /api/auth/leads/
    
    Body:
    {
        "nome_clinica": "Fisio Saúde",
        "nome_responsavel": "Dr. João Silva",
        "email": "contato@fisiosaude.com.br",
        "telefone": "(81) 99999-9999",
        "num_fisioterapeutas": 5,
        "mensagem": "Gostaria de conhecer o sistema"
    }
    """
    serializer = LeadSerializer(data=request.data)
    if serializer.is_valid():
        lead = serializer.save()
        
        # TODO: Enviar email para equipe Core Hive
        # TODO: Enviar email de confirmação para a clínica
        
        return Response({
            'message': 'Interesse registrado com sucesso!',
            'info': 'Nossa equipe entrará em contato em breve.',
            'lead_id': lead.id
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login de usuários (simples, sem JWT)
    POST /api/auth/login/
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if user.is_active_user:
                login(request, user)
                return Response({
                    'message': 'Login realizado com sucesso!',
                    'user': UserProfileSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Usuário inativo. Entre em contato com o administrador.'
                }, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({
                'error': 'Credenciais inválidas.'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_user(request):
    """
    Logout de usuários
    POST /api/auth/logout/
    
    Permite logout mesmo sem autenticação para evitar erros
    """
    try:
        logout(request)
    except Exception:
        pass  # Ignora erros se não houver sessão
    
    return Response({
        'message': 'Logout realizado com sucesso!'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])  # SEM AUTENTICAÇÃO - APENAS DESENVOLVIMENTO
def current_user(request):
    """
    Retorna informações do usuário logado
    GET /api/auth/me/
    """
    # Para desenvolvimento: retornar primeiro usuário ativo
    try:
        user = User.objects.filter(is_active_user=True).first()
        if not user:
            return Response({'error': 'Nenhum usuário encontrado'}, status=404)
        
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])  # SEM AUTENTICAÇÃO - APENAS DESENVOLVIMENTO
def update_profile(request):
    """
    Atualiza perfil do usuário logado
    PUT/PATCH /api/auth/profile/
    """
    # Para desenvolvimento: pegar primeiro usuário
    user = User.objects.filter(is_active_user=True).first()
    if not user:
        return Response({'error': 'Nenhum usuário encontrado'}, status=404)
    
    serializer = UserProfileSerializer(
        user,
        data=request.data,
        partial=True
    )
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Perfil atualizado com sucesso!',
            'user': serializer.data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])  # SEM AUTENTICAÇÃO - APENAS DESENVOLVIMENTO
def change_password(request):
    """
    Altera a senha do usuário logado
    POST /api/auth/change-password/
    
    Body:
    {
        "old_password": "senha_atual",
        "new_password": "nova_senha"
    }
    """
    # Para desenvolvimento: pegar primeiro usuário
    user = User.objects.filter(is_active_user=True).first()
    if not user:
        return Response({'error': 'Nenhum usuário encontrado'}, status=404)
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({
            'error': 'Senha atual e nova senha são obrigatórias.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verifica se a senha atual está correta
    if not user.check_password(old_password):
        return Response({
            'error': 'Senha atual incorreta.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Valida tamanho mínimo da nova senha
    if len(new_password) < 6:
        return Response({
            'error': 'A nova senha deve ter pelo menos 6 caracteres.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Atualiza a senha
    user.set_password(new_password)
    user.save()
    
    return Response({
        'message': 'Senha alterada com sucesso!'
    }, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de usuários (apenas ADMIN)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Apenas admins podem ver todos os usuários
        if self.request.user.is_admin or self.request.user.is_staff:
            return User.objects.all()
        # Outros veem apenas seu próprio perfil
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Filtra usuários por tipo
        GET /api/auth/users/by_type/?type=FISIOTERAPEUTA
        """
        user_type = request.query_params.get('type', None)
        if user_type:
            users = User.objects.filter(user_type=user_type, is_active_user=True)
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data)
        return Response({'error': 'Parâmetro "type" é obrigatório'}, status=400)
