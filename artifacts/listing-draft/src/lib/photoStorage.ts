const DATABASE_NAME = 'fieldnote-listing-photos';
const DATABASE_VERSION = 1;
const STORE_NAME = 'photos';

type StoredPhoto = {
  key: string;
  draftId: string;
  photoId: string;
  blob: Blob;
};

const photoKey = (draftId: string, photoId: string) => `${draftId}:${photoId}`;

function openPhotoDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('This browser does not support local photo storage.'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.objectStoreNames.contains(STORE_NAME)
        ? request.transaction?.objectStore(STORE_NAME)
        : database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      if (store && !store.indexNames.contains('draftId')) {
        store.createIndex('draftId', 'draftId', { unique: false });
      }
    };

    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error ?? new Error('Could not open local photo storage.'));
    request.onblocked = () => reject(new Error('Local photo storage is busy in another tab. Close other Fieldnote tabs and try again.'));
  });
}

export async function savePhotoBlob(draftId: string, photoId: string, blob: Blob): Promise<void> {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({
      key: photoKey(draftId, photoId),
      draftId,
      photoId,
      blob,
    } satisfies StoredPhoto);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not save this photo.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Photo storage was interrupted.'));
    };
  });
}

export async function getPhotoBlob(draftId: string, photoId: string): Promise<Blob | null> {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(photoKey(draftId, photoId)) as IDBRequest<StoredPhoto | undefined>;
    request.onsuccess = () => resolve(request.result?.blob ?? null);
    request.onerror = () => reject(request.error ?? new Error('Could not load this photo.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not load this photo.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Photo loading was interrupted.'));
    };
  });
}

export async function deletePhotoBlob(draftId: string, photoId: string): Promise<void> {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(photoKey(draftId, photoId));
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not remove this photo.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Photo removal was interrupted.'));
    };
  });
}

export async function deletePhotosForDraft(draftId: string): Promise<void> {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.index('draftId').openCursor(IDBKeyRange.only(draftId));

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    request.onerror = () => {
      database.close();
      reject(request.error ?? new Error('Could not clear photos for this draft.'));
    };
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not clear photos for this draft.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Photo cleanup was interrupted.'));
    };
  });
}
