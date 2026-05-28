import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'node:fs';

if (!process.env.DATABASE_URL) {
  try {
    const file = readFileSync('.env.local', 'utf8');
    const match = file.match(/^\s*DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/m);
    if (match) process.env.DATABASE_URL = match[1];
  } catch {
    // .env.local not present yet
  }
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
