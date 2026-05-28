import Link from 'next/link';
import { NotebookPen } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <NotebookPen className="size-5" /> <span>Notes</span>
        </Link>
      </div>
    </header>
  );
}
