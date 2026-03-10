import { db } from './db';

const SETTING_KEY = 'pinHash';

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'brp-salt-v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getPinHash(): Promise<string | null> {
  const row = await db.settings.get(SETTING_KEY);
  return row ? (row.value as string) : null;
}

export async function isPinEnabled(): Promise<boolean> {
  const hash = await getPinHash();
  return hash !== null && hash !== '';
}

export async function setPin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await db.settings.put({ key: SETTING_KEY, value: hash });
}

export async function removePin(): Promise<void> {
  await db.settings.delete(SETTING_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await getPinHash();
  if (!stored) return true; // no PIN set
  const attempt = await hashPin(pin);
  return attempt === stored;
}
