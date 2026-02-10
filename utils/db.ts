import type { BaziChart } from '../constants';

export interface HistoryRecord {
    id: string;
    timestamp: number;
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    chart: BaziChart;
    aiContent: Record<string, string>;
}

const DB_NAME = 'ImperialBaziProDB';
const STORE_NAME = 'history';
const DB_VERSION = 1;

export class BaziDB {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        if (this.db) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    async addRecord(record: HistoryRecord): Promise<void> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(record);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getAllRecords(): Promise<HistoryRecord[]> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                // Sort by timestamp descending
                const records = request.result as HistoryRecord[];
                records.sort((a, b) => b.timestamp - a.timestamp);
                resolve(records);
            };
        });
    }

    async deleteRecord(id: string): Promise<void> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async clearAll(): Promise<void> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

export const baziDb = new BaziDB();
