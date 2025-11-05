'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! 👋 Sou o assistente virtual do PhysioCapture. Como posso ajudá-lo hoje?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const contextualSuggestions: Record<string, string[]> = {
    '/': [
      'Como cadastro um novo paciente?',
      'Como digitalizo um documento?',
      'Como faço para buscar um paciente?',
    ],
    '/patients': [
      'Como adiciono uma foto ao paciente?',
      'Onde vejo o histórico do paciente?',
      'Como edito os dados de um paciente?',
    ],
    '/documents': [
      'Como funciona o OCR?',
      'Quais tipos de arquivos posso enviar?',
      'Como organizo documentos por categoria?',
    ],
    '/camera': [
      'Como tiro uma foto de um documento?',
      'A digitalização funciona com PDF?',
      'Como melhoro a qualidade do OCR?',
    ],
  };

  const getCurrentSuggestions = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return contextualSuggestions[path] || contextualSuggestions['/'];
    }
    return contextualSuggestions['/'];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simula resposta da IA (aqui você integraria com OpenAI/Claude)
    setTimeout(() => {
      const response = getContextualResponse(inputValue);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1000);
  };

  const getContextualResponse = (question: string): string => {
    const q = question.toLowerCase();

    // Respostas contextuais baseadas em keywords
    if (q.includes('cadastr') && q.includes('paciente')) {
      return '📝 Para cadastrar um novo paciente:\n\n1. Clique no botão "+ Novo Paciente" no Dashboard\n2. Preencha os campos obrigatórios (nome, CPF, data de nascimento, telefone)\n3. Opcionalmente, tire uma foto ou faça upload\n4. Clique em "Salvar"';
    }

    if (q.includes('digitaliz') || q.includes('document')) {
      return '📷 Para digitalizar um documento:\n\n1. Clique no ícone da câmera (📷) na barra inferior\n2. Tire uma foto do documento ou faça upload\n3. Revise o texto extraído pelo OCR\n4. Associe ao paciente e salve';
    }

    if (q.includes('ocr')) {
      return '🔍 O OCR (Reconhecimento Óptico de Caracteres) extrai automaticamente o texto de documentos fotografados.\n\nDicas para melhor resultado:\n- Use boa iluminação\n- Mantenha a câmera firme\n- Centralize o documento\n- Evite sombras';
    }

    if (q.includes('foto') || q.includes('imagem')) {
      return '📸 Você pode adicionar fotos:\n\n- Ao cadastrar paciente (foto de perfil)\n- Ao digitalizar documentos\n- Via upload de arquivo\n\nFormatos aceitos: JPG, PNG, PDF';
    }

    if (q.includes('busca') || q.includes('procur')) {
      return '🔍 Para buscar pacientes:\n\n1. Use a barra de busca no topo\n2. Digite nome ou CPF\n3. Clique no paciente para ver detalhes';
    }

    if (q.includes('hist') || q.includes('prontu')) {
      return '📋 Para ver o prontuário do paciente:\n\n1. Acesse a lista de pacientes\n2. Clique no nome do paciente\n3. Navegue pelas abas: Resumo, Documentos, Evolução';
    }

    // Resposta padrão
    return 'Entendo sua dúvida! O PhysioCapture é um sistema completo para gestão de prontuários e documentos. Você pode:\n\n✅ Cadastrar pacientes com foto\n✅ Digitalizar documentos com OCR\n✅ Organizar prontuários\n✅ Buscar rapidamente\n\nPrecisa de ajuda específica?';
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-50 group"
          aria-label="Abrir chatbot"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">Assistente PhysioCapture</h3>
                <p className="text-xs text-blue-100">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Perguntas frequentes:</p>
              <div className="flex flex-wrap gap-2">
                {getCurrentSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua dúvida..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
