import { Head, Link, usePage } from '@inertiajs/react';
import { FolderKey, Layers3, Settings, UserCog, Vault } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
];

const sections = [
    {
        title: 'Benutzer',
        description: 'Konten erstellen, Rollen verwalten und Zugriff steuern.',
        href: '/admin/users',
        icon: UserCog,
    },
    {
        title: 'Gruppen',
        description: 'Gruppenmitgliedschaften und Berechtigungsbereiche verwalten.',
        href: '/admin/groups',
        icon: Layers3,
    },
    {
        title: 'Tresor-Einträge',
        description: 'Verschlüsselte Team-Secrets sicher speichern und aktualisieren.',
        href: '/admin/vault-items',
        icon: FolderKey,
    },
    {
        title: 'Mein Tresor',
        description: 'Sicht eines normalen Nutzers direkt prüfen.',
        href: '/vault',
        icon: Vault,
    },
    {
        title: 'Einstellungen',
        description: 'Branding, Links und globale App-Daten fuer Open-Source-Betrieb pflegen.',
        href: '/admin/settings',
        icon: Settings,
    },
];

export default function AdminDashboardPage() {
    const { name } = usePage<{ name?: string }>().props;
    const appName = name ?? 'NebU Secure Vault';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Übersicht" />
            <div className="space-y-6 p-6">
                <Card className="overflow-hidden border-border/70 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-slate-900 dark:to-slate-800">
                    <CardHeader>
                        <CardTitle className="text-2xl">{appName} Admin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Admin-Oberfläche für verschlüsselte Secrets, Identity-Lifecycle und revisionssichere Zuweisungen.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    {sections.map((section) => (
                        <Link key={section.title} href={section.href} className="rounded-xl border border-border/70 bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                            <div className="mb-2 flex items-center gap-2 text-lg font-medium">
                                <section.icon className="size-5" />
                                {section.title}
                            </div>
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
