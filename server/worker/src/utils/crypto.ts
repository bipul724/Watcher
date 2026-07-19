import crypto from 'crypto';

// Derive a 32-byte (256-bit) encryption key from the environment
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'watcher-default-master-key')
  .digest();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16;

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * If the string is already encrypted, returns it as-is.
 */
export function encrypt(text: string | null | undefined): string | null {
  if (!text) return null;
  if (text.startsWith('enc:')) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  // Format: enc:iv:encrypted_text:auth_tag
  return `enc:${iv.toString('hex')}:${encrypted}:${tag}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * If the string is not encrypted (does not start with 'enc:'), returns it as-is for backward compatibility.
 */
export function decrypt(cipherText: string | null | undefined): string | null {
  if (!cipherText) return null;
  if (!cipherText.startsWith('enc:')) return cipherText;

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return cipherText;

    const [_, ivHex, encryptedHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('⚠️ Encryption error: Failed to decrypt secret value. Returning raw value.', err);
    return cipherText;
  }
}
