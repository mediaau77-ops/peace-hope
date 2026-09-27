import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface UnifiedDB extends DBSchema {
  messages: {
    key: string;
    value: any;
    indexes: { 'by-room': string; 'by-created': string };
  };
  rooms: {
    key: string;
    value: any;
  };
  outbox: {
    key: string;
    value: {
      id: string;
      roomId: string;
      payload: any;
      timestamp: string;
      attempts: number;
    };
  };
  drafts: {
    key: string;
    value: {
      roomId: string;
      text: string;
      replyToId?: string;
      updatedAt: string;
    };
  };
  presence: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'peace_hope_unified_store';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<UnifiedDB>> | null = null;

function getDB(): Promise<IDBPDatabase<UnifiedDB>> {
  if (!dbPromise) {
    dbPromise = openDB<UnifiedDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
          msgStore.createIndex('by-room', 'room_id');
          msgStore.createIndex('by-created', 'created_at');
        }
        if (!db.objectStoreNames.contains('rooms')) {
          db.createObjectStore('rooms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('outbox')) {
          db.createObjectStore('outbox', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'roomId' });
        }
        if (!db.objectStoreNames.contains('presence')) {
          db.createObjectStore('presence', { keyPath: 'user_id' });
        }
      },
    }).catch((err) => {
      console.debug('IndexedDB unavailable or blocked:', err);
      throw err;
    });
  }
  return dbPromise;
}

export async function saveMessagesOffline(messages: any[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('messages', 'readwrite');
    for (const msg of messages) {
      if (msg && msg.id) {
        await tx.store.put(msg);
      }
    }
    await tx.done;
  } catch (err) {
    console.debug('Failed to save messages offline:', err);
  }
}

export async function getOfflineMessages(roomId: string): Promise<any[]> {
  try {
    const db = await getDB();
    const index = db.transaction('messages').store.index('by-room');
    const messages = await index.getAll(roomId);
    return messages.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  } catch (err) {
    console.debug('Failed to get offline messages:', err);
    return [];
  }
}

export async function saveRoomsOffline(rooms: any[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('rooms', 'readwrite');
    for (const room of rooms) {
      if (room && room.id) {
        await tx.store.put(room);
      }
    }
    await tx.done;
  } catch (err) {
    console.debug('Failed to save rooms offline:', err);
  }
}

export async function getOfflineRooms(): Promise<any[]> {
  try {
    const db = await getDB();
    return await db.getAll('rooms');
  } catch (err) {
    console.debug('Failed to get offline rooms:', err);
    return [];
  }
}

export async function queueOutboxMessage(item: {
  id: string;
  roomId: string;
  payload: any;
}): Promise<void> {
  try {
    const db = await getDB();
    await db.put('outbox', {
      ...item,
      timestamp: new Date().toISOString(),
      attempts: 0,
    });
  } catch (err) {
    console.debug('Failed to queue outbox message:', err);
  }
}

export async function getOutboxMessages(): Promise<any[]> {
  try {
    const db = await getDB();
    return await db.getAll('outbox');
  } catch (err) {
    console.debug('Failed to read outbox:', err);
    return [];
  }
}

export async function removeFromOutbox(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('outbox', id);
  } catch (err) {
    console.debug('Failed to remove from outbox:', err);
  }
}

export async function saveDraft(roomId: string, text: string, replyToId?: string): Promise<void> {
  try {
    const db = await getDB();
    if (!text.trim()) {
      await db.delete('drafts', roomId);
    } else {
      await db.put('drafts', {
        roomId,
        text,
        replyToId,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.debug('Failed to save draft:', err);
  }
}

export async function getDraft(roomId: string): Promise<{ text: string; replyToId?: string } | null> {
  try {
    const db = await getDB();
    const draft = await db.get('drafts', roomId);
    return draft ? { text: draft.text, replyToId: draft.replyToId } : null;
  } catch (err) {
    return null;
  }
}
