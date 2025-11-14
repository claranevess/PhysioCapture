"""
Utilitários para processamento OCR de documentos
Suporta imagens e PDFs
"""
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import cv2
import numpy as np
from django.conf import settings
import os


class OCRProcessor:
    """
    Classe para processar OCR em documentos
    """
    
    def __init__(self, tesseract_cmd=None, language='por+eng'):
        """
        Inicializa o processador OCR
        
        Args:
            tesseract_cmd: Caminho para o executável do Tesseract
            language: Idiomas para OCR (padrão: português + inglês)
        """
        self.language = language
        
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        elif hasattr(settings, 'TESSERACT_CMD'):
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    
    def preprocess_image(self, image_path):
        """
        Pré-processa a imagem para melhorar a precisão do OCR
        Detecta fundo escuro e inverte se necessário
        """
        # Carrega a imagem
        img = cv2.imread(image_path)
        
        # Converte para escala de cinza
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # --- LÓGICA DE DETECÇÃO DE MODO ESCURO ---
        # Calcula a média de brilho dos pixels
        mean_brightness = np.mean(gray)
        
        # Se a média for menor que 127 (imagem escura), inverte as cores
        if mean_brightness < 127:
            gray = cv2.bitwise_not(gray) # Inverte Fundo Preto/Letra Branca
        # ----------------------------------------

        # --- LÓGICA DE LIMPEZA PARA SCREENSHOTS ---
        # Em vez de adaptiveThreshold, usamos um threshold global simples.
        # O método OTSU encontra automaticamente o melhor valor de corte.
        # Isso cria uma imagem preta e branca pura, sem "borrões".
        _, processed = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # NÃO vamos usar medianBlur, pois as imagens são limpas.
        
        return processed
    
    def extract_text_from_image(self, image_path, preprocess=True):
        """
        Extrai texto de uma imagem usando OCR
        
        Args:
            image_path: Caminho para a imagem
            preprocess: Se deve pré-processar a imagem
            
        Returns:
            dict com 'text' e 'confidence'
        """
        try:
            if preprocess:
                # Pré-processa a imagem
                processed_img = self.preprocess_image(image_path)
                
                # Converte para PIL Image
                pil_img = Image.fromarray(processed_img)
            else:
                # Carrega imagem diretamente
                pil_img = Image.open(image_path)
            
            # Executa OCR
            data = pytesseract.image_to_data(
                pil_img, 
                lang=self.language, 
                output_type=pytesseract.Output.DICT
            )
            
            # Extrai texto
            text = pytesseract.image_to_string(pil_img, lang=self.language)
            
            # Calcula confiança média
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': text.strip(),
                'confidence': round(avg_confidence, 2),
                'success': True
            }
            
        except Exception as e:
            return {
                'text': '',
                'confidence': 0,
                'success': False,
                'error': str(e)
            }
    
    def extract_text_from_pdf(self, pdf_path):
        """
        Extrai texto de um PDF (converte para imagens e aplica OCR)
        
        Args:
            pdf_path: Caminho para o PDF
            
        Returns:
            dict com 'text', 'confidence' e 'pages'
        """
        try:
            # Converte PDF para imagens
            pages = convert_from_path(pdf_path, 300)  # 300 DPI
            
            all_text = []
            all_confidences = []
            
            for i, page in enumerate(pages):
                # Salva temporariamente
                temp_path = f'/tmp/temp_page_{i}.png'
                page.save(temp_path, 'PNG')
                
                # Processa OCR
                result = self.extract_text_from_image(temp_path)
                
                if result['success']:
                    all_text.append(f"=== PÁGINA {i+1} ===\n{result['text']}")
                    all_confidences.append(result['confidence'])
                
                # Remove arquivo temporário
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
            avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0
            
            return {
                'text': '\n\n'.join(all_text),
                'confidence': round(avg_confidence, 2),
                'pages': len(pages),
                'success': True
            }
            
        except Exception as e:
            return {
                'text': '',
                'confidence': 0,
                'pages': 0,
                'success': False,
                'error': str(e)
            }
    
    def process_document(self, file_path):
        """
        Processa qualquer tipo de documento (detecta automaticamente)
        
        Args:
            file_path: Caminho para o documento
            
        Returns:
            dict com resultado do OCR
        """
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif']:
            return self.extract_text_from_image(file_path)
        else:
            return {
                'text': '',
                'confidence': 0,
                'success': False,
                'error': f'Formato de arquivo não suportado: {ext}'
            }


def create_thumbnail(image_path, thumbnail_path, size=(300, 300)):
    """
    Cria uma miniatura de uma imagem
    
    Args:
        image_path: Caminho da imagem original
        thumbnail_path: Caminho para salvar a miniatura
        size: Tamanho da miniatura (largura, altura)
    """
    try:
        img = Image.open(image_path)
        img.thumbnail(size, Image.Resampling.LANCZOS)
        img.save(thumbnail_path, optimize=True, quality=85)
        return True
    except Exception:
        return False
