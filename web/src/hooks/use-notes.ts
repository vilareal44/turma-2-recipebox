'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Note } from '@/db/schema';
import type { CreateNoteInput, UpdateNoteInput } from '@/lib/validators';

export function useNotes() {
  return useQuery({ queryKey: ['notes'], queryFn: () => api.get<Note[]>('/api/notes') });
}

export function useNote(id: number) {
  return useQuery({ queryKey: ['notes', id], queryFn: () => api.get<Note>(`/api/notes/${id}`), enabled: !!id });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoteInput) => api.post<Note>('/api/notes', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}

export function useUpdateNote(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateNoteInput) => api.put<Note>(`/api/notes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<{ success: true }>(`/api/notes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}
