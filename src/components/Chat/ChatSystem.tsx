import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'nutritionist' | 'bot';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Olá! Como você está se sentindo hoje com a dieta?',
    sender: 'nutritionist',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '2',
    content: 'Estou indo bem! Consegui completar todas as refeições ontem.',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
  },
  {
    id: '3',
    content: 'Excelente! Vi que você teve 100% de aderência ontem. Continue assim! 🎉',
    sender: 'nutritionist',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
];

export const ChatSystem = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate nutritionist response
    setTimeout(() => {
      const responses = [
        'Obrigada por compartilhar! Como posso te ajudar hoje?',
        'Ótimo feedback! Vou considerar isso no seu próximo plano.',
        'Entendi. Vamos ajustar sua dieta conforme necessário.',
        'Parabéns pelo progresso! Continue assim.',
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'nutritionist',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const getSenderName = (sender: string) => {
    switch (sender) {
      case 'nutritionist': return 'Dra. Maria';
      case 'bot': return 'NutriBot';
      default: return 'Você';
    }
  };

  const getSenderAvatar = (sender: string) => {
    switch (sender) {
      case 'nutritionist': return '👩‍⚕️';
      case 'bot': return '🤖';
      default: return '👤';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Chat com Nutricionista
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {getSenderAvatar(message.sender)}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-xs ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className="text-xs text-muted-foreground mb-1">
                    {getSenderName(message.sender)} • {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-primary hover:shadow-primary transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-sm">Solicitar Relatório</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="text-sm">Ajustar Dieta</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <span className="text-2xl">❓</span>
              <span className="text-sm">Tirar Dúvida</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <span className="text-2xl">📅</span>
              <span className="text-sm">Agendar Consulta</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};