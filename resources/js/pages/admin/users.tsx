import { Head, usePage } from '@inertiajs/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, ShieldPlus, Trash2, UserCog } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import { Label } from '@/components/ui/label';
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
    password?: string;
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
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props;

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
            if (editingUser) {
                return apiRequest<VaultUser>(
                    `/api/admin/users/${editingUser.id}`,
                    'PUT',
                    payload,
                );
            }

            return apiRequest<VaultUser>('/api/admin/users', 'POST', payload);
        },
        onSuccess: () => {
            toast.success(
                editingUser ? 'Benutzer aktualisiert' : 'Benutzer erstellt',
            );
            setOpen(false);
            setEditingUser(null);
            setForm(defaultForm);
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
        mutationFn: async (userId: number) =>
            apiRequest(`/api/admin/users/${userId}`, 'DELETE'),
        onSuccess: () => {
            toast.success('Benutzer gelöscht');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async ({
            user,
            password,
        }: {
            user: VaultUser;
            password: string;
        }) =>
            apiRequest(`/api/admin/users/${user.id}/reset-password`, 'POST', {
                password,
            }),
        onSuccess: () => toast.success('Passwort wurde zurückgesetzt'),
        onError: (error: Error) => toast.error(error.message),
    });

    const issueTemporaryPasswordMutation = useMutation({
        mutationFn: async (user: VaultUser) =>
            apiRequest<{ password: string }>(
                `/api/admin/users/${user.id}/issue-temporary-password`,
                'POST',
            ),
        onSuccess: (data) => {
            window.prompt(
                'Temporäres Passwort (jetzt kopieren):',
                data.password,
            );
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
                            Konten anlegen, Rollen steuern, Zugriff sperren und
                            Benutzer entfernen.
                        </p>
                    </CardHeader>
                </Card>

                <Card className="border-border/70">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Suche nach Name, E-Mail oder Rolle"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={onCreateClick}>
                                    <ShieldPlus className="mr-2 size-4" />
                                    Benutzer erstellen
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingUser
                                            ? 'Benutzer bearbeiten'
                                            : 'Benutzer erstellen'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Benutzerkonto mit Rolle und Status
                                        verwalten.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        saveUserMutation.mutate(form);
                                    }}
                                >
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={form.name}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    name: event.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>E-Mail</Label>
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    email: event.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    {!editingUser && (
                                        <div className="space-y-2">
                                            <Label>Passwort</Label>
                                            <Input
                                                type="password"
                                                value={form.password}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        password:
                                                            event.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>Rolle</Label>
                                        <select
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={form.role}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    role: event.target.value as
                                                        | 'admin'
                                                        | 'user',
                                                }))
                                            }
                                        >
                                            <option value="user">
                                                Benutzer
                                            </option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Aktiv</Label>
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    is_active:
                                                        event.target.checked,
                                                }))
                                            }
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        type="submit"
                                        disabled={saveUserMutation.isPending}
                                    >
                                        {saveUserMutation.isPending
                                            ? 'Speichern...'
                                            : 'Speichern'}
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
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-t border-border/50 align-top"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        user.role === 'admin'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {user.role === 'admin'
                                                        ? 'Admin'
                                                        : 'Benutzer'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        user.is_active
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {user.is_active
                                                        ? 'Aktiv'
                                                        : 'Deaktiviert'}
                                                </Badge>
                                            </td>
                                            <td className="flex flex-wrap gap-2 px-4 py-3">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() =>
                                                        onEditClick(user)
                                                    }
                                                >
                                                    Bearbeiten
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleUserMutation.mutate(
                                                            user,
                                                        )
                                                    }
                                                >
                                                    {user.is_active
                                                        ? 'Deaktivieren'
                                                        : 'Aktivieren'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const password =
                                                            window.prompt(
                                                                'Neues Passwort eingeben (mind. 12 Zeichen):',
                                                            );

                                                        if (!password) {
                                                            return;
                                                        }

                                                        resetPasswordMutation.mutate(
                                                            { user, password },
                                                        );
                                                    }}
                                                >
                                                    Passwort zurücksetzen
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        issueTemporaryPasswordMutation.mutate(
                                                            user,
                                                        )
                                                    }
                                                >
                                                    Temp-Passwort anzeigen
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={
                                                        auth.user?.id ===
                                                        user.id
                                                    }
                                                    onClick={() => {
                                                        const confirmed =
                                                            window.confirm(
                                                                `Benutzer "${user.name}" wirklich löschen?`,
                                                            );

                                                        if (!confirmed) {
                                                            return;
                                                        }

                                                        deleteUserMutation.mutate(
                                                            user.id,
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="mr-1 size-4" />
                                                    Löschen
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {usersQuery.isLoading && (
                            <p className="pt-4 text-sm text-muted-foreground">
                                Benutzer werden geladen...
                            </p>
                        )}
                        {usersQuery.data && filteredUsers.length === 0 && (
                            <p className="pt-4 text-sm text-muted-foreground">
                                Keine Treffer für deine Suche.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
