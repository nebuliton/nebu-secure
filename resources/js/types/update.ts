export type UpdateRunSummary = {
    id: number;
    mode: 'automatic' | 'manual';
    status: 'running' | 'succeeded' | 'failed' | 'skipped';
    local_version: string | null;
    target_version: string | null;
    local_commit: string | null;
    target_commit: string | null;
    summary: string | null;
    started_at: string | null;
    finished_at: string | null;
};

export type UpdateRunDetail = UpdateRunSummary & {
    changed_files: string[];
    log_output: string;
};

export type UpdateStatus = {
    healthy: boolean;
    error: string | null;
    repository_url: string | null;
    deploy_script: string;
    current_branch: string | null;
    branch: string | null;
    auto_update_enabled: boolean;
    update_available: boolean;
    can_update: boolean;
    local:
        | {
              version: string;
              channel: string;
              commit: string;
              short_commit: string | null;
          }
        | null;
    remote:
        | {
              version: string;
              channel: string;
              commit: string;
              short_commit: string | null;
          }
        | null;
    update_paths: string[];
    tracked_changes: string[];
    changed_files: string[];
    blocked_files: string[];
    last_run: UpdateRunSummary | null;
    recent_runs: UpdateRunSummary[];
};

export type UpdateRunResponse = {
    status: 'busy' | 'failed' | 'skipped' | 'succeeded';
    message: string;
    run: UpdateRunDetail | null;
    status_snapshot: UpdateStatus;
};
