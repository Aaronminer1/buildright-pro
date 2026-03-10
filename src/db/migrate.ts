import { db } from './db';
import type { Project, ChecklistState } from '../types';
import type { Customer, Quote, Invoice, BOM, ContractorProfile } from '../types/business';
import { DEFAULT_PROFILE } from '../types/business';

const MIGRATION_KEY = 'brp_migrated_to_idb';

function readLS<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function migrateFromLocalStorage(): Promise<void> {
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    const projects  = readLS<Project[]>('brp_projects', []);
    const customers = readLS<Customer[]>('brp_customers', []);
    const quotes    = readLS<Quote[]>('brp_quotes', []);
    const invoices  = readLS<Invoice[]>('brp_invoices', []);
    const boms      = readLS<BOM[]>('brp_boms', []);
    const checklist = readLS<ChecklistState>('brp_checklists', {});
    const contractor = readLS<ContractorProfile>('brp_contractor', DEFAULT_PROFILE);
    const activeId   = readLS<string | null>('brp_active', null);

    await db.transaction('rw', [
      db.projects, db.customers, db.quotes, db.invoices,
      db.boms, db.settings, db.checklistPhases,
    ], async () => {
      if (projects.length)  await db.projects.bulkAdd(projects);
      if (customers.length) await db.customers.bulkAdd(customers);
      if (quotes.length)    await db.quotes.bulkAdd(quotes);
      if (invoices.length)  await db.invoices.bulkAdd(invoices);
      if (boms.length)      await db.boms.bulkAdd(boms);

      await db.settings.bulkPut([
        { key: 'contractor',      value: contractor },
        { key: 'activeProjectId', value: activeId },
      ]);

      // checklist: Record<phaseId, Record<itemId, boolean>> → flat rows
      const phaseRows = Object.entries(checklist).map(([phaseId, items]) => ({
        phaseId,
        items: items as Record<string, boolean>,
      }));
      if (phaseRows.length) await db.checklistPhases.bulkAdd(phaseRows);
    });

    localStorage.setItem(MIGRATION_KEY, '1');
  } catch (err) {
    console.warn('LocalStorage migration error (will retry on next load):', err);
  }
}
