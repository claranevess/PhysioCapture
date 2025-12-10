from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from .models import User, Filial, Lead
from .serializers import (
    UserSerializer,
    UserListSerializer,
    UserRegistrationSerializer,
    LoginSerializer,
    UserProfileSerializer,
    LeadSerializer,
    FilialSerializer,
    FilialListSerializer
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
    """
    serializer = LeadSerializer(data=request.data)
    if serializer.is_valid():
        lead = serializer.save()
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
    """
    try:
        logout(request)
    except Exception:
        pass
    
    return Response({
        'message': 'Logout realizado com sucesso!'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    """
    Retorna informações do usuário logado
    GET /api/auth/me/
    """
    # Prioridade 1: Sessão Django autenticada
    if request.user.is_authenticated:
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    # Prioridade 2: Header X-User-Id enviado pelo frontend
    user_id = request.headers.get('X-User-Id')
    if user_id:
        try:
            user = User.objects.get(id=int(user_id), is_active_user=True)
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        except (User.DoesNotExist, ValueError):
            pass
    
    # Fallback para desenvolvimento: primeiro usuário ativo
    user = User.objects.filter(is_active_user=True).order_by('id').first()
    if user:
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
    
    return Response({'error': 'Nenhum usuário encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def update_profile(request):
    """
    Atualiza perfil do usuário logado
    PUT/PATCH /api/auth/profile/
    """
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
@permission_classes([AllowAny])
def change_password(request):
    """
    Altera a senha do usuário logado
    POST /api/auth/change-password/
    """
    user = User.objects.filter(is_active_user=True).first()
    if not user:
        return Response({'error': 'Nenhum usuário encontrado'}, status=404)
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({
            'error': 'Senha atual e nova senha são obrigatórias.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(old_password):
        return Response({
            'error': 'Senha atual incorreta.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 6:
        return Response({
            'error': 'A nova senha deve ter pelo menos 6 caracteres.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({
        'message': 'Senha alterada com sucesso!'
    }, status=status.HTTP_200_OK)


# ==================== FILIAIS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_filiais(request):
    """
    Lista filiais da clínica do usuário
    GET /api/auth/filiais/
    GET /api/auth/filiais/?user_id=1
    
    Retorna filiais que o usuário tem acesso:
    - Gestor Geral: todas as filiais da rede
    - Outros: apenas sua própria filial
    """
    user_id = request.query_params.get('user_id')
    if user_id:
        try:
            user = User.objects.get(id=int(user_id), is_active_user=True)
        except (User.DoesNotExist, ValueError):
            user = None
    else:
        user = User.objects.filter(is_active_user=True).order_by('id').first()
    
    if not user or not user.clinica:
        return Response([], status=status.HTTP_200_OK)
    
    if user.is_gestor_geral:
        # Gestor Geral vê todas as filiais da rede
        filiais = Filial.objects.filter(clinica=user.clinica, ativa=True)
    else:
        # Outros veem apenas sua própria filial
        if user.filial:
            filiais = Filial.objects.filter(id=user.filial.id)
        else:
            filiais = Filial.objects.none()
    
    serializer = FilialListSerializer(filiais, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_fisioterapeutas(request):
    """
    Lista fisioterapeutas da clínica/filial
    GET /api/auth/fisioterapeutas/
    GET /api/auth/fisioterapeutas/?user_id=1
    GET /api/auth/fisioterapeutas/?filial_id=1
    
    Filtros baseados no tipo de usuário:
    - Gestor Geral: todos os fisioterapeutas da rede (pode filtrar por filial)
    - Gestor Filial: apenas fisioterapeutas da sua filial
    - Fisioterapeuta: lista para referência (transferência intra-filial)
    """
    from prontuario.models import Patient
    from django.db.models import Count
    
    user_id = request.query_params.get('user_id')
    filial_id = request.query_params.get('filial_id')
    
    if user_id:
        try:
            simulated_user = User.objects.get(id=int(user_id), is_active_user=True)
        except (User.DoesNotExist, ValueError):
            simulated_user = None
    else:
        simulated_user = User.objects.filter(is_active_user=True).order_by('id').first()
    
    if not simulated_user or not simulated_user.clinica:
        return Response([], status=status.HTTP_200_OK)
    
    # Base queryset: fisioterapeutas da mesma clínica
    queryset = User.objects.filter(
        clinica=simulated_user.clinica,
        user_type='FISIOTERAPEUTA',
        is_active_user=True
    )
    
    # Filtrar por filial
    if filial_id:
        queryset = queryset.filter(filial_id=filial_id)
    elif simulated_user.is_gestor_filial:
        # Gestor de filial vê apenas fisios da sua filial
        queryset = queryset.filter(filial=simulated_user.filial)
    elif simulated_user.is_fisioterapeuta:
        # Fisioterapeuta vê apenas fisios da sua filial
        queryset = queryset.filter(filial=simulated_user.filial)
    # Gestor Geral vê todos (sem filtro adicional)
    
    queryset = queryset.annotate(
        patient_count=Count('meus_pacientes')
    ).order_by('first_name', 'last_name')
    
    data = []
    for fisio in queryset:
        data.append({
            'id': fisio.id,
            'username': fisio.username,
            'first_name': fisio.first_name,
            'last_name': fisio.last_name,
            'full_name': fisio.get_full_name(),
            'email': fisio.email,
            'phone': fisio.phone,
            'crefito': fisio.crefito,
            'especialidade': fisio.especialidade,
            'is_active_user': fisio.is_active_user,
            'patient_count': fisio.patient_count,
            'filial_id': fisio.filial_id,
            'filial_nome': fisio.filial.nome if fisio.filial else None,
        })
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_fisioterapeutas_for_transfer(request):
    """
    Lista fisioterapeutas disponíveis para receber transferência de paciente
    GET /api/auth/fisioterapeutas/transfer/
    GET /api/auth/fisioterapeutas/transfer/?user_id=1&patient_id=1
    
    Retorna fisioterapeutas que podem receber o paciente:
    - Gestor Geral: todos os fisioterapeutas da rede
    - Gestor Filial: todos os fisioterapeutas da rede (pode transferir inter-filial)
    - Fisioterapeuta: apenas fisioterapeutas da mesma filial
    """
    from django.db.models import Count
    
    user_id = request.query_params.get('user_id')
    
    if user_id:
        try:
            user = User.objects.get(id=int(user_id), is_active_user=True)
        except (User.DoesNotExist, ValueError):
            user = None
    else:
        user = User.objects.filter(is_active_user=True).order_by('id').first()
    
    if not user or not user.clinica:
        return Response([], status=status.HTTP_200_OK)
    
    # Base queryset
    queryset = User.objects.filter(
        clinica=user.clinica,
        user_type='FISIOTERAPEUTA',
        is_active_user=True
    )
    
    # Fisioterapeuta só pode transferir para mesma filial
    if user.is_fisioterapeuta and user.filial:
        queryset = queryset.filter(filial=user.filial)
    
    # Excluir o próprio usuário se for fisioterapeuta
    if user.is_fisioterapeuta:
        queryset = queryset.exclude(id=user.id)
    
    queryset = queryset.annotate(
        patient_count=Count('meus_pacientes')
    ).order_by('filial__nome', 'first_name', 'last_name')
    
    data = []
    for fisio in queryset:
        data.append({
            'id': fisio.id,
            'full_name': fisio.get_full_name(),
            'especialidade': fisio.especialidade,
            'patient_count': fisio.patient_count,
            'filial_id': fisio.filial_id,
            'filial_nome': fisio.filial.nome if fisio.filial else None,
        })
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_fisioterapeuta(request):
    """
    Cria um novo fisioterapeuta na clínica do gestor logado
    POST /api/auth/fisioterapeutas/create/
    """
    # Tentar obter user_id do header X-User-Id ou da query param
    user_id = request.headers.get('X-User-Id') or request.query_params.get('user_id')
    if user_id:
        try:
            simulated_user = User.objects.get(id=int(user_id))
        except User.DoesNotExist:
            simulated_user = User.objects.filter(user_type__in=['GESTOR_GERAL', 'GESTOR_FILIAL'], is_active_user=True).order_by('id').first()
    else:
        simulated_user = User.objects.filter(user_type__in=['GESTOR_GERAL', 'GESTOR_FILIAL'], is_active_user=True).order_by('id').first()
    
    if not simulated_user or not simulated_user.is_gestor:
        return Response(
            {'error': 'Apenas gestores podem cadastrar fisioterapeutas.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not simulated_user.clinica:
        return Response(
            {'error': 'Gestor não está associado a uma clínica.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar dados obrigatórios
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not request.data.get(field):
            return Response(
                {'error': f'Campo obrigatório: {field}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Verificar se username já existe
    if User.objects.filter(username=request.data['username']).exists():
        return Response(
            {'error': 'Nome de usuário já existe.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar se email já existe
    if User.objects.filter(email=request.data['email']).exists():
        return Response(
            {'error': 'Email já está em uso.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Determinar filial
    filial_id = request.data.get('filial_id')
    if filial_id:
        try:
            filial = Filial.objects.get(id=filial_id, clinica=simulated_user.clinica)
        except Filial.DoesNotExist:
            return Response(
                {'error': 'Filial não encontrada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    elif simulated_user.is_gestor_filial:
        # Gestor de filial cria na sua própria filial
        filial = simulated_user.filial
    else:
        return Response(
            {'error': 'Filial é obrigatória.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        fisioterapeuta = User.objects.create(
            username=request.data['username'],
            email=request.data['email'],
            first_name=request.data['first_name'],
            last_name=request.data['last_name'],
            cpf=request.data.get('cpf', ''),
            phone=request.data.get('phone', ''),
            crefito=request.data.get('crefito', ''),
            especialidade=request.data.get('especialidade', ''),
            clinica=simulated_user.clinica,
            filial=filial,
            user_type='FISIOTERAPEUTA',
            is_active=True,
            is_active_user=True,
        )
        
        fisioterapeuta.set_password(request.data['password'])
        fisioterapeuta.save()
        
        return Response({
            'message': 'Fisioterapeuta cadastrado com sucesso!',
            'fisioterapeuta': {
                'id': fisioterapeuta.id,
                'username': fisioterapeuta.username,
                'email': fisioterapeuta.email,
                'first_name': fisioterapeuta.first_name,
                'last_name': fisioterapeuta.last_name,
                'crefito': fisioterapeuta.crefito,
                'especialidade': fisioterapeuta.especialidade,
                'filial_id': fisioterapeuta.filial_id,
                'filial_nome': fisioterapeuta.filial.nome if fisioterapeuta.filial else None,
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Erro ao criar fisioterapeuta: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de usuários (apenas ADMIN)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
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


# ==================== ATENDENTES ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_atendentes(request):
    """
    Lista atendentes da clínica/filial
    GET /api/auth/atendentes/
    GET /api/auth/atendentes/?user_id=1
    GET /api/auth/atendentes/?filial_id=1
    
    Filtros baseados no tipo de usuário:
    - Gestor Geral: todos os atendentes da rede (pode filtrar por filial)
    - Gestor Filial: apenas atendentes da sua filial
    """
    user_id = request.query_params.get('user_id')
    filial_id = request.query_params.get('filial_id')
    
    if user_id:
        try:
            simulated_user = User.objects.get(id=int(user_id), is_active_user=True)
        except (User.DoesNotExist, ValueError):
            simulated_user = None
    else:
        simulated_user = User.objects.filter(is_active_user=True).order_by('id').first()
    
    if not simulated_user or not simulated_user.clinica:
        return Response([], status=status.HTTP_200_OK)
    
    # Base queryset: atendentes da mesma clínica
    queryset = User.objects.filter(
        clinica=simulated_user.clinica,
        user_type='ATENDENTE',
        is_active_user=True
    )
    
    # Filtrar por filial
    if filial_id:
        queryset = queryset.filter(filial_id=filial_id)
    elif simulated_user.is_gestor_filial:
        # Gestor de filial vê apenas atendentes da sua filial
        queryset = queryset.filter(filial=simulated_user.filial)
    # Gestor Geral vê todos (sem filtro adicional)
    
    queryset = queryset.order_by('first_name', 'last_name')
    
    data = []
    for atendente in queryset:
        data.append({
            'id': atendente.id,
            'username': atendente.username,
            'first_name': atendente.first_name,
            'last_name': atendente.last_name,
            'full_name': atendente.get_full_name(),
            'email': atendente.email,
            'phone': atendente.phone,
            'is_active_user': atendente.is_active_user,
            'filial_id': atendente.filial_id,
            'filial_nome': atendente.filial.nome if atendente.filial else None,
        })
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_atendente(request):
    """
    Cria um novo atendente na clínica do gestor logado
    POST /api/auth/atendentes/create/
    """
    # Tentar obter user_id do header X-User-Id ou da query param
    user_id = request.headers.get('X-User-Id') or request.query_params.get('user_id')
    if user_id:
        try:
            simulated_user = User.objects.get(id=int(user_id))
        except User.DoesNotExist:
            simulated_user = User.objects.filter(user_type__in=['GESTOR_GERAL', 'GESTOR_FILIAL'], is_active_user=True).order_by('id').first()
    else:
        simulated_user = User.objects.filter(user_type__in=['GESTOR_GERAL', 'GESTOR_FILIAL'], is_active_user=True).order_by('id').first()
    
    if not simulated_user or not simulated_user.is_gestor:
        return Response(
            {'error': 'Apenas gestores podem cadastrar atendentes.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not simulated_user.clinica:
        return Response(
            {'error': 'Gestor não está associado a uma clínica.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar dados obrigatórios
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not request.data.get(field):
            return Response(
                {'error': f'Campo obrigatório: {field}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Verificar se username já existe
    if User.objects.filter(username=request.data['username']).exists():
        return Response(
            {'error': 'Nome de usuário já existe.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar se email já existe
    if User.objects.filter(email=request.data['email']).exists():
        return Response(
            {'error': 'Email já está em uso.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Determinar filial
    filial_id = request.data.get('filial_id')
    if filial_id:
        try:
            filial = Filial.objects.get(id=filial_id, clinica=simulated_user.clinica)
        except Filial.DoesNotExist:
            return Response(
                {'error': 'Filial não encontrada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    elif simulated_user.is_gestor_filial:
        # Gestor de filial cria na sua própria filial
        filial = simulated_user.filial
    else:
        return Response(
            {'error': 'Filial é obrigatória.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        atendente = User.objects.create(
            username=request.data['username'],
            email=request.data['email'],
            first_name=request.data['first_name'],
            last_name=request.data['last_name'],
            cpf=request.data.get('cpf', ''),
            phone=request.data.get('phone', ''),
            clinica=simulated_user.clinica,
            filial=filial,
            user_type='ATENDENTE',
            is_active=True,
            is_active_user=True,
        )
        
        atendente.set_password(request.data['password'])
        atendente.save()
        
        return Response({
            'message': 'Atendente cadastrado com sucesso!',
            'atendente': {
                'id': atendente.id,
                'username': atendente.username,
                'email': atendente.email,
                'first_name': atendente.first_name,
                'last_name': atendente.last_name,
                'filial_id': atendente.filial_id,
                'filial_nome': atendente.filial.nome if atendente.filial else None,
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Erro ao criar atendente: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
