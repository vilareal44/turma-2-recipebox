'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Recipe } from '@/db/schema';
import type { CreateRecipeInput, UpdateRecipeInput } from '@/lib/validators';

export function useRecipes(category?: string) {
  const url = category ? `/api/recipes?category=${category}` : '/api/recipes';
  return useQuery({ queryKey: ['recipes', category], queryFn: () => api.get<Recipe[]>(url) });
}

export function useRecipe(id: number) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => api.get<Recipe>(`/api/recipes/${id}`),
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecipeInput) => api.post<Recipe>('/api/recipes', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useUpdateRecipe(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRecipeInput) => api.put<Recipe>(`/api/recipes/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] });
      qc.invalidateQueries({ queryKey: ['recipe', id] });
    },
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<{ success: true }>(`/api/recipes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}
