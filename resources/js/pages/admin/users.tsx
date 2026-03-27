import { Head, usePage } from '@inertiajs/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Copy, Search, ShieldPlus, Trash2, UserCog } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClipboard } from '@/hooks/use-clipboard';
import AppLayout from '@/layouts/app-layout';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import type { BreadcrumbItem } from '@/types';
import type { VaultUser } from '@/types/vault';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Benutzer', href: '/admin/users' },
];

type UserPayload = {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    is_active: boolean;
};

const defaultForm: UserPayload = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true,
};

export default function AdminUsersPage() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<VaultUser | null>(null);
    const [form, setForm] = useState<UserPayload>(defaultForm);
    const [resetTarget, setResetTarget] = useState<VaultUser | null>(null);
    const [resetPassword, setResetPassword] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<VaultUser | null>(null);
    const [temporaryPassword, setTemporaryPassword] = useState<{
        user: VaultUser;
        password: string;
    } | null>(null);
    const [copiedText, copyToClipboard] = useClipboard();
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props;

    const closeEditor = () => {
        setOpen(false);
        setEditingUser(null);
        setForm(defaultForm);
    };

    const usersQuery = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiRequest<VaultUser[]>('/api/admin/users'),
    });

    const filteredUsers = useMemo(
        () =>
            (usersQuery.data ?? []).filter((user) =>
                [user.name, user.email, user.role]
                    .join(' ')
                    .toLowerCase()
                    .includes(search.toLowerCase()),
            ),
        [usersQuery.data, search],
    );

    const saveUserMutation = useMutation({
        mutationFn: async (payload: UserPayload) => {
            const normalized = {
                name: payload.name.trim(),
                email: payload.email.trim(),
                role: payload.role,
                is_active: payload.is_active,
            };

            if (editingUser) {
                return apiRequest<VaultUser>(
                    `/api/admin/users/${editingUser.id}`,
                    'PUT',
                    normalized,
                );
            }

            return apiRequest<VaultUser>('/api/admin/users', 'POST', {
                ...normalized,
                password: payload.password,
            });
        },
        onSuccess: () => {
            toast.success(editingUser ? 'Benutzer aktualisiert' : 'Benutzer erstellt');
            closeEditor();
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const toggleUserMutation = useMutation({
        mutationFn: async (user: VaultUser) =>
            apiRequest(`/api/admin/users/${user.id}/toggle-active`, 'PATCH'),
        onSuccess: () => {
            toast.success('Benutzerstatus geändert');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: number) => apiRequest(`/api/admin/users/${userId}`, 'DELETE'),
        onSuccess: () => {
            toast.success('Benutzer gelöscht');
            setDeleteTarget(null);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ user, password }: { user: VaultUser; password: string }) =>
            apiRequest(`/api/admin/users/${user.id}/reset-password`, 'POST', { password }),
        onSuccess: () => {
            toast.success('Passwort wurde zurückgesetzt');
            setResetTarget(null);
            setResetPassword('');
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const issueTemporaryPasswordMutation = useMutation({
        mutationFn: async (user: VaultUser) =>
            apiRequest<{ password: string }>(
                `/api/admin/users/${user.id}/issue-temporary-password`,
                'POST',
            ),
        onSuccess: (data, user) => {
            setTemporaryPassword({ user, password: data.password });
            toast.success('Temporäres Passwort wurde gesetzt');
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const onCreateClick = () => {
        setEditingUser(null);
        setForm(defaultForm);
        setOpen(true);
    };

    const onEditClick = (user: VaultUser) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            is_active: user.is_active,
        });
        setOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Benutzer" />
            <div className="space-y-6 p-6">
                <Card className="overflow-hidden border-border/70 bg-gradient-to-r from-sky-100 to-cyan-100 dark:from-slate-900 dark:to-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <UserCog className="size-6" />
                            Benutzerverwaltung
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Konten anlegen, Rollen steuern und sensible Aktionen sauber bestätigen.
                        </p>
                    </CardHeader>
                </Card>

                <Card className="border-border/70">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Suche nach Name, E-Mail oder Rolle" value={search} onChange={(event) => setSearch(event.target.value)} />
                        </div>

                        <Dialog
                            open={open}
                            onOpenChange={(nextOpen) => {
                                if (!nextOpen) {
                                    closeEditor();
                                    return;
                                }
                                setOpen(true);
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button onClick={onCreateClick}>
                                    <ShieldPlus className="mr-2 size-4" />
                                    Benutzer erstellen
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingUser ? 'Benutzer bearbeiten' : 'Benutzer erstellen'}</DialogTitle>
                                    <DialogDescription>Konto, Rolle und Aktivstatus verwalten.</DialogDescription>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveUserMutation.mutate(form); }}>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-Mail</Label>
                                        <Input id="email" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required />
                                    </div>
                                    {!editingUser && (
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Passwort</Label>
                                            <Input id="password" type="password" minLength={12} value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} required />
                                            <p className="text-xs text-muted-foreground">Mindestens 12 Zeichen.</p>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Rolle</Label>
                                        <select id="role" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as 'admin' | 'user' }))}>
                                            <option value="user">Benutzer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                                        <div>
                                            <Label htmlFor="is-active">Aktiv</Label>
                                            <p className="text-xs text-muted-foreground">Deaktivierte Konten können sich nicht anmelden.</p>
                                        </div>
                                        <input id="is-active" type="checkbox" checked={form.is_active} onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))} />
                                    </div>
                                    <Button className="w-full" type="submit" disabled={saveUserMutation.isPending}>
                                        {saveUserMutation.isPending ? 'Speichern...' : 'Speichern'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto rounded-xl border border-border/70 bg-background/70 backdrop-blur-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/70 text-left">
                                    <tr>
                                        <th className="px-4 py-3">Benutzer</th>
                                        <th className="px-4 py-3">Rolle</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => {
                                        const isCurrentUser = auth.user?.id === user.id;
                                        return (
                                            <tr key={user.id} className="border-t border-border/50 align-top">
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-medium">{user.name}</p>
                                                        {isCurrentUser && <Badge variant="outline">Du</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role === 'admin' ? 'Admin' : 'Benutzer'}</Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={user.is_active ? 'secondary' : 'outline'}>{user.is_active ? 'Aktiv' : 'Deaktiviert'}</Badge>
                                                </td>
                                                <td className="flex flex-wrap gap-2 px-4 py-3">
                                                    <Button variant="secondary" size="sm" onClick={() => onEditClick(user)}>Bearbeiten</Button>
                                                    <Button variant="outline" size="sm" disabled={isCurrentUser} onClick={() => toggleUserMutation.mutate(user)}>
                                                        {user.is_active ? 'Deaktivieren' : 'Aktivieren'}
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => { setResetTarget(user); setResetPassword(''); }}>Passwort zurücksetzen</Button>
                                                    <Button variant="outline" size="sm" onClick={() => issueTemporaryPasswordMutation.mutate(user)}>Temp-Passwort anzeigen</Button>
                                                    <Button variant="destructive" size="sm" disabled={isCurrentUser} onClick={() => setDeleteTarget(user)}>
                                                        <Trash2 className="mr-1 size-4" />
                                                        Löschen
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {usersQuery.isLoading && <p className="pt-4 text-sm text-muted-foreground">Benutzer werden geladen...</p>}
                        {usersQuery.isError && <p className="pt-4 text-sm text-destructive">Benutzer konnten nicht geladen werden.</p>}
                        {usersQuery.data && filteredUsers.length === 0 && <p className="pt-4 text-sm text-muted-foreground">Keine Treffer für deine Suche.</p>}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={resetTarget !== null} onOpenChange={(nextOpen) => { if (!nextOpen) { setResetTarget(null); setResetPassword(''); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Passwort zurücksetzen</DialogTitle>
                        <DialogDescription>{resetTarget ? `Neues Passwort für ${resetTarget.name} festlegen.` : 'Neues Passwort festlegen.'}</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={(event) => {
                        event.preventDefault();
                        if (!resetTarget) return;
                        if (resetPassword.length < 12) {
                            toast.error('Passwort muss mindestens 12 Zeichen lang sein');
                            return;
                        }
                        resetPasswordMutation.mutate({ user: resetTarget, password: resetPassword });
                    }}>
                        <div className="space-y-2">
                            <Label htmlFor="reset-password">Neues Passwort</Label>
                            <Input id="reset-password" type="password" minLength={12} autoFocus value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => { setResetTarget(null); setResetPassword(''); }}>Abbrechen</Button>
                            <Button type="submit" disabled={resetPasswordMutation.isPending}>{resetPasswordMutation.isPending ? 'Wird gesetzt...' : 'Passwort setzen'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={temporaryPassword !== null} onOpenChange={(nextOpen) => { if (!nextOpen) setTemporaryPassword(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Temporäres Passwort</DialogTitle>
                        <DialogDescription>{temporaryPassword ? `Passwort für ${temporaryPassword.user.name}. Nur jetzt sichtbar.` : 'Temporäres Passwort.'}</DialogDescription>
                    </DialogHeader>
                    {temporaryPassword && (
                        <>
                            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 font-mono text-sm break-all">{temporaryPassword.password}</div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={async () => {
                                    const success = await copyToClipboard(temporaryPassword.password);
                                    toast[success ? 'success' : 'error'](success ? 'Temporäres Passwort kopiert' : 'Zwischenablage konnte nicht verwendet werden');
                                }}>
                                    <Copy className="size-4" />
                                    {copiedText === temporaryPassword.password ? 'Kopiert' : 'Kopieren'}
                                </Button>
                                <Button type="button" onClick={() => setTemporaryPassword(null)}>Schließen</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteTarget !== null} onOpenChange={(nextOpen) => { if (!nextOpen) setDeleteTarget(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Benutzer löschen</DialogTitle>
                        <DialogDescription>{deleteTarget ? `Möchtest du ${deleteTarget.name} wirklich löschen? Diese Aktion entfernt das Konto dauerhaft.` : 'Benutzer dauerhaft löschen.'}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>Abbrechen</Button>
                        <Button type="button" variant="destructive" disabled={deleteUserMutation.isPending || !deleteTarget} onClick={() => { if (deleteTarget) deleteUserMutation.mutate(deleteTarget.id); }}>
                            <Trash2 className="size-4" />
                            {deleteUserMutation.isPending ? 'Wird gelöscht...' : 'Jetzt löschen'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
