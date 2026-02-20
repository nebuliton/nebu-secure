<?php

namespace App\Services;

use RuntimeException;

class CryptoService
{
    public function generateDataKey(): string
    {
        return random_bytes(32);
    }

    public function encryptField(string $plaintext, string $dataKey): array
    {
        return $this->encryptBinary($plaintext, $dataKey);
    }

    public function decryptField(string $ciphertext, string $iv, string $tag, string $dataKey): string
    {
        return $this->decryptBinary($ciphertext, $iv, $tag, $dataKey);
    }

    public function wrapDataKey(string $dataKey, string $masterKey): string
    {
        $payload = $this->encryptBinary($dataKey, $this->normalizeKey($masterKey));

        return base64_encode(json_encode($payload, JSON_THROW_ON_ERROR));
    }

    public function unwrapDataKey(string $wrappedKey, string $masterKey): string
    {
        $decoded = base64_decode($wrappedKey, true);

        if ($decoded === false) {
            throw new RuntimeException('Wrapped key decode failed');
        }

        $payload = json_decode($decoded, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($payload) || ! isset($payload['ciphertext'], $payload['iv'], $payload['tag'])) {
            throw new RuntimeException('Wrapped key payload invalid');
        }

        return $this->decryptBinary($payload['ciphertext'], $payload['iv'], $payload['tag'], $this->normalizeKey($masterKey));
    }

    public function currentKeyVersion(): int
    {
        $configured = (int) config('vault.current_key_version');

        if ($configured > 0) {
            return $configured;
        }

        $keys = array_keys($this->masterKeys());

        return (int) max($keys);
    }

    public function masterKeyByVersion(int $version): string
    {
        $keys = $this->masterKeys();

        if (! isset($keys[$version])) {
            throw new RuntimeException('Master key version not found');
        }

        return $this->normalizeKey($keys[$version]);
    }

    private function masterKeys(): array
    {
        $keys = config('vault.master_keys', []);

        if (! is_array($keys) || count($keys) === 0) {
            throw new RuntimeException('No master keys configured');
        }

        return $keys;
    }

    private function normalizeKey(string $key): string
    {
        if (str_starts_with($key, 'base64:')) {
            $decoded = base64_decode(substr($key, 7), true);

            if ($decoded === false) {
                throw new RuntimeException('Master key base64 invalid');
            }

            return substr(hash('sha256', $decoded, true), 0, 32);
        }

        return substr(hash('sha256', $key, true), 0, 32);
    }

    private function encryptBinary(string $plaintext, string $key): array
    {
        if (function_exists('sodium_crypto_aead_aes256gcm_is_available') && sodium_crypto_aead_aes256gcm_is_available()) {
            $iv = random_bytes(SODIUM_CRYPTO_AEAD_AES256GCM_NPUBBYTES);
            $combined = sodium_crypto_aead_aes256gcm_encrypt($plaintext, '', $iv, $key);
            $tagLength = SODIUM_CRYPTO_AEAD_AES256GCM_ABYTES;
            $ciphertext = substr($combined, 0, -$tagLength);
            $tag = substr($combined, -$tagLength);

            return [
                'ciphertext' => base64_encode($ciphertext),
                'iv' => base64_encode($iv),
                'tag' => base64_encode($tag),
            ];
        }

        $iv = random_bytes(12);
        $tag = '';
        $ciphertext = openssl_encrypt($plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);

        if ($ciphertext === false) {
            throw new RuntimeException('Encryption failed');
        }

        return [
            'ciphertext' => base64_encode($ciphertext),
            'iv' => base64_encode($iv),
            'tag' => base64_encode($tag),
        ];
    }

    private function decryptBinary(string $ciphertext, string $iv, string $tag, string $key): string
    {
        $rawCiphertext = base64_decode($ciphertext, true);
        $rawIv = base64_decode($iv, true);
        $rawTag = base64_decode($tag, true);

        if ($rawCiphertext === false || $rawIv === false || $rawTag === false) {
            throw new RuntimeException('Cipher payload invalid');
        }

        if (function_exists('sodium_crypto_aead_aes256gcm_is_available') && sodium_crypto_aead_aes256gcm_is_available() && strlen($rawIv) === SODIUM_CRYPTO_AEAD_AES256GCM_NPUBBYTES) {
            $combined = $rawCiphertext.$rawTag;
            $plaintext = sodium_crypto_aead_aes256gcm_decrypt($combined, '', $rawIv, $key);

            if ($plaintext === false) {
                throw new RuntimeException('Decryption failed');
            }

            return $plaintext;
        }

        $plaintext = openssl_decrypt($rawCiphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $rawIv, $rawTag);

        if ($plaintext === false) {
            throw new RuntimeException('Decryption failed');
        }

        return $plaintext;
    }
}
