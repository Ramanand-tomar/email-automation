import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmails, getEmailById, getThreadById,
  sendEmail, replyToEmail, modifyEmail, deleteEmail, syncEmails,
} from '../services/api';
import toast from 'react-hot-toast';

export function useEmailList(folder = 'inbox', page = 1) {
  return useQuery({
    queryKey: ['emails', folder, page],
    queryFn: () => getEmails(folder, page, 25).then(r => r.data),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useEmailDetail(id) {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => getEmailById(id).then(r => r.data),
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useThread(threadId) {
  return useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => getThreadById(threadId).then(r => r.data),
    enabled: !!threadId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => sendEmail(payload).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails', 'sent'] });
      toast.success('Email sent!');
    },
    onError: () => toast.error('Failed to send email'),
  });
}

export function useReplyToEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => replyToEmail(id, payload).then(r => r.data),
    onSuccess: (_, { threadId }) => {
      if (threadId) queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'sent'] });
      toast.success('Reply sent!');
    },
    onError: () => toast.error('Failed to send reply'),
  });
}

export function useModifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => modifyEmail(id, action).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: () => toast.error('Action failed'),
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteEmail(id).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email moved to trash');
    },
    onError: () => toast.error('Failed to delete email'),
  });
}

export function useSyncEmails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncEmails().then(r => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      const count = data?.newEmails?.length || 0;
      toast.success(count > 0 ? `Synced ${count} new email(s)` : 'Inbox is up to date');
    },
    onError: () => toast.error('Sync failed'),
  });
}
