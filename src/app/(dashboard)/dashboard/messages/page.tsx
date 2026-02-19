'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { MessageCircle, Send, ShieldCheck } from 'lucide-react';

interface Message {
    id: number;
    sender_role: 'user' | 'admin';
    message: string;
    is_read: number;
    created_at: string;
}

export default function UserMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        const res = await fetch('/api/messages');
        if (res.ok) setMessages(await res.json());
        setLoading(false);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            });
            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Destek Merkezi</h1>
                <p className="text-gray-500 mt-1">Admin ile doğrudan iletişim kurun.</p>
            </div>

            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Admin Destek</div>
                        <div className="text-xs text-gray-500">Mesajlarınız yalnızca admin tarafından görülür</div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="text-gray-400 text-sm font-medium">Henüz mesaj yok</p>
                            <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">
                                Admin'e soru veya talebinizi iletebilirsiniz.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender_role === 'admin' && (
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0 mt-auto">
                                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                )}
                                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${msg.sender_role === 'user'
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                                    }`}>
                                    {msg.sender_role === 'admin' && (
                                        <p className="text-xs font-semibold text-primary mb-1 dark:text-primary">Admin</p>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                    <p className={`text-xs mt-1.5 ${msg.sender_role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleString('tr-TR', {
                                            day: '2-digit', month: '2-digit', year: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder="Admin'e mesaj gönderin..."
                            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            className="p-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {sending
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <Send className="w-5 h-5" />
                            }
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Bu konuşma yalnızca siz ve admin arasındadır. Başka kullanıcılar göremez.
                    </p>
                </div>
            </Card>
        </div>
    );
}
