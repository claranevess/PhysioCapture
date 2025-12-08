"""
ViewSets para Gestão de Estoque
Apenas GESTOR pode gerenciar estoque
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum
from .models import InventoryCategory, InventoryItem, InventoryTransaction
from .serializers import (
    InventoryCategorySerializer,
    InventoryItemSerializer, InventoryItemListSerializer,
    InventoryTransactionSerializer, InventoryTransactionCreateSerializer
)


class InventoryCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Categorias de Estoque
    Apenas Gestor pode gerenciar
    """
    queryset = InventoryCategory.objects.all()
    serializer_class = InventoryCategorySerializer
    permission_classes = [AllowAny]  # Temporário para dev
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated or not hasattr(user, 'clinica'):
            from authentication.models import User
            user = User.objects.filter(user_type='GESTOR', is_active_user=True).first()
        
        if user and hasattr(user, 'clinica'):
            queryset = queryset.filter(clinica=user.clinica)
        
        return queryset.filter(is_active=True)
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        if user and hasattr(user, 'clinica'):
            serializer.save(clinica=user.clinica)
        else:
            from authentication.models import User
            gestor = User.objects.filter(user_type='GESTOR').first()
            if gestor:
                serializer.save(clinica=gestor.clinica)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Itens de Estoque
    Apenas Gestor pode gerenciar
    """
    queryset = InventoryItem.objects.all()
    permission_classes = [AllowAny]  # Temporário para dev
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['name', 'quantity', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InventoryItemListSerializer
        return InventoryItemSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated or not hasattr(user, 'clinica'):
            from authentication.models import User
            user = User.objects.filter(user_type='GESTOR', is_active_user=True).first()
        
        if user and hasattr(user, 'clinica'):
            queryset = queryset.filter(clinica=user.clinica)
        
        # Filtros
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        status_filter = self.request.query_params.get('stock_status', None)
        if status_filter == 'low':
            queryset = queryset.filter(quantity__lte=models.F('min_quantity'))
        elif status_filter == 'out':
            queryset = queryset.filter(quantity__lte=0)
        
        is_active = self.request.query_params.get('is_active', 'true')
        queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        if user and hasattr(user, 'clinica'):
            serializer.save(clinica=user.clinica, created_by=user)
        else:
            from authentication.models import User
            gestor = User.objects.filter(user_type='GESTOR').first()
            if gestor:
                serializer.save(clinica=gestor.clinica, created_by=gestor)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Retorna itens com estoque baixo"""
        queryset = self.get_queryset().filter(quantity__lte=models.F('min_quantity'), quantity__gt=0)
        serializer = InventoryItemListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Retorna itens esgotados"""
        queryset = self.get_queryset().filter(quantity__lte=0)
        serializer = InventoryItemListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas do estoque"""
        queryset = self.get_queryset()
        total_items = queryset.count()
        low_stock = queryset.filter(quantity__lte=models.F('min_quantity'), quantity__gt=0).count()
        out_of_stock = queryset.filter(quantity__lte=0).count()
        
        return Response({
            'total_items': total_items,
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
            'normal': total_items - low_stock - out_of_stock
        })
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Histórico de transações do item"""
        item = self.get_object()
        transactions = item.transactions.all()[:20]
        serializer = InventoryTransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class InventoryTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Transações de Estoque
    """
    queryset = InventoryTransaction.objects.all()
    permission_classes = [AllowAny]  # Temporário para dev
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create']:
            return InventoryTransactionCreateSerializer
        return InventoryTransactionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        item_id = self.request.query_params.get('item', None)
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        
        transaction_type = self.request.query_params.get('type', None)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        return queryset[:100]  # Limitar a 100 últimas transações
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        if user:
            serializer.save(created_by=user)
        else:
            from authentication.models import User
            gestor = User.objects.filter(user_type='GESTOR').first()
            if gestor:
                serializer.save(created_by=gestor)


# Importar models no topo após usar
from django.db import models
