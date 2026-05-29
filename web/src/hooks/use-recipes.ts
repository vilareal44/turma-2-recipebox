'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Recipe } from '@/db/schema';
import type { CreateRecipeInput, UpdateRecipeInput } from '@/lib/validators';

export function useRecipes(category?: string, onlyFavorites?: boolean) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (onlyFavorites) params.append('favorites', 'true');
  const url = params.toString() ? `/api/recipes?${params.toString()}` : '/api/recipes';
  return useQuery({ queryKey: ['recipes', category, onlyFavorites], queryFn: () => api.get<Recipe[]>(url) });
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

export function useToggleFavorite(id: number, currentValue: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.put<Recipe>(`/api/recipes/${id}`, { isFavorite: !currentValue }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['recipes'] });
      await qc.cancelQueries({ queryKey: ['recipe', id] });

      const previousRecipe = qc.getQueryData<Recipe>(['recipe', id]);
      const previousLists = qc.getQueriesData<Recipe[]>({ queryKey: ['recipes'] });

      if (previousRecipe) {
        qc.setQueryData(['recipe', id], { ...previousRecipe, isFavorite: !currentValue });
      }

      previousLists.forEach(([key]) => {
        qc.setQueryData(key, (old: Recipe[] | undefined) =>
          old?.map((r) => (r.id === id ? { ...r, isFavorite: !currentValue } : r))
        );
      });

      return { previousRecipe, previousLists };
    },
    onError: (_, __, context) => {
      toast.error('Erro ao atualizar favorito');
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
      if (context?.previousRecipe) {
        qc.setQueryData(['recipe', id], context.previousRecipe);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['recipes'], exact: false });
      qc.invalidateQueries({ queryKey: ['recipe', id] });
    },
  });
}
