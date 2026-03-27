import { useMutation, useQuery } from '@tanstack/react-query';
import {
    ArrowUpCircle,
    Clock3,
    GitBranch,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
    TerminalSquare,
    TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import type { UpdateRunDetail, UpdateRunResponse, UpdateStatus } from '@/types';

const formatTimestamp = (value: string | null) => {
    if (!value) {
        return 'Noch nicht abgeschlossen';
    }

    return new Date(value).toLocaleString('de-DE');
};

const statusLabel: Record<
    'busy' | 'failed' | 'running' | 'skipped' | 'succeeded',
    string
> = {
    busy: 'Bereits aktiv',
    failed: 'Fehlgeschlagen',
    running: 'Läuft',
    skipped: 'Übersprungen',
    succeeded: 'Erfolgreich',
};

export default function UpdateManagementPanel() {
    const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
    const [latestRun, setLatestRun] = useState<UpdateRunDetail | null>(null);

    const statusQuery = useQuery({
        queryKey: ['admin-update-status'],
        queryFn: () => apiRequest<UpdateStatus>('/api/admin/updates'),
        refetchInterval: 60_000,
    });

    const effectiveSelectedRunId =
        selectedRunId ?? statusQuery.data?.recent_runs?.[0]?.id ?? null;

    const runDetailQuery = useQuery({
        queryKey: ['admin-update-run', effectiveSelectedRunId],
        queryFn: () =>
            apiRequest<UpdateRunDetail>(
                `/api/admin/updates/runs/${effectiveSelectedRunId}`,
            ),
        enabled: effectiveSelectedRunId !== null,
    });

    const preferencesMutation = useMutation({
        mutationFn: async (enabled: boolean) =>
            apiRequest<{ auto_update_enabled: boolean }>(
                '/api/admin/updates/preferences',
                'PATCH',
                { auto_update_enabled: enabled },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-update-status'] });
            toast.success('Update-Einstellungen gespeichert');
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const runMutation = useMutation({
        mutationFn: async () =>
            apiRequest<UpdateRunResponse>('/api/admin/updates/run', 'POST'),
        onSuccess: (result) => {
            queryClient.setQueryData(['admin-update-status'], result.status_snapshot);

            if (result.run) {
                queryClient.setQueryData(
                    ['admin-update-run', result.run.id],
                    result.run,
                );
                setLatestRun(result.run);
                setSelectedRunId(result.run.id);
            }

            if (result.status === 'succeeded') {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const activeRun = useMemo(() => {
        if (latestRun && latestRun.id === effectiveSelectedRunId) {
            return latestRun;
        }

        return runDetailQuery.data ?? null;
    }, [effectiveSelectedRunId, latestRun, runDetailQuery.data]);

    const isBusy = statusQuery.isLoading || statusQuery.isFetching;
    const status = statusQuery.data;
    const isHealthy = status?.healthy ?? false;
    const localVersionLabel = status?.local?.version ?? 'Unbekannt';
    const localCommitLabel = status?.local?.short_commit ?? 'unbekannt';
    const remoteVersionLabel = status?.remote?.version ?? 'Nicht verfügbar';
    const remoteCommitLabel = status?.remote?.short_commit ?? 'nicht verfügbar';
    const repositoryLabel =
        status?.repository_url ?? 'Kein Origin-Remote gefunden';
    const branchLabel =
        status?.current_branch && status?.branch
            ? `${status.current_branch} → ${status.branch}`
            : status?.branch ?? status?.current_branch ?? 'Nicht verfügbar';
    const updatePathsLabel = status?.update_paths.length
        ? status.update_paths.join(', ')
        : 'Nicht verfügbar';

    return (
        <div className="space-y-6">
            <Card className="border-border/70">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                            <ArrowUpCircle className="size-5" />
                            Update-Management
                        </CardTitle>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Vergleicht die lokale Version aus
                            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">
                                version.json
                            </code>
                            mit dem Git-Stand. Ein Release wird nur installiert,
                            wenn es ausschließlich freigegebene Pfade enthält.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                queryClient.invalidateQueries({
                                    queryKey: ['admin-update-status'],
                                })
                            }
                            disabled={isBusy}
                        >
                            <RefreshCw className="mr-2 size-4" />
                            Status aktualisieren
                        </Button>
                        <Button
                            type="button"
                            onClick={() => runMutation.mutate()}
                            disabled={
                                runMutation.isPending ||
                                !status?.healthy ||
                                !status?.update_available
                            }
                        >
                            {runMutation.isPending ? (
                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                            ) : (
                                <ArrowUpCircle className="mr-2 size-4" />
                            )}
                            Update jetzt installieren
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {statusQuery.isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircle className="size-4 animate-spin" />
                            Update-Status wird geladen...
                        </div>
                    )}

                    {status && (
                        <>
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-border/60 bg-card p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Installierter Stand
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold tracking-tight">
                                                {localVersionLabel}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                !isHealthy
                                                    ? 'outline'
                                                    : status.update_available
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {!isHealthy
                                                ? 'Statusfehler'
                                                : status.update_available
                                                ? 'Update verfügbar'
                                                : 'Aktuell'}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Commit:{' '}
                                        {localCommitLabel}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-card p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Verfügbarer Remote-Stand
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold tracking-tight">
                                                {remoteVersionLabel}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                !isHealthy
                                                    ? 'outline'
                                                    : status.can_update
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                        >
                                            {!isHealthy
                                                ? 'Statusfehler'
                                                : status.can_update
                                                ? 'Installierbar'
                                                : 'Prüfung nötig'}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Commit:{' '}
                                        {remoteCommitLabel}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                                <div className="rounded-2xl border border-border/60 bg-card p-4">
                                    <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Repository
                                            </p>
                                            {status.repository_url ? (
                                                <a
                                                    href={status.repository_url}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="break-all hover:text-foreground"
                                                >
                                                    {status.repository_url}
                                                </a>
                                            ) : (
                                                <p>{repositoryLabel}</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Branch
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <GitBranch className="size-4" />
                                                {branchLabel}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Deploy-Skript
                                            </p>
                                            <p>{status.deploy_script}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Freigegebene Bereiche
                                            </p>
                                            <p className="break-words">
                                                {updatePathsLabel}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-card p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Automatische Updates
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Prüft alle 15 Minuten und zieht
                                                freigegebene Releases nur bei
                                                aktivem Schalter.
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={
                                                status.auto_update_enabled
                                            }
                                            onChange={(event) =>
                                                preferencesMutation.mutate(
                                                    event.target.checked,
                                                )
                                            }
                                            disabled={
                                                preferencesMutation.isPending ||
                                                !isHealthy
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {!!status.error && (
                                <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                                    <div className="mb-2 flex items-center gap-2 font-medium">
                                        <TriangleAlert className="size-4" />
                                        Update-Prüfung fehlgeschlagen
                                    </div>
                                    <p>{status.error}</p>
                                </div>
                            )}

                            {status.tracked_changes.length > 0 && (
                                <div className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                                    <div className="mb-2 flex items-center gap-2 font-medium">
                                        <TriangleAlert className="size-4" />
                                        Lokale Änderungen blockieren Updates
                                    </div>
                                    <ul className="space-y-1 font-mono text-xs">
                                        {status.tracked_changes.map((entry) => (
                                            <li key={entry}>{entry}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {status.blocked_files.length > 0 && (
                                <div className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                                    <div className="mb-2 flex items-center gap-2 font-medium">
                                        <ShieldCheck className="size-4" />
                                        Release enthält nicht freigegebene Dateien
                                    </div>
                                    <ul className="space-y-1 font-mono text-xs">
                                        {status.blocked_files.map((file) => (
                                            <li key={file}>{file}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {status.changed_files.length > 0 && (
                                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                                    <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                                        <TerminalSquare className="size-4" />
                                        Dateien der nächsten freigegebenen Version
                                    </div>
                                    <ul className="grid gap-1 font-mono text-xs md:grid-cols-2">
                                        {status.changed_files.map((file) => (
                                            <li key={file}>{file}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock3 className="size-5" />
                            Letzte Läufe
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {status?.recent_runs.length ? (
                            status.recent_runs.map((run) => (
                                <button
                                    key={run.id}
                                    type="button"
                                    onClick={() => setSelectedRunId(run.id)}
                                    className={`w-full rounded-2xl border p-3 text-left transition ${
                                        effectiveSelectedRunId === run.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border/60 bg-card hover:border-border'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium">
                                            Lauf #{run.id}
                                        </span>
                                        <Badge variant="outline">
                                            {run.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {run.local_version ?? '-'} →{' '}
                                        {run.target_version ?? '-'}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {formatTimestamp(run.started_at)}
                                    </p>
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Noch kein Update-Lauf vorhanden.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeRun ? (
                            <>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">
                                        {statusLabel[activeRun.status] ??
                                            activeRun.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {activeRun.local_version ?? '-'} →{' '}
                                        {activeRun.target_version ?? '-'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatTimestamp(activeRun.started_at)}
                                    </span>
                                </div>

                                {activeRun.summary && (
                                    <p className="text-sm text-muted-foreground">
                                        {activeRun.summary}
                                    </p>
                                )}

                                {activeRun.changed_files.length > 0 && (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Geänderte Dateien
                                        </p>
                                        <div className="grid gap-1 font-mono text-xs text-muted-foreground md:grid-cols-2">
                                            {activeRun.changed_files.map((file) => (
                                                <div key={file}>{file}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <pre className="max-h-[520px] overflow-auto rounded-2xl border border-border/60 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                                    {activeRun.log_output || 'Keine Logs vorhanden.'}
                                </pre>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Wähle einen Lauf aus, um die Update-Logs zu
                                sehen.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
