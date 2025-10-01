import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion';
  suggestions?: string[];
  quickActions?: { label: string; action: string }[];
}

const helpTopics = [
  { icon: "📝", label: "Como digitalizar documentos", query: "Como faço para digitalizar um documento?" },
  { icon: "👥", label: "Gerenciar pacientes", query: "Como adicionar um novo paciente?" },
  { icon: "📊", label: "Visualizar relatórios", query: "Onde encontro os relatórios de progresso?" },
  { icon: "⚙️", label: "Configurações do sistema", query: "Como configurar minhas preferências?" },
  { icon: "🔒", label: "Segurança e LGPD", query: "Como os dados são protegidos?" },
  { icon: "🎯", label: "Funcionalidades IA", query: "Quais recursos de IA estão disponíveis?" }
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1",
      text: "👋 Olá! Sou o assistente inteligente do PhysioCapture. Estou aqui para ajudar você a usar o sistema de forma eficiente!", 
      sender: "bot",
      timestamp: new Date(),
      type: "text",
      suggestions: [
        "Como digitalizar documentos?",
        "Como adicionar pacientes?",
        "Onde ver relatórios?"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): Message => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("digitalizar") || message.includes("documento") || message.includes("escanear")) {
      return {
        id: Date.now().toString(),
        text: "📄 Para digitalizar documentos no PhysioCapture:\n\n1. Vá para 'Digitalização de Documentos'\n2. Clique em 'Selecionar Arquivos' ou 'Escanear com Câmera'\n3. Escolha o tipo de documento (ficha, exame, etc.)\n4. O sistema processará automaticamente e indexará o documento\n\n✨ Dica: Você pode arrastar múltiplos arquivos de uma vez!",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
        quickActions: [
          { label: "Ir para Digitalização", action: "/documents" },
          { label: "Ver Tutoriais", action: "/help" }
        ]
      };
    }
    
    if (message.includes("paciente") || message.includes("adicionar") || message.includes("cadastrar")) {
      return {
        id: Date.now().toString(),
        text: "👥 Para gerenciar pacientes:\n\n1. Acesse 'Pacientes' no menu\n2. Clique em 'Novo Paciente'\n3. Preencha os dados básicos\n4. Use as ferramentas de digitalização para fichas\n5. Configure conexões com dispositivos se disponível\n\n🎯 O PhysioCapture conecta automaticamente os dados do paciente!",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
        quickActions: [
          { label: "Novo Paciente", action: "/patients/new" },
          { label: "Lista de Pacientes", action: "/patients" }
        ]
      };
    }
    
    if (message.includes("relatório") || message.includes("progresso") || message.includes("dados")) {
      return {
        id: Date.now().toString(),
        text: "📊 Relatórios e Análises:\n\n• Dashboard: Visão geral em tempo real\n• Atividades: Histórico detalhado\n• Prontuários: Dados completos por paciente\n• Evolução: Gráficos de progresso\n\n🤖 A IA do PhysioCapture analisa automaticamente os padrões de melhora!",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
        quickActions: [
          { label: "Ver Dashboard", action: "/dashboard" },
          { label: "Atividades", action: "/activities" }
        ]
      };
    }
    
    if (message.includes("ia") || message.includes("inteligente") || message.includes("automático")) {
      return {
        id: Date.now().toString(),
        text: "🧠 Recursos de IA no PhysioCapture:\n\n• Digitalização automática de fichas\n• Transcrição de áudio para texto\n• Análise de padrões de recuperação\n• Sugestões de tratamento baseadas em dados\n• Detecção automática de progressos\n\n✨ Tudo para otimizar seu tempo e melhorar os resultados!",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
        suggestions: [
          "Como funciona a transcrição?",
          "IA detecta que tipos de padrões?",
          "Como configurar a IA?"
        ]
      };
    }
    
    if (message.includes("lgpd") || message.includes("segurança") || message.includes("privacidade")) {
      return {
        id: Date.now().toString(),
        text: "🔒 Segurança e LGPD:\n\n• Todos os dados são criptografados\n• Conformidade total com LGPD\n• Consentimento explícito dos pacientes\n• Logs de auditoria completos\n• Backup automático e seguro\n\n🛡️ Seus dados e dos pacientes estão protegidos com padrões bancários!",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
        quickActions: [
          { label: "Ver Políticas", action: "/privacy" },
          { label: "Configurar Consentimentos", action: "/consent" }
        ]
      };
    }
    
    return {
      id: Date.now().toString(),
      text: "🤔 Entendi sua dúvida! Posso ajudar com várias funcionalidades do PhysioCapture. Que tal explorar uma dessas opções?",
      sender: "bot",
      timestamp: new Date(),
      type: "suggestion",
      suggestions: [
        "Digitalização de documentos",
        "Gerenciamento de pacientes", 
        "Recursos de IA",
        "Relatórios e análises",
        "Segurança dos dados"
      ]
    };
  };

  const handleSend = () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: "user",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentInput = input;
      setInput("");
      setIsTyping(true);
      
      setTimeout(() => {
        const botResponse = generateBotResponse(currentInput);
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      if (suggestion.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          text: suggestion,
          sender: "user",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);
        
        setTimeout(() => {
          const botResponse = generateBotResponse(suggestion);
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 1000);
      }
    }, 100);
  };

  const handleQuickTopicClick = (query: string) => {
    handleSuggestionClick(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-gradient-primary hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] shadow-2xl z-50">
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-gradient-primary text-white rounded-t-lg flex-shrink-0 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5" />
                  Assistente PhysioCapture
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    IA
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user' 
                            ? 'bg-primary text-white' 
                            : 'bg-secondary text-primary'
                        }`}>
                          {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        
                        <div className={`rounded-lg p-3 break-words ${
                          message.sender === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-secondary'
                        }`}>
                          <p className="text-sm whitespace-pre-line break-words">{message.text}</p>
                          
                          {message.suggestions && (
                            <div className="mt-3 space-y-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-left justify-start h-auto p-2 text-xs"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  <Lightbulb className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="break-words">{suggestion}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {message.quickActions && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                              {message.quickActions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs break-words"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-secondary rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {messages.length === 1 && (
                <div className="p-4 border-t flex-shrink-0">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Tópicos populares:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {helpTopics.map((topic, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-2 text-left justify-start"
                        onClick={() => handleQuickTopicClick(topic.query)}
                      >
                        <span className="mr-1 flex-shrink-0">{topic.icon}</span>
                        <span className="text-xs break-words">{topic.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua dúvida..."
                    className="flex-1 text-sm"
                  />
                  <Button 
                    onClick={handleSend} 
                    size="icon"
                    className="bg-gradient-primary hover:opacity-90 flex-shrink-0"
                    disabled={!input.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  💡 Digite perguntas sobre digitalização, pacientes, IA ou relatórios
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}