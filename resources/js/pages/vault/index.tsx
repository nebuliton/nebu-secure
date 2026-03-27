import { Head } from '@inertiajs/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Copy,
    CreditCard,
    Eye,
    Heart,
    KeyRound,
    Link2,
    LockKeyhole,
    Package,
    Search,
    Server,
    StickyNote,
    Terminal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ExternalUrlLink } from '@/components/external-url-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import type { BreadcrumbItem } from '@/types';
import type {
    VaultItem,
    VaultItemType,
    VaultReveal,
    VaultShareLinkResponse,
} from '@/types/vault';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mein Tresor', href: '/vault' },
];

const typeLabels: Record<VaultItemType, string> = {
    login: 'Login',
    api_key: 'API-Key',
    ssh_key: 'SSH-Key',
    note: 'Notiz',
    credit_card: 'Kreditkarte',
    other: 'Sonstiges',
};

const typeIcons: Record<VaultItemType, React.ElementType> = {
    login: KeyRound,
    api_key: Terminal,
    ssh_key: Server,
    note: StickyNote,
    credit_card: CreditCard,
    other: Package,
};

export default function MyVaultPage() {
    const [search, setSearch] = useState('');
    const [scope, setScope] = useState<
        'all' | 'direct' | 'group' | 'favorites'
    >('all');
    const [tag, setTag] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [revealed, setRevealed] = useState<VaultReveal | null>(null);

    const itemsQuery = useQuery({
        queryKey: ['my-vault-items', search, scope, tag, typeFilter],
        queryFn: () =>
            apiRequest<VaultItem[]>(
                `/api/vault-items?search=${encodeURIComponent(search)}&scope=${scope}&tag=${encodeURIComponent(tag)}&type=${encodeURIComponent(typeFilter)}`,
            ),
        refetchInterval: 10_000,
    });

    const revealMutation = useMutation({
        mutationFn: async (itemId: number) =>
            apiRequest<VaultReveal>(
                `/api/vault-items/${itemId}/reveal`,
                'POST',
            ),
        onSuccess: (data) => {
            setRevealed(data);
            queryClient.invalidateQueries({ queryKey: ['my-vault-items'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const shareMutation = useMutation({
        mutationFn: async (itemId: number) =>
            apiRequest<VaultShareLinkResponse>(
                `/api/vault-items/${itemId}/share-link`,
                'POST',
            ),
        onSuccess: async (data) => {
            await copyText(data.url, 'Einmal-Link');
            toast.success('Einmal-Link erstellt und kopiert');
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const favoriteMutation = useMutation({
        mutationFn: async (itemId: number) =>
            apiRequest<{ is_favorite: boolean }>(
                `/api/vault-items/${itemId}/toggle-favorite`,
                'POST',
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-vault-items'] });
            toast.success('Favorit aktualisiert');
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const list = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);

    const tagColorClass = (tag: string) => {
        const palette = [
            'bg-red-100 text-red-800 border-red-200',
            'bg-orange-100 text-orange-800 border-orange-200',
            'bg-amber-100 text-amber-800 border-amber-200',
            'bg-lime-100 text-lime-800 border-lime-200',
            'bg-emerald-100 text-emerald-800 border-emerald-200',
            'bg-cyan-100 text-cyan-800 border-cyan-200',
            'bg-blue-100 text-blue-800 border-blue-200',
            'bg-indigo-100 text-indigo-800 border-indigo-200',
            'bg-pink-100 text-pink-800 border-pink-200',
        ];

        const hash = tag
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return palette[hash % palette.length];
    };

    const copyText = async (value: string, label: string) => {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} kopiert`);
    };

    const favoriteCount = useMemo(
        () => list.filter((item) => item.is_favorite).length,
        [list],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mein Tresor" />
            <div className="space-y-6 p-6">
                <Card className="border-border/70">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <LockKeyhole className="size-5" />
                                Mein Tresor
                            </CardTitle>
                            {favoriteCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1"
                                >
                                    <Heart className="size-3 fill-current" />
                                    {favoriteCount} Favoriten
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-5">
                            <div className="relative md:col-span-2">
                                <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Suche nach Titel, Benutzername, Server-IP oder URL"
                                />
                            </div>
                            <select
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={scope}
                                onChange={(event) =>
                                    setScope(
                                        event.target.value as
                                            | 'all'
                                            | 'direct'
                                            | 'group'
                                            | 'favorites',
                                    )
                                }
                            >
                                <option value="all">Alle</option>
                                <option value="direct">Direkt</option>
                                <option value="group">Gruppe</option>
                                <option value="favorites">⭐ Favoriten</option>
                            </select>
                            <select
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(event.target.value)
                                }
                            >
                                <option value="">Alle Typen</option>
                                {Object.entries(typeLabels).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                            <Input
                                value={tag}
                                onChange={(event) => setTag(event.target.value)}
                                placeholder="Nach Tag filtern"
                            />
                        </div>

                        <div className="grid gap-3">
                            {list.map((item) => {
                                const TypeIcon =
                                    typeIcons[item.item_type] ?? Package;
                                return (
                                    <Dialog
                                        key={item.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                setRevealed(null);
                                            }
                                        }}
                                    >
                                        <div className="cursor-pointer rounded-xl border border-border/70 bg-card transition hover:-translate-y-0.5 hover:shadow-sm">
                                            <div className="flex items-stretch">
                                                <DialogTrigger asChild>
                                                    <button className="flex-1 cursor-pointer p-4 text-left">
                                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                                                    <TypeIcon className="size-4 text-muted-foreground" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-medium">
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </p>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px]"
                                                                        >
                                                                            {typeLabels[
                                                                                item
                                                                                    .item_type
                                                                            ] ??
                                                                                item.item_type}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {item.username ??
                                                                            '-'}{' '}
                                                                        {item.server_ip
                                                                            ? `· ${item.server_ip}`
                                                                            : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {(
                                                                    item.tags_json ??
                                                                    []
                                                                ).map(
                                                                    (
                                                                        itemTag,
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                itemTag
                                                                            }
                                                                            className={tagColorClass(
                                                                                itemTag,
                                                                            )}
                                                                            variant="outline"
                                                                        >
                                                                            {
                                                                                itemTag
                                                                            }
                                                                        </Badge>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                </DialogTrigger>
                                                <button
                                                    className="flex items-center px-3 text-muted-foreground transition hover:text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        favoriteMutation.mutate(
                                                            item.id,
                                                        );
                                                    }}
                                                    title={
                                                        item.is_favorite
                                                            ? 'Aus Favoriten entfernen'
                                                            : 'Zu Favoriten hinzufügen'
                                                    }
                                                >
                                                    <Heart
                                                        className={`size-4 ${item.is_favorite ? 'fill-red-500 text-red-500' : ''}`}
                                                    />
                                                </button>
                                            </div>
                                            {item.url && (
                                                <div className="px-4 pb-4 text-sm">
                                                    <ExternalUrlLink
                                                        url={item.url}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <TypeIcon className="size-5" />
                                                    {item.title}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Zugangsdaten für diesen
                                                    Tresor-Eintrag anzeigen und
                                                    teilen.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-3 text-sm">
                                                {item.username && (
                                                    <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 p-3">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Benutzername
                                                            </p>
                                                            <p className="font-medium">
                                                                {item.username}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-8"
                                                            onClick={() =>
                                                                void copyText(
                                                                    item.username as string,
                                                                    'Benutzername',
                                                                )
                                                            }
                                                        >
                                                            <Copy className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {item.server_ip && (
                                                    <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 p-3">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Server-IP
                                                            </p>
                                                            <p className="font-medium">
                                                                {item.server_ip}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-8"
                                                            onClick={() =>
                                                                void copyText(
                                                                    item.server_ip as string,
                                                                    'Server-IP',
                                                                )
                                                            }
                                                        >
                                                            <Copy className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {item.url && (
                                                    <p>
                                                        <span className="font-medium">
                                                            URL:
                                                        </span>{' '}
                                                        <ExternalUrlLink
                                                            url={item.url}
                                                        />
                                                    </p>
                                                )}
                                                <p>
                                                    <span className="font-medium">
                                                        Gruppen:
                                                    </span>{' '}
                                                    {(item.groups ?? [])
                                                        .map(
                                                            (group) =>
                                                                group.name,
                                                        )
                                                        .join(', ') ||
                                                        item.assigned_group
                                                            ?.name ||
                                                        '-'}
                                                </p>
                                                <Button
                                                    className="w-full"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        revealMutation.mutate(
                                                            item.id,
                                                        )
                                                    }
                                                    disabled={
                                                        revealMutation.isPending
                                                    }
                                                >
                                                    <Eye className="mr-2 size-4" />
                                                    {revealMutation.isPending
                                                        ? 'Wird entschlüsselt...'
                                                        : 'Geheimdaten anzeigen'}
                                                </Button>
                                                {!!revealed?.password && (
                                                    <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                                                        <p className="mb-2 font-medium">
                                                            Passwort
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                readOnly
                                                                value={
                                                                    revealed.password
                                                                }
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    void copyText(
                                                                        revealed.password as string,
                                                                        'Passwort',
                                                                    );
                                                                }}
                                                            >
                                                                <Copy className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                                {!!revealed?.value && (
                                                    <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                                                        <p className="mb-2 font-medium">
                                                            Wert
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                readOnly
                                                                value={
                                                                    revealed.value
                                                                }
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    void copyText(
                                                                        revealed.value as string,
                                                                        'Wert',
                                                                    );
                                                                }}
                                                            >
                                                                <Copy className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                                {revealed &&
                                                    !revealed.password &&
                                                    !revealed.value && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Kein Passwort und
                                                            kein Wert
                                                            hinterlegt.
                                                        </p>
                                                    )}
                                                {revealed?.notes && (
                                                    <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                                                        <p className="mb-2 font-medium">
                                                            Notizen
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                readOnly
                                                                value={
                                                                    revealed.notes
                                                                }
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    void copyText(
                                                                        revealed.notes as string,
                                                                        'Notizen',
                                                                    );
                                                                }}
                                                            >
                                                                <Copy className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                                <Button
                                                    className="w-full"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        shareMutation.mutate(
                                                            item.id,
                                                        )
                                                    }
                                                    disabled={
                                                        shareMutation.isPending
                                                    }
                                                >
                                                    <Link2 className="mr-2 size-4" />
                                                    {shareMutation.isPending
                                                        ? 'Einmal-Link wird erstellt...'
                                                        : 'Einmal-Link zum Teilen erstellen'}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                );
                            })}
                        </div>

                        {itemsQuery.isLoading && (
                            <p className="text-sm text-muted-foreground">
                                Tresor wird geladen...
                            </p>
                        )}
                        {itemsQuery.data && itemsQuery.data.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Noch keine Einträge zugewiesen.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
