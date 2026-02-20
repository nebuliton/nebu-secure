import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import type { SharedVaultItem } from '@/types/vault';

type SharedVaultPageProps = {
    token: string;
};

export default function SharedVaultPage({ token }: SharedVaultPageProps) {
    const itemQuery = useQuery({
        queryKey: ['shared-vault-item', token],
        queryFn: () => apiRequest<SharedVaultItem>(`/api/share-links/${encodeURIComponent(token)}`),
        retry: false,
    });

    const copyText = async (value: string, label: string) => {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} kopiert`);
    };

    return (
        <>
            <Head title="Geteilter Passwort-Link" />
            <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
                <Card className="w-full max-w-xl border-border/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Link2 className="size-5" />
                            Einmal-Link
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {itemQuery.isLoading && <p className="text-sm text-muted-foreground">Link wird geladen...</p>}
                        {itemQuery.isError && (
                            <div className="space-y-2">
                                <Badge variant="destructive">Ungültig</Badge>
                                <p className="text-sm text-muted-foreground">Dieser Link wurde bereits verwendet, ist abgelaufen oder existiert nicht mehr.</p>
                            </div>
                        )}
                        {itemQuery.data && (
                            <div className="space-y-3 text-sm">
                                <p><span className="font-medium">Titel:</span> {itemQuery.data.title}</p>
                                <p><span className="font-medium">Benutzername:</span> {itemQuery.data.username ?? '-'}</p>
                                <p><span className="font-medium">Server-IP:</span> {itemQuery.data.server_ip ?? '-'}</p>
                                <p><span className="font-medium">URL:</span> {itemQuery.data.url ?? '-'}</p>

                                <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                                    <p className="mb-2 font-medium">Passwort</p>
                                    <div className="flex items-center gap-2">
                                        <Input readOnly value={itemQuery.data.password} />
                                        <Button size="icon" variant="outline" onClick={() => void copyText(itemQuery.data.password, 'Passwort')}>
                                            <Copy className="size-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                                    <p className="mb-2 font-medium">Notizen</p>
                                    <div className="flex items-center gap-2">
                                        <Input readOnly value={itemQuery.data.notes ?? '-'} />
                                        <Button size="icon" variant="outline" disabled={!itemQuery.data.notes} onClick={() => itemQuery.data.notes && void copyText(itemQuery.data.notes, 'Notizen')}>
                                            <Copy className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
