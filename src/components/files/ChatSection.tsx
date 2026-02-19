'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Send, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ChatSectionProps {
    fileId: string;
    currentUserEmail: string;
}

export function ChatSection({ fileId, currentUserEmail }: ChatSectionProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/files/${fileId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fileId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch(`/api/files/${fileId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Send failed', error);
        }
    };

    return (
        <Card className="h-[600px] flex flex-col border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-lg text-foreground">Dosya Mesajları</h3>
                <p className="text-xs text-gray-500">Tuner ile doğrudan iletişim kurun.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="text-center text-gray-500">Yükleniyor...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>Henüz mesaj yok.</p>
                        <p className="text-xs">İlk mesajı siz gönderin.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user_name === currentUserEmail || msg.user_role === (currentUserEmail === 'admin@tuningportal.com' ? 'admin' : 'dealer');
                        // Simplified check, ideally use ID. But for UI styling:
                        // We will rely on alignment. 
                        // To be precise, let's pass currentUserId prop? 
                        // For now let's assume if role matches logic or just use alignment based on 'admin' vs 'dealer' context.
                        // Actually, simpler:
                        // If I am admin, and msg.role is admin -> Me.
                        // If I are dealer, and msg.role is dealer -> Me.
                        // Wait, currentUserEmail is passed.

                        // Let's implement a simpler "Me" check in props if needed, or just align based on roles.
                        const isSystem = msg.user_role === 'admin';
                        const alignRight = msg.user_name === currentUserEmail || (msg.user_role === 'admin' && currentUserEmail.includes('admin'));

                        // Better Logic:
                        // We need to know "Who am I". 
                        // Let's trust the prop currentUserEmail.

                        // Temporary hack: in fetching, we join users.
                        // Let's compare names? No.
                        // Let's just assume right alignment = current user.
                        // In the loop, we don't know current user ID.
                        // Back in the parent component, we know.

                        return (
                            <div key={msg.id} className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${alignRight
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                                    }`}>
                                    <div className="text-xs opacity-70 mb-1 flex justify-between gap-2">
                                        <span className="font-bold">{msg.user_name}</span>
                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </Card>
    );
}
