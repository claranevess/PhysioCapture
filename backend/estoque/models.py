from django.db import models
from django.conf import settings


class InventoryCategory(models.Model):
    """
    Categorias para organizar os itens de estoque
    Ex: Materiais de curativo, Equipamentos, Medicações, etc.
    """
    clinica = models.ForeignKey(
        'authentication.Clinica',
        on_delete=models.CASCADE,
        related_name='inventory_categories',
        verbose_name='Clínica'
    )
    
    name = models.CharField(max_length=100, verbose_name="Nome da Categoria")
    description = models.TextField(blank=True, verbose_name="Descrição")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Ícone")
    color = models.CharField(max_length=7, default='#3B82F6', verbose_name="Cor (hex)")
    
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        ordering = ['name']
        verbose_name = "Categoria de Estoque"
        verbose_name_plural = "Categorias de Estoque"
        unique_together = [['clinica', 'name']]
    
    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    """
    Itens de estoque da clínica
    Ex: Bandagens, eletrodos, gelo instantâneo, fita kinesio, etc.
    """
    ITEM_TYPE_CHOICES = [
        ('MATERIAL', 'Material'),
        ('INSUMO', 'Insumo'),
        ('EQUIPAMENTO', 'Equipamento'),
        ('MEDICACAO', 'Medicação'),
        ('DESCARTAVEL', 'Descartável'),
        ('OUTRO', 'Outro'),
    ]
    
    UNIT_CHOICES = [
        ('unidade', 'Unidade(s)'),
        ('par', 'Par(es)'),
        ('caixa', 'Caixa(s)'),
        ('pacote', 'Pacote(s)'),
        ('rolo', 'Rolo(s)'),
        ('metro', 'Metro(s)'),
        ('ml', 'mL'),
        ('litro', 'Litro(s)'),
        ('kg', 'Kg'),
        ('grama', 'Grama(s)'),
    ]
    
    # Relacionamentos
    clinica = models.ForeignKey(
        'authentication.Clinica',
        on_delete=models.CASCADE,
        related_name='inventory_items',
        verbose_name='Clínica'
    )
    category = models.ForeignKey(
        InventoryCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='items',
        verbose_name="Categoria"
    )
    
    # Informações do item
    name = models.CharField(max_length=200, verbose_name="Nome do Item")
    description = models.TextField(blank=True, verbose_name="Descrição")
    sku = models.CharField(max_length=50, blank=True, verbose_name="SKU/Código")
    
    # Tipo e unidade
    item_type = models.CharField(
        max_length=20,
        choices=ITEM_TYPE_CHOICES,
        default='MATERIAL',
        verbose_name="Tipo"
    )
    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        default='unidade',
        verbose_name="Unidade de Medida"
    )
    
    # Quantidades
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Quantidade Atual"
    )
    min_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Quantidade Mínima (Alerta)"
    )
    
    # Valores (opcional)
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Custo por Unidade"
    )
    
    # Controle
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='inventory_items_created',
        verbose_name="Criado por"
    )
    
    class Meta:
        ordering = ['name']
        verbose_name = "Item de Estoque"
        verbose_name_plural = "Itens de Estoque"
    
    def __str__(self):
        return f"{self.name} ({self.quantity} {self.get_unit_display()})"
    
    @property
    def is_low_stock(self):
        """Verifica se o estoque está baixo"""
        return self.quantity <= self.min_quantity
    
    @property
    def stock_status(self):
        """Retorna o status do estoque"""
        if self.quantity <= 0:
            return 'ESGOTADO'
        elif self.is_low_stock:
            return 'BAIXO'
        else:
            return 'NORMAL'


class InventoryTransaction(models.Model):
    """
    Transações/movimentações de estoque
    Registra entradas, saídas e ajustes
    """
    TRANSACTION_TYPE_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
        ('AJUSTE_MAIS', 'Ajuste (+)'),
        ('AJUSTE_MENOS', 'Ajuste (-)'),
        ('PERDA', 'Perda/Extravio'),
        ('VENCIMENTO', 'Vencimento'),
    ]
    
    # Relacionamentos
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name="Item"
    )
    
    # Tipo e quantidade
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES,
        verbose_name="Tipo de Movimentação"
    )
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Quantidade"
    )
    quantity_before = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Quantidade Antes"
    )
    quantity_after = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Quantidade Depois"
    )
    
    # Informações adicionais
    notes = models.TextField(blank=True, verbose_name="Observações")
    reference = models.CharField(max_length=100, blank=True, verbose_name="Referência/NF")
    
    # Controle
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data/Hora")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='inventory_transactions',
        verbose_name="Realizado por"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Movimentação de Estoque"
        verbose_name_plural = "Movimentações de Estoque"
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.item.name} ({self.quantity})"
    
    def save(self, *args, **kwargs):
        """
        Override para registrar quantidades antes/depois e atualizar o item
        """
        if not self.pk:  # Nova transação
            self.quantity_before = self.item.quantity
            
            # Atualizar quantidade do item
            if self.transaction_type in ['ENTRADA', 'AJUSTE_MAIS']:
                self.item.quantity += self.quantity
            else:  # SAIDA, AJUSTE_MENOS, PERDA, VENCIMENTO
                self.item.quantity -= self.quantity
            
            self.quantity_after = self.item.quantity
            self.item.save()
        
        super().save(*args, **kwargs)
