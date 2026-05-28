'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNotes, useCreateNote, useDeleteNote } from '@/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

export function NotesClient() {
  const { data: notes, isLoading } = useNotes();
  const create = useCreateNote();
  const remove = useDeleteNote();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ title, content }, {
      onSuccess: () => { setTitle(''); setContent(''); toast.success('Note created'); },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Saving…' : 'Add note'}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !notes?.length ? (
        <p className="text-muted-foreground">No notes yet. Add one above.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <Card key={n.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <h3 className="font-medium">{n.title}</h3>
                <p className="text-sm text-muted-foreground">{n.content}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(n.id)}>
                <Trash2 className="size-4" />
              </Button>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
