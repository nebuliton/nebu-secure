<?php

namespace App\Services;

use App\Models\VaultItem;
use RuntimeException;

class VaultItemCryptoService
{
    public function __construct(private readonly CryptoService $cryptoService)
    {
    }

    public function encryptPayload(?string $password, ?string $notes): array
    {
        if ($password === null || $password === '') {
            throw new RuntimeException('Password is required');
        }

        $dataKey = $this->cryptoService->generateDataKey();
        $passwordPayload = $this->cryptoService->encryptField($password, $dataKey);
        $notesPayload = $notes !== null && $notes !== ''
            ? $this->cryptoService->encryptField($notes, $dataKey)
            : null;

        $keyVersion = $this->cryptoService->currentKeyVersion();
        $masterKey = $this->cryptoService->masterKeyByVersion($keyVersion);

        return [
            'password_ciphertext' => $passwordPayload['ciphertext'],
            'password_iv' => $passwordPayload['iv'],
            'password_tag' => $passwordPayload['tag'],
            'notes_ciphertext' => $notesPayload['ciphertext'] ?? null,
            'notes_iv' => $notesPayload['iv'] ?? null,
            'notes_tag' => $notesPayload['tag'] ?? null,
            'wrapped_data_key' => $this->cryptoService->wrapDataKey($dataKey, $masterKey),
            'key_version' => $keyVersion,
        ];
    }

    public function decrypt(VaultItem $item): array
    {
        $masterKey = $this->cryptoService->masterKeyByVersion((int) $item->key_version);
        $dataKey = $this->cryptoService->unwrapDataKey($item->wrapped_data_key, $masterKey);

        $password = $this->cryptoService->decryptField(
            $item->password_ciphertext,
            $item->password_iv,
            $item->password_tag,
            $dataKey,
        );

        $notes = null;

        if ($item->notes_ciphertext && $item->notes_iv && $item->notes_tag) {
            $notes = $this->cryptoService->decryptField(
                $item->notes_ciphertext,
                $item->notes_iv,
                $item->notes_tag,
                $dataKey,
            );
        }

        return [
            'password' => $password,
            'notes' => $notes,
        ];
    }

    public function encryptNotesWithExistingKey(VaultItem $item, ?string $notes): array
    {
        $masterKey = $this->cryptoService->masterKeyByVersion((int) $item->key_version);
        $dataKey = $this->cryptoService->unwrapDataKey($item->wrapped_data_key, $masterKey);

        if ($notes === null || $notes === '') {
            return [
                'notes_ciphertext' => null,
                'notes_iv' => null,
                'notes_tag' => null,
            ];
        }

        $payload = $this->cryptoService->encryptField($notes, $dataKey);

        return [
            'notes_ciphertext' => $payload['ciphertext'],
            'notes_iv' => $payload['iv'],
            'notes_tag' => $payload['tag'],
        ];
    }
}
