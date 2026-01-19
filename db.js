// db.js
const DB_NAME = 'bodrumDB';
const STORE_PROFILE = 'profile';
const STORE_ORDERS = 'orders';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ORDERS)) {
        db.createObjectStore(STORE_ORDERS, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function saveProfileDB({ name, phone }) {
  const db = await openDB();
  const tx = db.transaction(STORE_PROFILE, 'readwrite');
  const store = tx.objectStore(STORE_PROFILE);
  await store.put({ id: 1, name, phone });
  await tx.complete;
}

export async function getProfileDB() {
  const db = await openDB();
  const tx = db.transaction(STORE_PROFILE, 'readonly');
  const store = tx.objectStore(STORE_PROFILE);
  const res = await store.get(1);
  await tx.complete;
  return res;
}

export async function addOrderDB({ text, date }) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, 'readwrite');
  const store = tx.objectStore(STORE_ORDERS);
  await store.add({ text, date });
  await tx.complete;
}

export async function getOrdersDB() {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, 'readonly');
  const store = tx.objectStore(STORE_ORDERS);
  const res = await store.getAll();
  await tx.complete;
  return res.reverse();
}