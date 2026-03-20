import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuth } from './useAuth';

export function useSocket(onNewEmails) {
  const { googleId } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!googleId) return;

    connectSocket(googleId, (data) => {
      const count = data.count || 0;
      toast(`${count} new email${count !== 1 ? 's' : ''} arrived`, {
        icon: '📬',
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['emails', 'inbox', 1] });
      if (onNewEmails) onNewEmails(data);
    });

    return () => disconnectSocket();
  }, [googleId]);
}
