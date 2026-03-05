import { useState, useEffect } from "react";
import { ref, onValue, push, serverTimestamp, query, limitToLast } from "firebase/database";
import { db } from "../lib/firebase";

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    agentId: string;
    text: string;
    timestamp: number;
}

export const useChat = (roomId: string | undefined) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (!roomId) return;

        const chatRef = query(ref(db, `rooms/${roomId}/messages`), limitToLast(50));

        const unsubscribe = onValue(chatRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const messagesList = Object.entries(data).map(([id, m]: [string, any]) => ({
                    id,
                    ...m as Omit<ChatMessage, 'id'>
                })).sort((a, b) => a.timestamp - b.timestamp);
                setMessages(messagesList);
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [roomId]);

    const sendMessage = async (senderId: string, senderName: string, agentId: string, text: string) => {
        if (!roomId || !text.trim()) return;

        const chatRef = ref(db, `rooms/${roomId}/messages`);
        await push(chatRef, {
            senderId,
            senderName,
            agentId,
            text: text.trim(),
            timestamp: serverTimestamp()
        });
    };

    return { messages, sendMessage };
};
