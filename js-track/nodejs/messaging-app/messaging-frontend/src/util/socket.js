import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket;
export function getSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket"],
            autoConnect: false,
        });
    }
    return socket;
}