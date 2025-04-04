/**
 * Utility class for base64 encoding/decoding in React Native
 */
export class Base64 {
  private static readonly chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  private static readonly lookup: Uint8Array = (() => {
    const lookup = new Uint8Array(256);
    for (let i = 0; i < Base64.chars.length; i++) {
      lookup[Base64.chars.charCodeAt(i)] = i;
    }
    return lookup;
  })();

  /**
   * Converts a Uint8Array to a base64 string
   */
  static fromUint8Array(bytes: Uint8Array): string {
    const len = bytes.length;
    let base64 = '';

    for (let i = 0; i < len; i += 3) {
      base64 += Base64.chars[bytes[i] >> 2];
      base64 += Base64.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += Base64.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += Base64.chars[bytes[i + 2] & 63];
    }

    if (len % 3 === 2) {
      base64 = base64.substring(0, base64.length - 1) + '=';
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + '==';
    }

    return base64;
  }

  /**
   * Converts a base64 string to a Uint8Array
   */
  static toUint8Array(base64: string): Uint8Array {
    let bufferLength = base64.length * 0.75;
    const len = base64.length;

    if (base64[len - 1] === '=') {
      bufferLength--;
      if (base64[len - 2] === '=') {
        bufferLength--;
      }
    }

    const bytes = new Uint8Array(bufferLength);

    let p = 0;
    for (let i = 0; i < len; i += 4) {
      const encoded1 = Base64.lookup[base64.charCodeAt(i)];
      const encoded2 = Base64.lookup[base64.charCodeAt(i + 1)];
      const encoded3 = Base64.lookup[base64.charCodeAt(i + 2)];
      const encoded4 = Base64.lookup[base64.charCodeAt(i + 3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return bytes;
  }
}
