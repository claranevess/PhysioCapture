'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, RotateCw, Check, X, FileText } from 'lucide-react';
import { apiRoutes } from '@/lib/api';

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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="h-6 w-6" />
          <h1 className="text-lg font-bold">Digitalizar Documento</h1>
        </div>
        {step !== 'capture' && (
          <button
            onClick={reset}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {step === 'capture' && (
          <div className="w-full max-w-2xl">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full aspect-[4/3] object-cover"
              />

              {/* Controls */}
              <div className="p-4 bg-gray-900 flex items-center justify-center space-x-4">
                {/* Upload Button */}
                <label className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer transition-colors">
                  <Upload className="h-6 w-6 text-white" />
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
                  className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>

                {/* Rotate Camera */}
                <button
                  onClick={toggleCamera}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <RotateCw className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4 text-white">
              <h3 className="font-semibold mb-2">💡 Dicas para melhor resultado:</h3>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>✓ Use boa iluminação</li>
                <li>✓ Mantenha a câmera firme</li>
                <li>✓ Centralize o documento</li>
                <li>✓ Evite sombras e reflexos</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && previewUrl && (
          <div className="w-full max-w-2xl">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full aspect-[4/3] object-contain"
              />

              {/* Controls */}
              <div className="p-6 bg-gray-900 space-y-4">
                <button
                  onClick={processOCR}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  <span>Extrair Texto (OCR)</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={reset}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Tirar Nova Foto
                  </button>
                  <button
                    onClick={saveDocument}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Salvar Direto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center text-white">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-600 mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Processando OCR...</h2>
            <p className="text-gray-400">Extraindo texto do documento</p>
          </div>
        )}

        {step === 'result' && ocrResult && (
          <div className="w-full max-w-4xl space-y-4">
            {/* Preview da imagem */}
            <div className="bg-gray-800 rounded-lg p-4">
              <img
                src={previewUrl!}
                alt="Documento processado"
                className="w-full max-h-64 object-contain rounded"
              />
            </div>

            {/* Resultado do OCR */}
            <div className="bg-white rounded-lg shadow-xl">
              <div className="p-4 bg-green-600 text-white rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5" />
                  <h2 className="font-bold">Texto Extraído com Sucesso!</h2>
                </div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  Confiança: {ocrResult.confidence?.toFixed(0)}%
                </span>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Texto Extraído (editável):
                  </label>
                  <textarea
                    defaultValue={ocrResult.text}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    placeholder="Texto extraído aparecerá aqui..."
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={reset}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    ← Nova Captura
                  </button>
                  <button
                    onClick={saveDocument}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Salvar Documento →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
