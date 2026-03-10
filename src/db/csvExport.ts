import { db } from './db';
import { calcQuoteTotals, calcInvoiceTotals } from '../types/business';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function esc(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function row(...cells: unknown[]): string {
  return cells.map(esc).join(',');
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dateTag(): string {
  return new Date().toISOString().split('T')[0];
}

// ──────────────────────────────────────────────────────────────────────────────
// Individual table exports
// ──────────────────────────────────────────────────────────────────────────────

export async function exportCustomersCSV(): Promise<void> {
  const rows = await db.customers.toArray();
  const headers = row('ID', 'Name', 'Company', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip', 'Notes', 'Created');
  const lines = rows.map(c =>
    row(c.id, c.name, c.company, c.email, c.phone, c.address, c.city, c.state, c.zip, c.notes, c.createdAt)
  );
  triggerDownload([headers, ...lines].join('\n'), `buildright-customers-${dateTag()}.csv`);
}

export async function exportProjectsCSV(): Promise<void> {
  const rows = await db.projects.toArray();
  const headers = row('ID', 'Project Name', 'Client', 'Address', 'Phase', 'Sq Ft', 'Stories', 'Start Date', 'Est. End', 'Notes', 'Created');
  const lines = rows.map(p =>
    row(p.id, p.name, p.client, p.address, p.phase, p.sqft, p.stories, p.startDate, p.estimatedEnd, p.notes, p.createdAt)
  );
  triggerDownload([headers, ...lines].join('\n'), `buildright-projects-${dateTag()}.csv`);
}

export async function exportQuotesCSV(): Promise<void> {
  const [quotes, customers] = await Promise.all([db.quotes.toArray(), db.customers.toArray()]);
  const custMap = Object.fromEntries(customers.map(c => [c.id, c.name]));

  // Summary sheet
  const summaryHeaders = row('Quote #', 'Customer', 'Project', 'Job Site', 'Date', 'Valid Until', 'Status', 'Subtotal', 'Tax', 'Total');
  const summaryLines = quotes.map(q => {
    const { subtotal, tax, total } = calcQuoteTotals(q);
    return row(q.quoteNumber, custMap[q.customerId] ?? '', q.projectName, q.jobSiteAddress, q.dateCreated, q.validUntil, q.status, subtotal.toFixed(2), tax.toFixed(2), total.toFixed(2));
  });

  // Line-items sheet
  const itemHeaders = row('Quote #', 'Customer', 'Project', 'Category', 'Description', 'Qty', 'Unit', 'Unit Cost', 'Markup %', 'Line Total', 'Notes');
  const itemLines = quotes.flatMap(q =>
    q.lineItems.map(item => {
      const lineTotal = Math.round(item.qty * item.unitCost * (1 + item.markupPct / 100) * 100) / 100;
      return row(q.quoteNumber, custMap[q.customerId] ?? '', q.projectName, item.category, item.description, item.qty, item.unit, item.unitCost.toFixed(2), item.markupPct, lineTotal.toFixed(2), item.notes);
    })
  );

  const csv = [
    '=== QUOTES SUMMARY ===',
    summaryHeaders,
    ...summaryLines,
    '',
    '=== QUOTE LINE ITEMS ===',
    itemHeaders,
    ...itemLines,
  ].join('\n');

  triggerDownload(csv, `buildright-quotes-${dateTag()}.csv`);
}

export async function exportInvoicesCSV(): Promise<void> {
  const [invoices, customers] = await Promise.all([db.invoices.toArray(), db.customers.toArray()]);
  const custMap = Object.fromEntries(customers.map(c => [c.id, c.name]));

  // Summary sheet
  const summaryHeaders = row('Invoice #', 'Customer', 'Project', 'Date Issued', 'Due Date', 'Status', 'Subtotal', 'Tax', 'Total', 'Amount Paid', 'Balance Due');
  const summaryLines = invoices.map(inv => {
    const { subtotal, tax, total, amountPaid, balance } = calcInvoiceTotals(inv);
    return row(inv.invoiceNumber, custMap[inv.customerId] ?? '', inv.projectName, inv.dateIssued, inv.dateDue, inv.status, subtotal.toFixed(2), tax.toFixed(2), total.toFixed(2), amountPaid.toFixed(2), balance.toFixed(2));
  });

  // Payments detail
  const payHeaders = row('Invoice #', 'Customer', 'Payment Date', 'Amount', 'Method', 'Reference', 'Notes');
  const payLines = invoices.flatMap(inv =>
    (inv.payments ?? []).map(p =>
      row(inv.invoiceNumber, custMap[inv.customerId] ?? '', p.date, p.amount.toFixed(2), p.method, p.reference, p.notes)
    )
  );

  const csv = [
    '=== INVOICES SUMMARY ===',
    summaryHeaders,
    ...summaryLines,
    '',
    '=== PAYMENT HISTORY ===',
    payHeaders,
    ...payLines,
  ].join('\n');

  triggerDownload(csv, `buildright-invoices-${dateTag()}.csv`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Combined "everything in one workbook" export
// Opens in Excel/Sheets as one file with clear section breaks
// ──────────────────────────────────────────────────────────────────────────────

export async function exportAllSpreadsheetsCSV(): Promise<void> {
  const [projects, customers, quotes, invoices] = await Promise.all([
    db.projects.toArray(),
    db.customers.toArray(),
    db.quotes.toArray(),
    db.invoices.toArray(),
  ]);
  const custMap = Object.fromEntries(customers.map(c => [c.id, c.name]));

  const sections: string[] = [];

  // ── Customers ──
  sections.push('=== CUSTOMERS ===');
  sections.push(row('Name', 'Company', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip', 'Notes'));
  customers.forEach(c =>
    sections.push(row(c.name, c.company, c.email, c.phone, c.address, c.city, c.state, c.zip, c.notes))
  );
  sections.push('');

  // ── Projects ──
  sections.push('=== PROJECTS ===');
  sections.push(row('Project Name', 'Client', 'Address', 'Phase', 'Sq Ft', 'Start Date', 'Est. End', 'Notes'));
  projects.forEach(p =>
    sections.push(row(p.name, p.client, p.address, p.phase, p.sqft, p.startDate, p.estimatedEnd, p.notes))
  );
  sections.push('');

  // ── Quotes ──
  sections.push('=== QUOTES ===');
  sections.push(row('Quote #', 'Customer', 'Project', 'Date', 'Status', 'Subtotal', 'Tax', 'Total'));
  quotes.forEach(q => {
    const { subtotal, tax, total } = calcQuoteTotals(q);
    sections.push(row(q.quoteNumber, custMap[q.customerId] ?? '', q.projectName, q.dateCreated, q.status, subtotal.toFixed(2), tax.toFixed(2), total.toFixed(2)));
  });
  sections.push('');

  // ── Invoices ──
  sections.push('=== INVOICES ===');
  sections.push(row('Invoice #', 'Customer', 'Project', 'Date Issued', 'Due Date', 'Status', 'Total', 'Paid', 'Balance'));
  invoices.forEach(inv => {
    const { total, amountPaid, balance } = calcInvoiceTotals(inv);
    sections.push(row(inv.invoiceNumber, custMap[inv.customerId] ?? '', inv.projectName, inv.dateIssued, inv.dateDue, inv.status, total.toFixed(2), amountPaid.toFixed(2), balance.toFixed(2)));
  });

  triggerDownload(sections.join('\n'), `buildright-spreadsheet-${dateTag()}.csv`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Web Share API — lets user send the backup file via email, iCloud, Google Drive
// ──────────────────────────────────────────────────────────────────────────────

export async function shareBackupFile(): Promise<'shared' | 'cancelled' | 'unsupported'> {
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

  const json = JSON.stringify(backup, null, 2);
  const filename = `buildright-backup-${dateTag()}.json`;
  const file = new File([json], filename, { type: 'application/json' });

  if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
    return 'unsupported';
  }

  try {
    await navigator.share({
      title: 'BuildRight Pro Backup',
      text: `BuildRight Pro data backup — ${dateTag()}. Open this file in BuildRight Pro to restore.`,
      files: [file],
    });
    return 'shared';
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
    return 'unsupported';
  }
}
