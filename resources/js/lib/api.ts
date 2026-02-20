import { router } from '@inertiajs/react';

let csrfReady = false;

const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() ?? null;
    }

    return null;
};

const ensureCsrfCookie = async (): Promise<void> => {
    if (csrfReady) {
        return;
    }

    await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
    });

    csrfReady = true;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiRequest<T>(
    url: string,
    method: HttpMethod = 'GET',
    body?: unknown,
): Promise<T> {
    if (method !== 'GET') {
        await ensureCsrfCookie();
    }

    const xsrfToken = getCookieValue('XSRF-TOKEN');

    const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
        router.visit('/login');
        throw new Error('Unauthorized');
    }

    if (response.status === 403) {
        throw new Error('Forbidden');
    }

    if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
            message?: string;
            errors?: Record<string, string[]>;
        };
        const firstError = data.errors
            ? Object.values(data.errors).flat()[0]
            : undefined;
        throw new Error(firstError ?? data.message ?? 'Request failed');
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}
