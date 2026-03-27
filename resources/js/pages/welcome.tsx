import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenText,
    Github,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Users,
    Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppSettings } from '@/types';

const normalizeExternalUrl = (url: string | null | undefined) => {
    if (!url) {
        return null;
    }

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
        return null;
    }

    const normalizedUrl = /^[a-z][a-z\d+.-]*:/i.test(trimmedUrl)
        ? trimmedUrl
        : `https://${trimmedUrl}`;

    try {
        return new URL(normalizedUrl).toString();
    } catch {
        return null;
    }
};

export default function Welcome() {
    const { auth, name, branding } = usePage<{
        auth: { user: { id: number } | null };
        name?: string;
        branding?: AppSettings;
    }>().props;

    const appName = branding?.app_name?.trim() || name || 'NebU Secure Vault';
    const tagline =
        branding?.app_tagline?.trim() ||
        'Sicherer Team-Tresor mit serverseitiger Verschlüsselung, klaren Rollen und nachvollziehbaren Freigaben.';
    const description =
        branding?.app_description?.trim() ||
        'Verwalte Passwörter, API-Keys und sensible Zugangsdaten zentral an einem Ort. Für Teams, die Sicherheit, Verantwortlichkeit und saubere Betriebsabläufe ernst nehmen.';
    const repositoryUrl = normalizeExternalUrl(branding?.repository_url);
    const documentationUrl = normalizeExternalUrl(branding?.documentation_url);
    const imprintUrl = normalizeExternalUrl(branding?.imprint_url);
    const privacyUrl = normalizeExternalUrl(branding?.privacy_url);
    const supportEmail = branding?.support_email?.trim() || null;
    const companyName = branding?.company_name?.trim() || appName;
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        documentationUrl
            ? {
                  href: documentationUrl,
                  icon: BookOpenText,
                  label: 'Dokumentation',
              }
            : null,
        repositoryUrl
            ? {
                  href: repositoryUrl,
                  icon: Github,
                  label: 'Repository',
              }
            : null,
        supportEmail
            ? {
                  href: `mailto:${supportEmail}`,
                  icon: Mail,
                  label: 'Support',
              }
            : null,
    ].filter(
        (
            item,
        ): item is { href: string; icon: typeof BookOpenText; label: string } =>
            item !== null,
    );

    const highlights = [
        {
            icon: ShieldCheck,
            title: 'Verschlüsselt gespeichert',
            description:
                'Geheimnisse werden serverseitig verschlüsselt abgelegt und nur gezielt entschlüsselt.',
        },
        {
            icon: Users,
            title: 'Rollen sauber getrennt',
            description:
                'Benutzer, Gruppen und Freigaben bleiben nachvollziehbar statt improvisiert.',
        },
        {
            icon: Workflow,
            title: 'Für echten Betrieb gebaut',
            description:
                'Audit-Log, Freigaben und Admin-Abläufe liegen in einem klaren System.',
        },
    ];

    const legalLinks = [
        imprintUrl ? { href: imprintUrl, label: 'Impressum' } : null,
        privacyUrl ? { href: privacyUrl, label: 'Datenschutz' } : null,
    ].filter((item): item is { href: string; label: string } => item !== null);

    return (
        <>
            <Head title={appName} />

            <div className="min-h-screen bg-background">
                <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 lg:px-8">
                    <header className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-card">
                                {branding?.app_logo_url ? (
                                    <img
                                        src={branding.app_logo_url}
                                        alt={appName}
                                        className="size-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <LockKeyhole className="size-5 text-foreground" />
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    Nebuliton Security Vault
                                </div>
                                <div className="text-base font-semibold tracking-tight">
                                    {appName}
                                </div>
                            </div>
                        </div>

                        <Button asChild>
                            <Link href={auth.user ? '/dashboard' : '/login'}>
                                {auth.user ? 'Zum Dashboard' : 'Anmelden'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </header>

                    <main className="flex flex-1 flex-col justify-center py-16 lg:py-24">
                        <section className="max-w-3xl">
                            <p className="text-sm font-medium text-muted-foreground">
                                Sichere Passwort- und Secret-Verwaltung
                            </p>
                            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                                {tagline}
                            </h1>
                            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
                                {description}
                            </p>

                            {quickLinks.length > 0 && (
                                <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {quickLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isMail = link.href.startsWith('mailto:');

                                        return (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                target={isMail ? undefined : '_blank'}
                                                rel={
                                                    isMail
                                                        ? undefined
                                                        : 'noreferrer noopener'
                                                }
                                                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                                            >
                                                <Icon className="size-4" />
                                                {link.label}
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="mt-14 grid gap-4 md:grid-cols-3">
                            {highlights.map((highlight) => {
                                const Icon = highlight.icon;

                                return (
                                    <article
                                        key={highlight.title}
                                        className="rounded-3xl border border-border/60 bg-card p-6"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl border border-border/60 p-2">
                                                <Icon className="size-4 text-foreground" />
                                            </div>
                                            <h2 className="font-semibold tracking-tight">
                                                {highlight.title}
                                            </h2>
                                        </div>
                                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                            {highlight.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </section>

                        <section className="mt-10 rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
                            <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.6fr)]">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Warum diese Lösung
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                        Weniger Nebensysteme, weniger Chaos,
                                        mehr Kontrolle über sensible Zugänge.
                                    </h2>
                                    <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Die Anwendung bündelt Tresor, Freigaben
                                        und Admin-Abläufe an einem Ort. So
                                        bleiben Sicherheitsentscheidungen
                                        nachvollziehbar und operative Schritte
                                        sauber dokumentiert.
                                    </p>
                                </div>

                                <div className="space-y-3 text-sm text-muted-foreground">
                                    {supportEmail && (
                                        <a
                                            href={`mailto:${supportEmail}`}
                                            className="block transition-colors hover:text-foreground"
                                        >
                                            {supportEmail}
                                        </a>
                                    )}
                                    {legalLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="block transition-colors hover:text-foreground"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </main>

                    <footer className="border-t border-border/60 pt-6 text-sm text-muted-foreground">
                        © {currentYear} {companyName}
                    </footer>
                </div>
            </div>
        </>
    );
}
