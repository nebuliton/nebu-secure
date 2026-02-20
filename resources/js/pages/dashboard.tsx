import { Head, Link, usePage } from '@inertiajs/react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Übersicht', href: '/dashboard' }];

export default function Dashboard() {
    const { auth } = usePage<{ auth: { user: { role: 'admin' | 'user' } } }>().props;
    const isAdmin = auth.user.role === 'admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Übersicht" />
            <div className="space-y-6 p-6">
                <section className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-sky-50 to-indigo-100 p-8 dark:from-slate-950 dark:to-slate-900">
                    <h1 className="text-3xl font-semibold tracking-tight">NebU Secure Vault</h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Team-Tresor mit serverseitiger Envelope Encryption, strikter Autorisierung und nachvollziehbaren Zugriffen.
                    </p>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                    {isAdmin ? (
                        <>
                            <Link href="/admin/users" className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                                <div className="mb-2 flex items-center gap-2 text-lg font-medium"><ShieldCheck className="size-5" />Benutzerverwaltung</div>
                                <p className="text-sm text-muted-foreground">Benutzer anlegen, Rollen setzen, Konten deaktivieren und Passwörter zurücksetzen.</p>
                            </Link>
                            <Link href="/admin/vault-items" className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                                <div className="mb-2 flex items-center gap-2 text-lg font-medium"><LockKeyhole className="size-5" />Tresor-Einträge</div>
                                <p className="text-sm text-muted-foreground">Verschlüsselte Secrets und Zuweisungen für Benutzer und Gruppen verwalten.</p>
                            </Link>
                        </>
                    ) : (
                        <Link href="/vault" className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                            <div className="mb-2 flex items-center gap-2 text-lg font-medium"><LockKeyhole className="size-5" />Mein Tresor</div>
                            <p className="text-sm text-muted-foreground">Deine direkten und gruppenbasierten Secrets sicher anzeigen.</p>
                        </Link>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
