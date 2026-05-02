import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Trade } from './types';

interface CoinLogDB extends DBSchema {
  trades: {
    key: number;
    value: Trade;
    indexes: {
      'by-openTime': string;
      'by-symbol': string;
      'by-exchange': string;
      'by-direction': string;
    };
  };
}

const DB_NAME = 'CoinLog-db';
const DB_VERSION = 1;
const STORE_NAME = 'trades';

let dbPromise: Promise<IDBPDatabase<CoinLogDB>> | null = null;

function getDB(): Promise<IDBPDatabase<CoinLogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CoinLogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-openTime', 'openTime');
        store.createIndex('by-symbol', 'symbol');
        store.createIndex('by-exchange', 'exchange');
        store.createIndex('by-direction', 'direction');
      },
    });
  }
  return dbPromise;
}

export async function getAllTrades(): Promise<Trade[]> {
  const db = await getDB();
  const trades = await db.getAllFromIndex(STORE_NAME, 'by-openTime');
  // Return in descending order (newest first)
  return trades.reverse();
}

export async function getTrade(id: number): Promise<Trade | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function addTrade(trade: Omit<Trade, 'id'>): Promise<number> {
  const db = await getDB();
  return db.add(STORE_NAME, trade as Trade);
}

export async function updateTrade(id: number, trade: Partial<Trade>): Promise<void> {
  const db = await getDB();
  const existing = await db.get(STORE_NAME, id);
  if (!existing) throw new Error(`Trade ${id} not found`);
  await db.put(STORE_NAME, { ...existing, ...trade, id });
}

export async function deleteTrade(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function bulkAddTrades(trades: Omit<Trade, 'id'>[]): Promise<number[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const ids = await Promise.all(
    trades.map((trade) => tx.store.add(trade as Trade))
  );
  await tx.done;
  return ids;
}

export async function clearAllTrades(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

// ---------------------------------------------------------------------------
// Bulk import with deduplication by exchangeOrderId
// ---------------------------------------------------------------------------

export interface DedupResult {
  inserted: number;
  skipped: number;
}

export async function addTradesWithDedup(
  trades: Omit<Trade, 'id'>[],
): Promise<DedupResult> {
  const db = await getDB();
  const existing = await db.getAll(STORE_NAME);
  const existingOrderIds = new Set(existing.map((t) => t.exchangeOrderId));

  let inserted = 0;
  let skipped = 0;

  const tx = db.transaction(STORE_NAME, 'readwrite');

  for (const trade of trades) {
    if (existingOrderIds.has(trade.exchangeOrderId)) {
      skipped++;
      continue;
    }

    await tx.store.add(trade as Trade);
    existingOrderIds.add(trade.exchangeOrderId);
    inserted++;
  }

  await tx.done;
  return { inserted, skipped };
}

// ---------------------------------------------------------------------------
// Testing utilities
// ---------------------------------------------------------------------------

/**
 * Reset the database connection. Useful for testing to ensure a clean state.
 */
export function resetDb(): void {
  dbPromise = null;
}
