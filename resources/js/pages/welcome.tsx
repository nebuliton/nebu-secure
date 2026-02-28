import { Head, Link, usePage } from '@inertiajs/react';
import type { AppSettings } from '@/types';

export default function Welcome() {
    const { auth, name, branding } = usePage<{
        auth: { user: { id: number } | null };
        name?: string;
        branding?: AppSettings;
    }>().props;
    const appName = branding?.app_name ?? name ?? 'NebU Secure Vault';
    const tagline = branding?.app_tagline ?? 'Sicherer Team-Tresor mit serverseitiger Verschluesselung, strikter Berechtigung und vollstaendigem Audit-Log.';

    return (
        <>
            <Head title={appName} />
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <div className="w-full max-w-3xl rounded-2xl border border-border/70 bg-card p-10 shadow-sm">
                    <h1 className="text-3xl font-semibold">{appName}</h1>
                    <p className="mt-3 text-sm text-muted-foreground">{tagline}</p>
                    <div className="mt-8 flex gap-3">
                        {auth.user ? (
                            <Link href="/dashboard" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Zum Dashboard</Link>
                        ) : (
                            <Link href="/login" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Anmelden</Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
