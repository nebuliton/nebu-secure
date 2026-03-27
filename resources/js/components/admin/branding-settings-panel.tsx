import { useMutation, useQuery } from '@tanstack/react-query';
import { Building2, ImagePlus, Save, Trash2, Upload } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import type { AppSettings } from '@/types';

type SettingsForm = {
    app_name: string;
    app_logo_url: string;
    app_tagline: string;
    app_description: string;
    repository_url: string;
    documentation_url: string;
    support_email: string;
    company_name: string;
    imprint_url: string;
    privacy_url: string;
};

const emptyForm: SettingsForm = {
    app_name: '',
    app_logo_url: '',
    app_tagline: '',
    app_description: '',
    repository_url: '',
    documentation_url: '',
    support_email: '',
    company_name: '',
    imprint_url: '',
    privacy_url: '',
};

const toForm = (settings: AppSettings): SettingsForm => ({
    app_name: settings.app_name ?? '',
    app_logo_url: settings.app_logo_url ?? '',
    app_tagline: settings.app_tagline ?? '',
    app_description: settings.app_description ?? '',
    repository_url: settings.repository_url ?? '',
    documentation_url: settings.documentation_url ?? '',
    support_email: settings.support_email ?? '',
    company_name: settings.company_name ?? '',
    imprint_url: settings.imprint_url ?? '',
    privacy_url: settings.privacy_url ?? '',
});

const toPayload = (form: SettingsForm): AppSettings => ({
    app_name: form.app_name.trim(),
    app_logo_url: form.app_logo_url.trim() || null,
    app_tagline: form.app_tagline.trim() || null,
    app_description: form.app_description.trim() || null,
    repository_url: form.repository_url.trim() || null,
    documentation_url: form.documentation_url.trim() || null,
    support_email: form.support_email.trim() || null,
    company_name: form.company_name.trim() || null,
    imprint_url: form.imprint_url.trim() || null,
    privacy_url: form.privacy_url.trim() || null,
});

async function uploadLogoFile(file: File): Promise<{ app_logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
    });

    const xsrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    const response = await fetch('/api/admin/settings/logo', {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            ...(xsrfToken
                ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) }
                : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
            message?: string;
            errors?: Record<string, string[]>;
        };
        const firstError = data.errors
            ? Object.values(data.errors).flat()[0]
            : undefined;
        throw new Error(firstError ?? data.message ?? 'Upload fehlgeschlagen');
    }

    return (await response.json()) as { app_logo_url: string };
}

export default function BrandingSettingsPanel() {
    const [formDraft, setFormDraft] = useState<SettingsForm | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const settingsQuery = useQuery({
        queryKey: ['admin-settings'],
        queryFn: () => apiRequest<AppSettings>('/api/admin/settings'),
    });

    const form = useMemo<SettingsForm>(() => {
        if (formDraft) {
            return formDraft;
        }

        if (settingsQuery.data) {
            return toForm(settingsQuery.data);
        }

        return emptyForm;
    }, [formDraft, settingsQuery.data]);

    const updateField = <K extends keyof SettingsForm>(
        key: K,
        value: SettingsForm[K],
    ): void => {
        setFormDraft((prev) => {
            const base =
                prev ??
                (settingsQuery.data ? toForm(settingsQuery.data) : emptyForm);

            return {
                ...base,
                [key]: value,
            };
        });
    };

    const saveMutation = useMutation({
        mutationFn: async (payload: AppSettings) =>
            apiRequest<AppSettings>('/api/admin/settings', 'PUT', payload),
        onSuccess: (updated) => {
            setFormDraft(toForm(updated));
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.success('Einstellungen gespeichert');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const logoUploadMutation = useMutation({
        mutationFn: uploadLogoFile,
        onSuccess: (data) => {
            updateField('app_logo_url', data.app_logo_url);
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.success('Logo hochgeladen');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const logoDeleteMutation = useMutation({
        mutationFn: () => apiRequest('/api/admin/settings/logo', 'DELETE'),
        onSuccess: () => {
            updateField('app_logo_url', '');
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.success('Logo entfernt');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleLogoSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                logoUploadMutation.mutate(file);
            }
            event.target.value = '';
        },
        [logoUploadMutation],
    );

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Branding</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="app_name">App Name</Label>
                            <Input
                                id="app_name"
                                value={form.app_name}
                                onChange={(event) =>
                                    updateField('app_name', event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                className="hidden"
                                onChange={handleLogoSelect}
                            />
                            <div className="flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border/70 bg-muted/40">
                                    {form.app_logo_url ? (
                                        <img
                                            src={form.app_logo_url}
                                            alt="Logo"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <ImagePlus className="size-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            logoInputRef.current?.click()
                                        }
                                        disabled={logoUploadMutation.isPending}
                                    >
                                        <Upload className="mr-2 size-3.5" />
                                        {logoUploadMutation.isPending
                                            ? 'Wird hochgeladen...'
                                            : 'Logo hochladen'}
                                    </Button>
                                    {form.app_logo_url && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() =>
                                                logoDeleteMutation.mutate()
                                            }
                                            disabled={logoDeleteMutation.isPending}
                                        >
                                            <Trash2 className="mr-2 size-3.5" />
                                            Logo entfernen
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, SVG oder WebP – max. 2 MB
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="app_logo_url">oder Logo URL</Label>
                            <Input
                                id="app_logo_url"
                                type="url"
                                placeholder="https://example.org/logo.png"
                                value={form.app_logo_url}
                                onChange={(event) =>
                                    updateField(
                                        'app_logo_url',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="app_tagline">Tagline</Label>
                            <Input
                                id="app_tagline"
                                value={form.app_tagline}
                                onChange={(event) =>
                                    updateField(
                                        'app_tagline',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="app_description">
                                Beschreibung
                            </Label>
                            <textarea
                                id="app_description"
                                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={form.app_description}
                                onChange={(event) =>
                                    updateField(
                                        'app_description',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Projekt Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="repository_url">Repository URL</Label>
                            <Input
                                id="repository_url"
                                type="url"
                                placeholder="https://github.com/org/repo"
                                value={form.repository_url}
                                onChange={(event) =>
                                    updateField(
                                        'repository_url',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="documentation_url">
                                Dokumentation URL
                            </Label>
                            <Input
                                id="documentation_url"
                                type="url"
                                placeholder="https://docs.example.org"
                                value={form.documentation_url}
                                onChange={(event) =>
                                    updateField(
                                        'documentation_url',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="size-5" />
                            Kontakt & Legal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Organisation</Label>
                            <Input
                                id="company_name"
                                value={form.company_name}
                                onChange={(event) =>
                                    updateField(
                                        'company_name',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="support_email">Support E-Mail</Label>
                            <Input
                                id="support_email"
                                type="email"
                                value={form.support_email}
                                onChange={(event) =>
                                    updateField(
                                        'support_email',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imprint_url">Impressum URL</Label>
                            <Input
                                id="imprint_url"
                                type="url"
                                value={form.imprint_url}
                                onChange={(event) =>
                                    updateField(
                                        'imprint_url',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="privacy_url">Datenschutz URL</Label>
                            <Input
                                id="privacy_url"
                                type="url"
                                value={form.privacy_url}
                                onChange={(event) =>
                                    updateField(
                                        'privacy_url',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button
                    onClick={() => saveMutation.mutate(toPayload(form))}
                    disabled={saveMutation.isPending || settingsQuery.isLoading}
                    className="w-full md:w-auto"
                >
                    <Save className="mr-2 size-4" />
                    {saveMutation.isPending
                        ? 'Speichern...'
                        : 'Einstellungen speichern'}
                </Button>
            </div>

            <Card className="h-fit border-border/70">
                <CardHeader>
                    <CardTitle>Live Vorschau</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-md bg-muted">
                            {form.app_logo_url ? (
                                <img
                                    src={form.app_logo_url}
                                    alt={form.app_name || 'Logo'}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-muted-foreground">
                                    Logo
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold">
                                {form.app_name || 'App Name'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {form.app_tagline || 'Tagline'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                        {form.app_description ||
                            'Beschreibung für Landing- und Projektkontext.'}
                    </div>

                    {settingsQuery.isLoading && (
                        <p className="text-xs text-muted-foreground">
                            Einstellungen werden geladen...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
