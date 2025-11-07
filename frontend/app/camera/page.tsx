'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, RotateCw, Check, X, FileText } from 'lucide-react';
import { apiRoutes } from '@/lib/api';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { ArgonCard } from '@/components/Argon/ArgonCard';
import { ArgonButton } from '@/components/Argon/ArgonButton';
import { argonTheme } from '@/lib/argon-theme';

export default function CameraPage() {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<'capture' | 'preview' | 'processing' | 'result'>('capture');
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoConstraints = {
    facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };

  // Capturar foto
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setPreviewUrl(imageSrc);
      setStep('preview');
    }
  }, [webcamRef]);

  // Alternar câmera (frontal/traseira)
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStep('preview');
    }
  };

  // Processar OCR
  const processOCR = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      const formData = new FormData();

      if (capturedImage) {
        // Converter base64 para blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formData.append('file', blob, 'captured-image.jpg');
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        throw new Error('Nenhuma imagem selecionada');
      }

      // Chamar API de quick scan
      const result = await fetch('http://127.0.0.1:8000/api/documentos/quick-scan/', {
        method: 'POST',
        body: formData,
      });

      const data = await result.json();

      if (data.success) {
        setOcrResult(data);
        setStep('result');
      } else {
        alert('Erro ao processar OCR: ' + (data.error || 'Erro desconhecido'));
        setStep('preview');
      }
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      alert('Erro ao processar documento. Verifique se o backend está rodando.');
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reiniciar
  const reset = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setStep('capture');
  };

  // Salvar documento (navegar para seleção de paciente)
  const saveDocument = () => {
    // TODO: Implementar seleção de paciente e salvamento
    alert('Funcionalidade de salvamento será implementada na próxima etapa');
  };

  return (
    <ArgonLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: argonTheme.gradients.primary }}
          >
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: argonTheme.colors.text.primary }}
            >
              Digitalizar Documento
            </h1>
            <p style={{ color: argonTheme.colors.text.secondary }}>
              Capture ou faça upload de documentos para processar com OCR
            </p>
          </div>
        </div>
        {step !== 'capture' && (
          <ArgonButton
            variant="outline"
            color="error"
            icon={<X className="w-5 h-5" />}
            onClick={reset}
          >
            Cancelar
          </ArgonButton>
        )}
      </div>

      <div className="flex items-center justify-center">
        {step === 'capture' && (
          <div className="w-full max-w-2xl">
            <ArgonCard>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full aspect-[4/3] object-cover rounded-t-xl"
              />

              {/* Controls */}
              <div 
                className="p-6 flex items-center justify-center gap-6"
                style={{ background: argonTheme.colors.grey[50] }}
              >
                {/* Upload Button */}
                <label 
                  className="p-4 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg"
                  style={{ 
                    backgroundColor: argonTheme.colors.grey[200],
                    color: argonTheme.colors.text.primary
                  }}
                >
                  <Upload className="h-6 w-6" />
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Capture Button */}
                <button
                  onClick={capture}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95"
                  style={{ background: argonTheme.gradients.primary }}
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>

                {/* Rotate Camera */}
                <button
                  onClick={toggleCamera}
                  className="p-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                  style={{ 
                    backgroundColor: argonTheme.colors.grey[200],
                    color: argonTheme.colors.text.primary
                  }}
                >
                  <RotateCw className="h-6 w-6" />
                </button>
              </div>
            </ArgonCard>

            {/* Instructions */}
            <ArgonCard className="mt-6">
              <div className="p-6">
                <h3 
                  className="font-bold text-lg mb-4 flex items-center gap-2"
                  style={{ color: argonTheme.colors.text.primary }}
                >
                  <span className="text-2xl">💡</span>
                  Dicas para melhor resultado
                </h3>
                <ul 
                  className="space-y-2"
                  style={{ color: argonTheme.colors.text.secondary }}
                >
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" style={{ color: argonTheme.colors.success.main }} />
                    Use boa iluminação
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" style={{ color: argonTheme.colors.success.main }} />
                    Mantenha a câmera firme
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" style={{ color: argonTheme.colors.success.main }} />
                    Centralize o documento
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" style={{ color: argonTheme.colors.success.main }} />
                    Evite sombras e reflexos
                  </li>
                </ul>
              </div>
            </ArgonCard>
          </div>
        )}

        {step === 'preview' && previewUrl && (
          <div className="w-full max-w-2xl">
            <ArgonCard>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full aspect-[4/3] object-contain rounded-t-xl"
              />

              {/* Controls */}
              <div className="p-6 space-y-4">
                <ArgonButton
                  variant="gradient"
                  color="primary"
                  icon={<FileText className="h-5 w-5" />}
                  onClick={processOCR}
                  fullWidth
                  size="lg"
                >
                  Extrair Texto (OCR)
                </ArgonButton>

                <div className="grid grid-cols-2 gap-3">
                  <ArgonButton
                    variant="outline"
                    color="primary"
                    onClick={reset}
                    fullWidth
                  >
                    Tirar Nova Foto
                  </ArgonButton>
                  <ArgonButton
                    variant="gradient"
                    color="success"
                    onClick={saveDocument}
                    fullWidth
                  >
                    Salvar Direto
                  </ArgonButton>
                </div>
              </div>
            </ArgonCard>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center">
            <div 
              className="inline-block animate-spin rounded-full h-16 w-16 border-4 mb-4"
              style={{ 
                borderColor: argonTheme.colors.grey[200],
                borderTopColor: argonTheme.colors.primary.main
              }}
            ></div>
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: argonTheme.colors.text.primary }}
            >
              Processando OCR...
            </h2>
            <p style={{ color: argonTheme.colors.text.secondary }}>
              Extraindo texto do documento
            </p>
          </div>
        )}

        {step === 'result' && ocrResult && (
          <div className="w-full max-w-4xl space-y-4">
            {/* Preview da imagem */}
            <ArgonCard>
              <div className="p-4">
                <img
                  src={previewUrl!}
                  alt="Documento processado"
                  className="w-full max-h-64 object-contain rounded-xl"
                />
              </div>
            </ArgonCard>

            {/* Resultado do OCR */}
            <ArgonCard>
              <div 
                className="p-6 rounded-t-xl text-white flex items-center justify-between"
                style={{ background: argonTheme.gradients.success }}
              >
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <h2 className="font-bold text-lg">Texto Extraído com Sucesso!</h2>
                </div>
                <span className="text-sm bg-white/20 px-3 py-1.5 rounded-full font-medium">
                  Confiança: {ocrResult.confidence?.toFixed(0)}%
                </span>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: argonTheme.colors.text.primary }}
                  >
                    Texto Extraído (editável):
                  </label>
                  <textarea
                    defaultValue={ocrResult.text}
                    className="w-full h-64 p-4 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      border: `1px solid ${argonTheme.colors.grey[200]}`,
                      color: argonTheme.colors.text.primary,
                      backgroundColor: argonTheme.colors.grey[50]
                    }}
                    placeholder="Texto extraído aparecerá aqui..."
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ArgonButton
                    variant="outline"
                    color="primary"
                    onClick={reset}
                    fullWidth
                  >
                    ← Nova Captura
                  </ArgonButton>
                  <ArgonButton
                    variant="gradient"
                    color="primary"
                    onClick={saveDocument}
                    fullWidth
                  >
                    Salvar Documento →
                  </ArgonButton>
                </div>
              </div>
            </ArgonCard>
          </div>
        )}
      </div>
    </ArgonLayout>
  );
}
