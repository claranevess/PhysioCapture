"""
Serializers para Gestão de Estoque
"""

from rest_framework import serializers
from .models import InventoryCategory, InventoryItem, InventoryTransaction


class InventoryCategorySerializer(serializers.ModelSerializer):
    """Serializer para Categoria de Estoque"""
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'is_active', 'items_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_items_count(self, obj):
        return obj.items.filter(is_active=True).count()


class InventoryItemSerializer(serializers.ModelSerializer):
    """Serializer completo para Item de Estoque"""
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    item_type_display = serializers.CharField(source='get_item_type_display', read_only=True)
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)
    stock_status = serializers.CharField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'name', 'description', 'sku', 'category', 'category_name',
            'item_type', 'item_type_display', 'unit', 'unit_display',
            'quantity', 'min_quantity', 'unit_cost',
            'stock_status', 'is_low_stock', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'clinica', 'created_at', 'updated_at', 'created_by']


class InventoryItemListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de Itens"""
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)
    stock_status = serializers.CharField(read_only=True)
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'name', 'category', 'category_name', 
            'quantity', 'unit_display', 'min_quantity', 'stock_status', 'is_active'
        ]


class InventoryTransactionSerializer(serializers.ModelSerializer):
    """Serializer para Transações de Estoque"""
    item_name = serializers.CharField(source='item.name', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'item', 'item_name', 'transaction_type', 'transaction_type_display',
            'quantity', 'quantity_before', 'quantity_after',
            'notes', 'reference', 'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['id', 'quantity_before', 'quantity_after', 'created_at', 'created_by']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class InventoryTransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar transações"""
    
    class Meta:
        model = InventoryTransaction
        fields = ['item', 'transaction_type', 'quantity', 'notes', 'reference']
