import Dexie, { type Table } from 'dexie';
import type { Project } from '../types';
import type { Customer, Quote, Invoice, BOM } from '../types/business';

export interface SettingRow {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface ChecklistPhaseRow {
  phaseId: string;
  items: Record<string, boolean>;
}

class BuildRightDB extends Dexie {
  projects!:        Table<Project,          string>;
  customers!:       Table<Customer,         string>;
  quotes!:          Table<Quote,            string>;
  invoices!:        Table<Invoice,          string>;
  boms!:            Table<BOM,              string>;
  settings!:        Table<SettingRow,       string>;
  checklistPhases!: Table<ChecklistPhaseRow, string>;

  constructor() {
    super('buildright_pro');
    this.version(1).stores({
      projects:        'id, name, client, phase, createdAt',
      customers:       'id, name, email, createdAt',
      quotes:          'id, quoteNumber, customerId, status, dateCreated',
      invoices:        'id, invoiceNumber, customerId, status, dateIssued',
      boms:            'id, projectId, dateCreated',
      settings:        'key',
      checklistPhases: 'phaseId',
    });
  }
}

export const db = new BuildRightDB();
