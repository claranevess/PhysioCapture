"""
Views para processamento OCR e digitalização de documentos
"""
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.core.files.base import ContentFile
from django.conf import settings
import os
import tempfile

from .models import Document
from .serializers import DocumentSerializer
from .ocr_utils import OCRProcessor, create_thumbnail
from prontuario.models import Patient


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def digitalize_document(request):
    """
    Endpoint para digitalizar documento com OCR
    
    POST /api/documentos/digitalize/
    
    Parâmetros:
        - file: Arquivo (imagem ou PDF)
        - patient_id: ID do paciente
        - title: Título do documento
        - document_type: Tipo do documento
        - category: ID da categoria (opcional)
        - description: Descrição (opcional)
        - process_ocr: Boolean para processar OCR (padrão: True)
    
    Retorna:
        - Documento criado com texto OCR extraído
    """
    try:
        # Validar dados
        file = request.FILES.get('file')
        patient_id = request.data.get('patient_id')
        title = request.data.get('title', 'Documento digitalizado')
        document_type = request.data.get('document_type', 'IMAGE')
        category_id = request.data.get('category')
        description = request.data.get('description', '')
        process_ocr = request.data.get('process_ocr', 'true').lower() == 'true'
        
        if not file:
            return Response(
                {'error': 'Nenhum arquivo foi enviado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not patient_id:
            return Response(
                {'error': 'ID do paciente é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se paciente existe
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Criar documento
        document = Document.objects.create(
            patient=patient,
            title=title,
            document_type=document_type,
            description=description,
            file=file,
            uploaded_by=request.user if request.user.is_authenticated else None,
            category_id=category_id if category_id else None
        )
        
        # Processar OCR se solicitado
        ocr_result = None
        if process_ocr:
            try:
                # Salvar arquivo temporariamente para processamento
                temp_path = document.file.path
                
                # Inicializar processador OCR
                ocr_processor = OCRProcessor()
                
                # Processar documento
                ocr_result = ocr_processor.process_document(temp_path)
                
                if ocr_result['success']:
                    # Salvar resultados do OCR
                    document.ocr_text = ocr_result['text']
                    document.ocr_confidence = ocr_result['confidence']
                    document.ocr_processed = True
                    
                    # Criar thumbnail se for imagem
                    if document.file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
                        thumbnail_name = f"thumb_{document.id}.jpg"
                        thumbnail_path = os.path.join(settings.MEDIA_ROOT, 'documents', 'thumbnails', thumbnail_name)
                        
                        os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
                        
                        if create_thumbnail(temp_path, thumbnail_path):
                            # Salvar thumbnail no modelo
                            with open(thumbnail_path, 'rb') as thumb_file:
                                document.thumbnail.save(
                                    thumbnail_name,
                                    ContentFile(thumb_file.read()),
                                    save=False
                                )
                    
                    document.save()
                else:
                    # OCR falhou, mas documento foi salvo
                    document.ocr_processed = False
                    document.save()
                    
            except Exception as e:
                # Log do erro, mas não falha a requisição
                print(f"Erro ao processar OCR: {str(e)}")
                document.ocr_processed = False
                document.save()
        
        # Serializar resposta
        serializer = DocumentSerializer(document, context={'request': request})
        
        response_data = serializer.data
        if ocr_result:
            response_data['ocr_processing'] = {
                'success': ocr_result['success'],
                'error': ocr_result.get('error', None)
            }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Erro ao processar documento: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def reprocess_ocr(request, document_id):
    """
    Reprocessa OCR de um documento existente
    
    POST /api/documentos/<id>/reprocess-ocr/
    """
    try:
        document = Document.objects.get(id=document_id)
        
        # Verificar se é imagem ou PDF
        if document.file_extension not in ['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif']:
            return Response(
                {'error': 'Tipo de arquivo não suportado para OCR'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Processar OCR
        ocr_processor = OCRProcessor()
        ocr_result = ocr_processor.process_document(document.file.path)
        
        if ocr_result['success']:
            document.ocr_text = ocr_result['text']
            document.ocr_confidence = ocr_result['confidence']
            document.ocr_processed = True
            document.save()
            
            serializer = DocumentSerializer(document, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': ocr_result.get('error', 'Falha no processamento OCR')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Document.DoesNotExist:
        return Response(
            {'error': 'Documento não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erro ao reprocessar OCR: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def quick_scan(request):
    """
    Endpoint rápido para escanear documento via mobile (sem salvar)
    Retorna apenas o texto extraído
    
    POST /api/documentos/quick-scan/
    
    Parâmetros:
        - file: Arquivo de imagem
    
    Retorna:
        - text: Texto extraído
        - confidence: Confiança do OCR
    """
    try:
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'error': 'Nenhum arquivo foi enviado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Salvar temporariamente
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.name)[1]) as tmp:
            for chunk in file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        try:
            # Processar OCR
            ocr_processor = OCRProcessor()
            ocr_result = ocr_processor.process_document(tmp_path)
            
            # Remover arquivo temporário
            os.unlink(tmp_path)
            
            if ocr_result['success']:
                return Response({
                    'text': ocr_result['text'],
                    'confidence': ocr_result['confidence'],
                    'success': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': ocr_result.get('error', 'Falha no processamento'),
                    'success': False
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        finally:
            # Garantir que o arquivo temporário seja removido
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        
    except Exception as e:
        return Response(
            {'error': f'Erro ao processar: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
