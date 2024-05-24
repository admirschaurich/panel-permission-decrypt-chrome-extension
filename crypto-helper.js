class CryptoHelper {
    constructor(keyString, saltString) {
        this.key = this.utf8Encode(keyString);
        this.salt = this.utf8Encode(saltString);
    }
  
    utf8Encode(string) {
        return unescape(encodeURIComponent(string));
    }
  
    utf8Decode(encodedString) {
        return decodeURIComponent(escape(encodedString));
    }
  
    pbkdf2Sync(password, salt, iterations, keylen, digest) {
        let derivedKey = CryptoJS.PBKDF2(password, salt, { keySize: keylen / 4, iterations: iterations, hasher: CryptoJS.algo.SHA256 }); // Alterado para usar SHA256
        return CryptoJS.enc.Hex.parse(derivedKey.toString());
    }
  
    encrypt(plainText) {
        const keyDerivation = this.pbkdf2Sync(this.key, this.salt, 1000, 32, 'sha256');
        const iv = CryptoJS.lib.WordArray.random(128 / 8);
        const encrypted = CryptoJS.AES.encrypt(plainText, keyDerivation, { iv: iv });
        return iv.toString(CryptoJS.enc.Base64) + '|' + encrypted.toString();
    }
  
    decrypt(cipherText) {
        const parts = cipherText.split('|');
        const iv = CryptoJS.enc.Base64.parse(parts[0]);
        const encryptedText = parts[1];
        const keyDerivation = this.pbkdf2Sync(this.key, this.salt, 1000, 32, 'sha256');
        const decrypted = CryptoJS.AES.decrypt(encryptedText, keyDerivation, { iv: iv });
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        return decryptedString;
    }
  }