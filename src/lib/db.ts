import { TFA } from "@/interfaces";

const TABLE_NAME = "totp";
const DB_NAME = "2FA_AUTH";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(TABLE_NAME)) {
        const objectStore = db.createObjectStore(TABLE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        objectStore.createIndex("value", "value", { unique: false });
      }
    };

    request.onsuccess = function (event: Event) {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = function (event: Event) {
      console.log("fail perro");
      reject((event.target as IDBOpenDBRequest).error?.message);
    };
  });
}

type Trx = (obj: IDBObjectStore) => IDBRequest<any>;

interface TrxResponse<T> {
  error: DOMException | null;
  data: T | null;
}

interface Record {
  id: number;
  value: string;
}

export class DB {
  db!: IDBDatabase;

  constructor() {
    this.init();
  }

  async init() {
    this.db = await openDatabase();
  }

  createTransaction<T>(trx: Trx) {
    return new Promise<TrxResponse<T>>((resolve) => {
      const transaction = this.db.transaction([TABLE_NAME], "readwrite");
      const objectStore = transaction.objectStore(TABLE_NAME);

      const request = trx(objectStore);

      request.onsuccess = function (event: Event) {
        const res = (event.target as IDBRequest).result;
        resolve({ error: null, data: res as T });
      };

      request.onerror = function (event: Event) {
        const err = (event.target as IDBRequest).error;
        resolve({ error: err, data: null });
      };
    });
  }

  async save(value: string) {
    const { data, error } = await this.createTransaction<string>((obj) =>
      obj.add({ value })
    );

    return data;
  }

  async getAll() {
    const { data, error } = await this.createTransaction<Record[]>((obj) =>
      obj.getAll()
    );

    return data;
  }

  getOne() {}

  async update(id: number, value: string) {
    const { data, error } = await this.createTransaction<void>((obj) =>
      obj.put({ id, value })
    );

    return data;
  }

  async delete(id: number) {
    const { data, error } = await this.createTransaction<void>((obj) =>
      obj.delete(id)
    );

    return data;
  }
}

export const getDb = async () => {
  const db = new DB();
  await db.init();
  return db;
};
