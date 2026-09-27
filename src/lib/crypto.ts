/**
 * Web Crypto API End-to-End Encryption (E2EE) Utilities
 * Peace & Hope Church Platform
 *
 * Implements client-side ECDH (P-256) key agreement and AES-GCM (256-bit)
 * for secure private 1:1 messaging. Private keys never leave the client device.
 * Admin CMS cannot decrypt private 1:1 messages without user consent.
 */

export interface KeyPairStrings {
  publicKeyB64: string;
  privateKeyB64: string;
}

export interface EncryptedPayload {
  iv: string; // Base64
  ciphertext: string; // Base64
  version: number;
}

/**
 * Checks whether the browser / environment supports the Web Crypto API
 */
export const isWebCryptoSupported = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.crypto?.subtle);
};

/**
 * Generate a new ECDH P-256 keypair for E2EE private messaging
 */
export async function generateE2EEKeyPair(): Promise<KeyPairStrings> {
  if (!isWebCryptoSupported()) {
    throw new Error('Web Crypto API is not supported in this browser environment');
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true, // extractable
    ['deriveKey', 'deriveBits']
  );

  const exportedPublic = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
  const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKeyB64: arrayBufferToBase64(exportedPublic),
    privateKeyB64: arrayBufferToBase64(exportedPrivate),
  };
}

/**
 * Import a Base64-encoded ECDH raw public key
 */
export async function importPublicKey(publicKeyB64: string): Promise<CryptoKey> {
  const raw = base64ToArrayBuffer(publicKeyB64);
  return window.crypto.subtle.importKey(
    'raw',
    raw,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

/**
 * Import a Base64-encoded ECDH PKCS8 private key
 */
export async function importPrivateKey(privateKeyB64: string): Promise<CryptoKey> {
  const pkcs8 = base64ToArrayBuffer(privateKeyB64);
  return window.crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

/**
 * Derive shared AES-GCM 256-bit symmetric key from my private key + recipient's public key
 */
export async function deriveSharedSecretKey(
  myPrivateKeyB64: string,
  theirPublicKeyB64: string
): Promise<CryptoKey> {
  const myPrivateKey = await importPrivateKey(myPrivateKeyB64);
  const theirPublicKey = await importPublicKey(theirPublicKeyB64);

  return window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: theirPublicKey,
    },
    myPrivateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false, // do not make derived key extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext string using AES-GCM with a fresh random 96-bit IV
 */
export async function encryptChatMessage(
  plaintext: string,
  sharedKey: CryptoKey
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(plaintext);

  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit recommended for AES-GCM

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    sharedKey,
    encodedData
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertext),
    version: 1,
  };
}

/**
 * Decrypt ciphertext using AES-GCM and the derived shared key
 */
export async function decryptChatMessage(
  payload: EncryptedPayload,
  sharedKey: CryptoKey
): Promise<string> {
  const iv = base64ToArrayBuffer(payload.iv);
  const ciphertext = base64ToArrayBuffer(payload.ciphertext);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    sharedKey,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Byte conversion helpers
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
