import { useState, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { AIMessage, Pet } from '../types';

interface ChatBotProps {
    pet: Pet;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ChatBot({ pet, isOpen, onOpenChange }: ChatBotProps) {
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: '1',
            sender: 'bot',
            text: `Merhaba! ${pet.name} hakkında merak ettiğin her şeyi sorabilirsin. Örn: "Apartmana uygun mu?"`,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMessages([
            {
                id: '1',
                sender: 'bot',
                text: `Merhaba! ${pet.name} hakkında merak ettiğin her şeyi sorabilirsin. Örn: "Apartmana uygun mu?"`,
                timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            },
        ]);
    }, [pet.id, pet.name]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: AIMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pet: {
                        name: pet.name,
                        type: pet.type,
                        description: pet.description
                    },
                    userMessage: userMessage.text
                }),
            });

            if (!response.ok) {
                throw new Error('API Hatası');
            }

            const data = await response.json();

            const botMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: data.response || 'Bir hata oluştu, yanıt alınamadı.',
                timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: 'Üzgünüm, şu an yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
                timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => onOpenChange(true)}
                    className="relative group"
                >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-2xl hover:scale-110 transition-transform duration-300">
                        <img
                            src="https://images.unsplash.com/photo-1633093823511-fa9d7d5699a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGV0JTIwYXZhdGFyfGVufDF8fHx8MTc2NzI4MTAxMXww&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="PetAdopt AI"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute bottom-20 right-0 w-72 bg-white rounded-2xl shadow-2xl p-4 animate-bounce">
                        <div className="absolute -bottom-3 right-8 w-0 h-0 border-l-[15px] border-l-transparent border-t-[20px] border-t-white border-r-[15px] border-r-transparent"></div>
                        <div className="flex items-start gap-2">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2 flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-gray-900 mb-1">PetAdopt AI</p>
                                <p className="text-sm text-gray-700">
                                    Merhaba! {pet.name} hakkında merak ettiğin her şeyi sorabilirsin.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 bg-yellow-400 rounded-full p-1 animate-pulse">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-2xl flex-shrink-0 mb-2">
                <img
                    src="https://images.unsplash.com/photo-1633093823511-fa9d7d5699a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGV0JTIwYXZhdGFyfGVufDF8fHx8MTc2NzI4MTAxMXww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="PetAdopt AI"
                    className="w-full h-full object-cover"
                />
            </div>

            <Card className="w-[380px] h-[520px] shadow-2xl flex flex-col relative">
                <div className="absolute -left-3 bottom-8 w-0 h-0 border-t-[12px] border-t-transparent border-r-[20px] border-r-white border-b-[12px] border-b-transparent"></div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        <div>
                            <h3 className="font-semibold">PetAdopt AI</h3>
                            <p className="text-sm text-blue-100">Ben size yardımcı olabilirim! 🐾</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="text-white hover:bg-white/20"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                    }`}
                            >
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {message.timestamp}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-sm text-gray-500">Yazıyor...</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e: any) => setInputValue(e.target.value)}
                            onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
                            placeholder="Mesajınızı yazın..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button onClick={handleSend} size="icon" disabled={isLoading}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
