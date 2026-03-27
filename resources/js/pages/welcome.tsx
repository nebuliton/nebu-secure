import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BookOpenText,
    Github,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
    Users,
    Workflow,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    ].filter((item): item is { href: string; icon: typeof BookOpenText; label: string } => item !== null);

    const heroMetrics = [
        {
            eyebrow: 'Schutz',
            value: 'AES-256-GCM',
            detail: 'Envelope Encryption mit versionierbarem Master-Key.',
        },
        {
            eyebrow: 'Kontrolle',
            value: 'Rollen & Gruppen',
            detail: 'Granulare Zuweisungen für Benutzer, Teams und Freigaben.',
        },
        {
            eyebrow: 'Nachvollziehbarkeit',
            value: 'Audit-Log',
            detail: 'Sicherheitsrelevante Aktionen werden zentral protokolliert.',
        },
    ];

    const featureCards = [
        {
            icon: LockKeyhole,
            title: 'Geheimnisse ohne Klartext-Risiko',
            description:
                'Passwörter, Notizen und Werte werden nur verschlüsselt abgelegt und explizit per Reveal entschlüsselt.',
        },
        {
            icon: Users,
            title: 'Teamfähig ohne Berechtigungschaos',
            description:
                'Benutzer, Gruppen, Favoriten und gezielte Freigaben halten den Zugriff sauber und überprüfbar.',
        },
        {
            icon: Workflow,
            title: 'Admin-Workflows mit Struktur',
            description:
                'Benutzerverwaltung, Passwort-Resets, App-Branding und revisionssichere Änderungen laufen an einem Ort zusammen.',
        },
    ];

    const legalLinks = [
        imprintUrl ? { href: imprintUrl, label: 'Impressum' } : null,
        privacyUrl ? { href: privacyUrl, label: 'Datenschutz' } : null,
    ].filter((item): item is { href: string; label: string } => item !== null);

    return (
        <>
            <Head title={appName} />

            <div className="relative min-h-screen overflow-hidden bg-background">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_85%_20%,_rgba(16,185,129,0.14),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0.85),_rgba(248,250,252,0.96))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_85%_20%,_rgba(45,212,191,0.15),_transparent_20%),linear-gradient(180deg,_rgba(9,15,25,0.98),_rgba(15,23,42,0.98))]" />
                <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.08),transparent)]" />

                <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
                    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                                {branding?.app_logo_url ? (
                                    <img
                                        src={branding.app_logo_url}
                                        alt={appName}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <LockKeyhole className="size-7 text-primary" />
                                )}
                            </div>
                            <div>
                                <Badge
                                    variant="secondary"
                                    className="mb-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.24em] shadow-sm dark:border-white/10 dark:bg-white/5"
                                >
                                    Nebuliton Security Vault
                                </Badge>
                                <div className="text-lg font-semibold tracking-tight">
                                    {appName}
                                </div>
                                <p className="max-w-2xl text-sm text-muted-foreground">
                                    {tagline}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;

                                return (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target={
                                            link.href.startsWith('mailto:')
                                                ? undefined
                                                : '_blank'
                                        }
                                        rel={
                                            link.href.startsWith('mailto:')
                                                ? undefined
                                                : 'noreferrer noopener'
                                        }
                                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
                                    >
                                        <Icon className="size-4" />
                                        {link.label}
                                    </a>
                                );
                            })}
                        </div>
                    </header>

                    <main className="grid flex-1 gap-10 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-center">
                        <section className="max-w-3xl">
                            <Badge className="rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-primary shadow-sm">
                                <Sparkles className="size-3.5" />
                                Sichere Passwort- und Secret-Verwaltung
                            </Badge>

                            <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl">
                                Sensible Zugänge zentral verwalten, ohne
                                Sicherheitslücken in den Alltag einzubauen.
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                                {description}
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button asChild size="lg" className="rounded-full px-6">
                                    <Link href={auth.user ? '/dashboard' : '/login'}>
                                        {auth.user
                                            ? 'Zum Dashboard'
                                            : 'Anmeldung öffnen'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>

                                {!auth.user && (
                                    <Button
                                        asChild
                                        variant="secondary"
                                        size="lg"
                                        className="rounded-full px-6"
                                    >
                                        <Link href="/login">
                                            Direkt einloggen
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                {heroMetrics.map((metric) => (
                                    <article
                                        key={metric.value}
                                        className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)] backdrop-blur"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                            {metric.eyebrow}
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold tracking-tight">
                                            {metric.value}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {metric.detail}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="grid gap-4">
                            <div className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Badge
                                            variant="secondary"
                                            className="rounded-full bg-white/70 px-3 py-1 shadow-sm dark:bg-white/5"
                                        >
                                            <ShieldCheck className="size-3.5" />
                                            Sicherheitsprofil
                                        </Badge>
                                        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                                            Für Teams gebaut, die Verantwortung
                                            und Zugriff sauber trennen müssen.
                                        </h2>
                                    </div>
                                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                                        <BadgeCheck className="size-6" />
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4">
                                    {featureCards.map((feature) => {
                                        const Icon = feature.icon;

                                        return (
                                            <article
                                                key={feature.title}
                                                className="rounded-2xl border border-border/60 bg-background/75 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                                                        <Icon className="size-4" />
                                                    </div>
                                                    <h3 className="font-semibold">
                                                        {feature.title}
                                                    </h3>
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <article className="rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.45)] backdrop-blur">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                        Einsatz
                                    </p>
                                    <p className="mt-3 text-xl font-semibold tracking-tight">
                                        Login-Daten, API-Keys, SSH-Zugänge,
                                        Notizen und Einmal-Freigaben.
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        Alle Kernfälle liegen im selben Workflow
                                        und müssen nicht über unsichere
                                        Nebensysteme organisiert werden.
                                    </p>
                                </article>

                                <article className="rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.45)] backdrop-blur">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                        Betrieb
                                    </p>
                                    <p className="mt-3 text-xl font-semibold tracking-tight">
                                        Selbst gehostet, nachvollziehbar und für
                                        Admin-Workflows vorbereitet.
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        Rollen, Statuswechsel, Passwort-Resets
                                        und App-Branding bleiben unter eigener
                                        Kontrolle statt in externen Tools zu
                                        zerfasern.
                                    </p>
                                </article>
                            </div>
                        </section>
                    </main>

                    <footer className="border-t border-border/70 py-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-muted-foreground">
                                © {currentYear} {companyName}. Sichere
                                Zugriffskontrolle, klare Verantwortlichkeiten
                                und nachvollziehbare Freigaben.
                            </div>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                {legalLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                {supportEmail && (
                                    <a
                                        href={`mailto:${supportEmail}`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {supportEmail}
                                    </a>
                                )}
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
