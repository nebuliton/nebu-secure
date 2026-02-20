import { Head } from '@inertiajs/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Copy, Eye, LockKeyhole, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import type { BreadcrumbItem } from '@/types';
import type { VaultItem, VaultReveal } from '@/types/vault';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mein Tresor', href: '/vault' }];

export default function MyVaultPage() {
    const [search, setSearch] = useState('');
    const [scope, setScope] = useState<'all' | 'direct' | 'group'>('all');
    const [tag, setTag] = useState('');
    const [revealed, setRevealed] = useState<VaultReveal | null>(null);

    const itemsQuery = useQuery({
        queryKey: ['my-vault-items', search, scope, tag],
        queryFn: () => apiRequest<VaultItem[]>(`/api/vault-items?search=${encodeURIComponent(search)}&scope=${scope}&tag=${encodeURIComponent(tag)}`),
        refetchInterval: 10_000,
    });

    const revealMutation = useMutation({
        mutationFn: async (itemId: number) => apiRequest<VaultReveal>(`/api/vault-items/${itemId}/reveal`, 'POST'),
        onSuccess: (data) => {
            setRevealed(data);
            queryClient.invalidateQueries({ queryKey: ['my-vault-items'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const list = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);

    const copyText = async (value: string, label: string) => {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} kopiert`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mein Tresor" />
            <div className="space-y-6 p-6">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl"><LockKeyhole className="size-5" />Meine Passwörter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche nach Titel, Benutzername oder URL" />
                            </div>
                            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={scope} onChange={(event) => setScope(event.target.value as 'all' | 'direct' | 'group')}>
                                <option value="all">Alle</option>
                                <option value="direct">Direkt</option>
                                <option value="group">Gruppe</option>
                            </select>
                            <Input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Nach Tag filtern" />
                        </div>

                        <div className="grid gap-3">
                            {list.map((item) => (
                                <Dialog key={item.id} onOpenChange={(open) => { if (open) { setRevealed(null); } }}>
                                    <DialogTrigger asChild>
                                        <button className="w-full rounded-xl border border-border/70 bg-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium">{item.title}</p>
                                                    <p className="text-sm text-muted-foreground">{item.username ?? '-'} {item.url ? `· ${item.url}` : ''}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    {(item.tags_json ?? []).map((itemTag) => (
                                                        <Badge key={itemTag} variant="secondary">{itemTag}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{item.title}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-3 text-sm">
                                            <p><span className="font-medium">Benutzername:</span> {item.username ?? '-'}</p>
                                            <p><span className="font-medium">URL:</span> {item.url ?? '-'}</p>
                                            <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                                                <p className="mb-2 font-medium">Passwort</p>
                                                <div className="flex items-center gap-2">
                                                    <Input readOnly value={revealed?.password ?? '••••••••••••'} />
                                                    <Button size="icon" variant="secondary" onClick={() => revealMutation.mutate(item.id)}>
                                                        <Eye className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => {
                                                            if (revealed?.password) {
                                                                void copyText(revealed.password, 'Passwort');
                                                            }
                                                        }}
                                                        disabled={!revealed?.password}
                                                    >
                                                        <Copy className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                                                <p className="mb-2 font-medium">Notizen</p>
                                                <div className="flex items-center gap-2">
                                                    <Input readOnly value={revealed?.notes ?? 'Ausgeblendet'} />
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => {
                                                            if (revealed?.notes) {
                                                                void copyText(revealed.notes, 'Notizen');
                                                            }
                                                        }}
                                                        disabled={!revealed?.notes}
                                                    >
                                                        <Copy className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>

                        {itemsQuery.isLoading && <p className="text-sm text-muted-foreground">Tresor wird geladen...</p>}
                        {itemsQuery.data && itemsQuery.data.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Einträge zugewiesen.</p>}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
