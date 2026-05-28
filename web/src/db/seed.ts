import { db } from './index';
import { notes } from './schema';

async function seed() {
  await db.insert(notes).values([
    { title: 'Welcome', content: 'This note proves the full stack works end-to-end.' },
    { title: 'Next steps', content: 'Delete the notes feature and build your own.' },
  ]);
  console.log('Seeded.');
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
