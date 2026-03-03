import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { db } from "../lib/firebase";
import { Room, Player } from "../types";

export const useRoom = (roomId: string | undefined) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [status, setStatus] = useState<Room['status']>('lobby');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const roomRef = ref(db, `rooms/${roomId}`);

        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val() as Room;
                console.log(`[useRoom] Update: Status=${data.status}, Host=${data.hostId?.substring(0, 4)}`);
                setRoom(data);
                setStatus(data.status);

                // Convert players object to array and ensure data quality
                const playersList = data.players
                    ? Object.entries(data.players).map(([id, p]) => ({
                        ...p,
                        id: p.id || id,
                        effects: p.effects || {
                            blurred: false,
                            flashed: false,
                            scrambledWords: [],
                            frozen: false,
                            inputLocked: false,
                            progressHidden: false
                        }
                    }))
                    : [];
                setPlayers(playersList);

                setLoading(false);
            } else {
                setError("Room not found");
                setLoading(false);
            }
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [roomId]);

    return { room, players, status, loading, error };
};
