<?php

namespace App\Services;

use App\Models\VaultItem;

class VaultItemCryptoService
{
    public function __construct(private readonly CryptoService $cryptoService) {}

    public function encryptPayload(?string $password, ?string $value, ?string $notes): array
    {
        $password = $password ?? '';

        $dataKey = $this->cryptoService->generateDataKey();
        $passwordPayload = $this->cryptoService->encryptField($password, $dataKey);
        $valuePayload = $value !== null && $value !== ''
            ? $this->cryptoService->encryptField($value, $dataKey)
            : null;
        $notesPayload = $notes !== null && $notes !== ''
            ? $this->cryptoService->encryptField($notes, $dataKey)
            : null;

        $keyVersion = $this->cryptoService->currentKeyVersion();
        $masterKey = $this->cryptoService->masterKeyByVersion($keyVersion);

        return [
            'password_ciphertext' => $passwordPayload['ciphertext'],
            'password_iv' => $passwordPayload['iv'],
            'password_tag' => $passwordPayload['tag'],
            'value_ciphertext' => $valuePayload['ciphertext'] ?? null,
            'value_iv' => $valuePayload['iv'] ?? null,
            'value_tag' => $valuePayload['tag'] ?? null,
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
        $value = null;

        if ($item->value_ciphertext && $item->value_iv && $item->value_tag) {
            $value = $this->cryptoService->decryptField(
                $item->value_ciphertext,
                $item->value_iv,
                $item->value_tag,
                $dataKey,
            );
        }

        if ($item->notes_ciphertext && $item->notes_iv && $item->notes_tag) {
            $notes = $this->cryptoService->decryptField(
                $item->notes_ciphertext,
                $item->notes_iv,
                $item->notes_tag,
                $dataKey,
            );
        }

        if ($password === '') {
            $password = null;
        }

        if ($value === '') {
            $value = null;
        }

        return [
            'value' => $value,
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
