import { Head } from '@inertiajs/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Copy, Eye, FolderKey, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import type { BreadcrumbItem } from '@/types';
import type { Group, VaultItem, VaultReveal, VaultUser } from '@/types/vault';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Tresor-Einträge', href: '/admin/vault-items' },
];

type ItemForm = {
    title: string;
    username: string;
    url: string;
    tags: string;
    assigned_user_id: string;
    assigned_group_id: string;
    password: string;
    notes: string;
};

const defaultForm: ItemForm = {
    title: '',
    username: '',
    url: '',
    tags: '',
    assigned_user_id: '',
    assigned_group_id: '',
    password: '',
    notes: '',
};

export default function AdminVaultItemsPage() {
    const [open, setOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
    const [detailItem, setDetailItem] = useState<VaultItem | null>(null);
    const [revealed, setRevealed] = useState<VaultReveal | null>(null);
    const [form, setForm] = useState<ItemForm>(defaultForm);

    const itemsQuery = useQuery({ queryKey: ['admin-vault-items'], queryFn: () => apiRequest<VaultItem[]>('/api/admin/vault-items') });
    const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: () => apiRequest<VaultUser[]>('/api/admin/users') });
    const groupsQuery = useQuery({ queryKey: ['admin-groups'], queryFn: () => apiRequest<Group[]>('/api/admin/groups') });

    const visibleItems = useMemo(
        () =>
            (itemsQuery.data ?? []).filter((item) =>
                [item.title, item.username ?? '', item.url ?? ''].join(' ').toLowerCase().includes(search.toLowerCase()),
            ),
        [itemsQuery.data, search],
    );

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!form.assigned_user_id && !form.assigned_group_id) {
                throw new Error('Bitte mindestens User oder Gruppe zuweisen.');
            }

            const payload = {
                title: form.title,
                username: form.username || null,
                url: form.url || null,
                tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                assigned_user_id: form.assigned_user_id ? Number(form.assigned_user_id) : null,
                assigned_group_id: form.assigned_group_id ? Number(form.assigned_group_id) : null,
                password: form.password || undefined,
                notes: form.notes || null,
            };

            if (editingItem) {
                return apiRequest(`/api/admin/vault-items/${editingItem.id}`, 'PUT', payload);
            }

            return apiRequest('/api/admin/vault-items', 'POST', payload);
        },
        onSuccess: () => {
            toast.success(editingItem ? 'Tresor-Eintrag aktualisiert' : 'Tresor-Eintrag erstellt');
            setOpen(false);
            setEditingItem(null);
            setForm(defaultForm);
            queryClient.invalidateQueries({ queryKey: ['admin-vault-items'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => apiRequest(`/api/admin/vault-items/${id}`, 'DELETE'),
        onSuccess: () => {
            toast.success('Tresor-Eintrag gelöscht');
            queryClient.invalidateQueries({ queryKey: ['admin-vault-items'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const revealMutation = useMutation({
        mutationFn: async (id: number) => apiRequest<VaultReveal>(`/api/vault-items/${id}/reveal`, 'POST'),
        onSuccess: (data) => setRevealed(data),
        onError: (error: Error) => toast.error(error.message),
    });

    const copyText = async (value: string, label: string) => {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} kopiert`);
    };

    const openCreate = () => {
        setEditingItem(null);
        setForm(defaultForm);
        setOpen(true);
    };

    const openEdit = (item: VaultItem) => {
        setEditingItem(item);
        setForm({
            title: item.title,
            username: item.username ?? '',
            url: item.url ?? '',
            tags: (item.tags_json ?? []).join(', '),
            assigned_user_id: item.assigned_user_id ? String(item.assigned_user_id) : '',
            assigned_group_id: item.assigned_group_id ? String(item.assigned_group_id) : '',
            password: '',
            notes: '',
        });
        setOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Tresor-Einträge" />
            <div className="space-y-6 p-6">
                <Card className="border-border/70">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl"><FolderKey className="size-5" />Tresor-Einträge verwalten</CardTitle>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative w-full sm:w-72">
                                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder="Suche nach Titel, Benutzername oder URL" value={search} onChange={(event) => setSearch(event.target.value)} />
                            </div>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={openCreate}>Eintrag erstellen</Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingItem ? 'Tresor-Eintrag bearbeiten' : 'Tresor-Eintrag erstellen'}</DialogTitle>
                                    </DialogHeader>
                                    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(); }}>
                                        <div className="space-y-2"><Label>Titel</Label><Input required value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} /></div>
                                        <div className="space-y-2"><Label>Benutzername</Label><Input value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} /></div>
                                        <div className="space-y-2"><Label>URL</Label><Input value={form.url} onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))} /></div>
                                        <div className="space-y-2"><Label>Tags (kommagetrennt)</Label><Input value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} /></div>
                                        <div className="space-y-2">
                                            <Label>Zugewiesener Benutzer</Label>
                                            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.assigned_user_id} onChange={(event) => setForm((prev) => ({ ...prev, assigned_user_id: event.target.value }))}>
                                                <option value="">Keiner</option>
                                                {(usersQuery.data ?? []).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Zugewiesene Gruppe</Label>
                                            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.assigned_group_id} onChange={(event) => setForm((prev) => ({ ...prev, assigned_group_id: event.target.value }))}>
                                                <option value="">Keine</option>
                                                {(groupsQuery.data ?? []).map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2"><Label>{editingItem ? 'Neues Passwort (optional)' : 'Passwort'}</Label><Input type="password" required={!editingItem} value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} /></div>
                                        <div className="space-y-2"><Label>Notizen</Label><textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} /></div>
                                        <Button className="w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Speichern...' : 'Speichern'}</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-xl border border-border/70">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60 text-left">
                                    <tr>
                                        <th className="px-4 py-3">Titel</th>
                                        <th className="px-4 py-3">Benutzername</th>
                                        <th className="px-4 py-3">Tags</th>
                                        <th className="px-4 py-3">Zuweisung</th>
                                        <th className="px-4 py-3">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleItems.map((item) => (
                                        <tr key={item.id} className="border-t border-border/50">
                                            <td className="px-4 py-3">{item.title}</td>
                                            <td className="px-4 py-3">{item.username ?? '-'}</td>
                                            <td className="px-4 py-3">{(item.tags_json ?? []).join(', ') || '-'}</td>
                                            <td className="px-4 py-3">{item.assigned_user?.name ?? '-'} / {item.assigned_group?.name ?? '-'}</td>
                                            <td className="flex gap-2 px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setDetailItem(item);
                                                        setRevealed(null);
                                                        setDetailsOpen(true);
                                                    }}
                                                >
                                                    Details
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>Bearbeiten</Button>
                                                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(item.id)}>Löschen</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {itemsQuery.isLoading && <p className="pt-4 text-sm text-muted-foreground">Tresor-Einträge werden geladen...</p>}
                        {itemsQuery.data && itemsQuery.data.length === 0 && <p className="pt-4 text-sm text-muted-foreground">Keine Tresor-Einträge vorhanden.</p>}
                    </CardContent>
                </Card>

                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{detailItem?.title ?? 'Eintrag'}</DialogTitle>
                        </DialogHeader>
                        {detailItem && (
                            <div className="space-y-3 text-sm">
                                <p><span className="font-medium">Benutzername:</span> {detailItem.username ?? '-'}</p>
                                <p><span className="font-medium">URL:</span> {detailItem.url ?? '-'}</p>
                                <div className="flex gap-1">
                                    {(detailItem.tags_json ?? []).map((itemTag) => (
                                        <Badge key={itemTag} variant="secondary">{itemTag}</Badge>
                                    ))}
                                </div>
                                <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                                    <p className="mb-2 font-medium">Passwort</p>
                                    <div className="flex items-center gap-2">
                                        <Input readOnly value={revealed?.password ?? '••••••••••••'} />
                                        <Button size="icon" variant="secondary" onClick={() => revealMutation.mutate(detailItem.id)}>
                                            <Eye className="size-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            disabled={!revealed?.password}
                                            onClick={() => {
                                                if (revealed?.password) {
                                                    void copyText(revealed.password, 'Passwort');
                                                }
                                            }}
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
                                            disabled={!revealed?.notes}
                                            onClick={() => {
                                                if (revealed?.notes) {
                                                    void copyText(revealed.notes, 'Notizen');
                                                }
                                            }}
                                        >
                                            <Copy className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
