from django.contrib import admin
from .models import InventoryCategory, InventoryItem, InventoryTransaction


@admin.register(InventoryCategory)
class InventoryCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'clinica', 'is_active', 'created_at']
    list_filter = ['clinica', 'is_active']
    search_fields = ['name', 'description']


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'item_type', 'quantity', 'unit', 'stock_status', 'clinica']
    list_filter = ['clinica', 'category', 'item_type', 'is_active']
    search_fields = ['name', 'description', 'sku']
    readonly_fields = ['created_at', 'updated_at']
    
    def stock_status(self, obj):
        return obj.stock_status
    stock_status.short_description = 'Status'


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ['item', 'transaction_type', 'quantity', 'quantity_before', 'quantity_after', 'created_by', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['item__name', 'notes', 'reference']
    readonly_fields = ['quantity_before', 'quantity_after', 'created_at']
