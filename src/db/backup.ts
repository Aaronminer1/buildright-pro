import { db } from './db';

export async function exportBackup(): Promise<void> {
  const [projects, customers, quotes, invoices, boms, settings, checklistPhases] =
    await Promise.all([
      db.projects.toArray(),
      db.customers.toArray(),
      db.quotes.toArray(),
      db.invoices.toArray(),
      db.boms.toArray(),
      db.settings.toArray(),
      db.checklistPhases.toArray(),
    ]);

  const backup = {
    version: 1,
    app: 'BuildRight Pro',
    exported: new Date().toISOString(),
    projects,
    customers,
    quotes,
    invoices,
    boms,
    settings,
    checklistPhases,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `buildright-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();

  let data: ReturnType<typeof JSON.parse>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid backup file — could not read JSON.');
  }

  if (!data.version || !Array.isArray(data.projects)) {
    throw new Error('Invalid backup file — missing required fields.');
  }

  await db.transaction('rw', [
    db.projects, db.customers, db.quotes, db.invoices,
    db.boms, db.settings, db.checklistPhases,
  ], async () => {
    await Promise.all([
      db.projects.clear(),
      db.customers.clear(),
      db.quotes.clear(),
      db.invoices.clear(),
      db.boms.clear(),
      db.settings.clear(),
      db.checklistPhases.clear(),
    ]);
    await Promise.all([
      db.projects.bulkPut(data.projects ?? []),
      db.customers.bulkPut(data.customers ?? []),
      db.quotes.bulkPut(data.quotes ?? []),
      db.invoices.bulkPut(data.invoices ?? []),
      db.boms.bulkPut(data.boms ?? []),
      db.settings.bulkPut(data.settings ?? []),
      db.checklistPhases.bulkPut(data.checklistPhases ?? []),
    ]);
  });
}
