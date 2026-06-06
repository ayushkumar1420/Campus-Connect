import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    const initSocket = async () => {
      const user = await api.auth.getUser();
      if (user) {
        socketRef.current.emit('join_room', user.id);
      }
    };

    initSocket();

    // Listen to global events
    socketRef.current.on('POST_CREATED', () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['profile']);
      queryClient.invalidateQueries(['userPosts']);
    });

    socketRef.current.on('POST_DELETED', () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['profile']);
      queryClient.invalidateQueries(['userPosts']);
    });

    socketRef.current.on('PROFILE_UPDATED', () => {
      queryClient.invalidateQueries(['profile']);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [queryClient]);

  return socketRef.current;
}
