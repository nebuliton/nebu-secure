import { Head } from '@inertiajs/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Layers3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import type { Group, VaultUser } from '@/types/vault';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Gruppen', href: '/admin/groups' },
];

type GroupWithUsers = Group & { users: VaultUser[] };

export default function AdminGroupsPage() {
    const [open, setOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupWithUsers | null>(
        null,
    );
    const [name, setName] = useState('');
    const [memberIds, setMemberIds] = useState<number[]>([]);

    const groupsQuery = useQuery({
        queryKey: ['admin-groups'],
        queryFn: () => apiRequest<GroupWithUsers[]>('/api/admin/groups'),
    });
    const usersQuery = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiRequest<VaultUser[]>('/api/admin/users'),
    });

    const sortedGroups = useMemo(
        () => groupsQuery.data ?? [],
        [groupsQuery.data],
    );

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = { name, member_ids: memberIds };
            if (editingGroup) {
                return apiRequest(
                    `/api/admin/groups/${editingGroup.id}`,
                    'PUT',
                    payload,
                );
            }
            return apiRequest('/api/admin/groups', 'POST', payload);
        },
        onSuccess: () => {
            toast.success(
                editingGroup ? 'Gruppe aktualisiert' : 'Gruppe erstellt',
            );
            setOpen(false);
            setEditingGroup(null);
            setName('');
            setMemberIds([]);
            queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (groupId: number) =>
            apiRequest(`/api/admin/groups/${groupId}`, 'DELETE'),
        onSuccess: () => {
            toast.success('Gruppe gelöscht');
            queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const openCreate = () => {
        setEditingGroup(null);
        setName('');
        setMemberIds([]);
        setOpen(true);
    };

    const openEdit = (group: GroupWithUsers) => {
        setEditingGroup(group);
        setName(group.name);
        setMemberIds(group.users.map((member) => member.id));
        setOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Gruppen" />
            <div className="space-y-6 p-6">
                <Card className="border-border/70">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Layers3 className="size-5" />
                            Gruppenverwaltung
                        </CardTitle>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreate}>
                                    Gruppe erstellen
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingGroup
                                            ? 'Gruppe bearbeiten'
                                            : 'Gruppe erstellen'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Gruppe anlegen oder Mitglieder einer
                                        Gruppe bearbeiten.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    className="space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        saveMutation.mutate();
                                    }}
                                >
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={name}
                                            onChange={(event) =>
                                                setName(event.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mitglieder</Label>
                                        <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-border/70 p-3">
                                            {(usersQuery.data ?? []).map(
                                                (user) => (
                                                    <label
                                                        key={user.id}
                                                        className="flex items-center justify-between gap-3 text-sm"
                                                    >
                                                        <span>
                                                            {user.name} (
                                                            {user.email})
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={memberIds.includes(
                                                                user.id,
                                                            )}
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                if (
                                                                    event.target
                                                                        .checked
                                                                ) {
                                                                    setMemberIds(
                                                                        (
                                                                            prev,
                                                                        ) => [
                                                                            ...prev,
                                                                            user.id,
                                                                        ],
                                                                    );
                                                                } else {
                                                                    setMemberIds(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    id,
                                                                                ) =>
                                                                                    id !==
                                                                                    user.id,
                                                                            ),
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        type="submit"
                                        disabled={saveMutation.isPending}
                                    >
                                        {saveMutation.isPending
                                            ? 'Speichern...'
                                            : 'Speichern'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sortedGroups.map((group) => (
                            <div
                                key={group.id}
                                className="rounded-xl border border-border/70 bg-card p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium">
                                            {group.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Mitglieder: {group.users.length}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => openEdit(group)}
                                        >
                                            Bearbeiten
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                deleteMutation.mutate(group.id)
                                            }
                                        >
                                            Löschen
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {groupsQuery.isLoading && (
                            <p className="text-sm text-muted-foreground">
                                Gruppen werden geladen...
                            </p>
                        )}
                        {groupsQuery.data && groupsQuery.data.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Keine Gruppen vorhanden.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
