'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { MessageCircle, Send, User, ChevronLeft, Building } from 'lucide-react';

interface Conversation {
    id: number;
    name: string;
    company_name: string;
    email: string;
    unread_count: number;
    last_message_at: string;
    last_message: string;
}

interface Message {
    id: number;
    user_id: number;
    sender_role: 'user' | 'admin';
    message: string;
    is_read: number;
    created_at: string;
}

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        setLoading(true);
        const res = await fetch('/api/messages');
        if (res.ok) setConversations(await res.json());
        setLoading(false);
    };

    const openConversation = async (user: Conversation) => {
        setSelectedUser(user);
        const res = await fetch(`/api/messages?userId=${user.id}`);
        if (res.ok) {
            setMessages(await res.json());
            // Update unread count locally
            setConversations(prev => prev.map(c => c.id === user.id ? { ...c, unread_count: 0 } : c));
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUser || sending) return;
        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage, userId: selectedUser.id }),
            });
            if (res.ok) {
                setNewMessage('');
                // Refresh messages
                const msgRes = await fetch(`/api/messages?userId=${selectedUser.id}`);
                if (msgRes.ok) setMessages(await msgRes.json());
            }
        } finally {
            setSending(false);
        }
    };

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    Mesajlar
                    {totalUnread > 0 && (
                        <span className="text-base bg-red-500 text-white px-2.5 py-1 rounded-full font-bold">
                            {totalUnread}
                        </span>
                    )}
                </h1>
                <p className="text-gray-500 mt-1">Bayilerle özel mesajlaşmalar.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
                {/* Conversation List */}
                <Card className={`border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden flex flex-col ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Konuşmalar</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-gray-400 text-sm">Henüz mesaj yok.</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => openConversation(conv)}
                                    className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 ${selectedUser?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{conv.name}</span>
                                                {conv.unread_count > 0 && (
                                                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.company_name && (
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                    <Building className="w-3 h-3" /> {conv.company_name}
                                                </div>
                                            )}
                                            {conv.last_message && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">{conv.last_message}</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* Chat Window */}
                <div className={`lg:col-span-2 flex flex-col ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
                    {!selectedUser ? (
                        <Card className="flex-1 border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex items-center justify-center">
                            <div className="text-center">
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-400">Bir konuşma seçin</p>
                            </div>
                        </Card>
                    ) : (
                        <Card className="flex-1 border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex flex-col overflow-hidden">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{selectedUser.name}</div>
                                    <div className="text-xs text-gray-500">{selectedUser.email}</div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-400 text-sm">Henüz mesaj yok. İlk mesajı gönderin.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender_role === 'admin'
                                                ? 'bg-primary text-white rounded-br-sm'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                                                }`}>
                                                <p className="text-sm">{msg.message}</p>
                                                <p className={`text-xs mt-1 ${msg.sender_role === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    {' '}
                                                    {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
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
                                        placeholder={`${selectedUser.name}'a mesaj gönder...`}
                                        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim() || sending}
                                        className="p-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
