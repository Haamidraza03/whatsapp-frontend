import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const socket = io(SOCKET_SERVER_URL);

export default socket;
