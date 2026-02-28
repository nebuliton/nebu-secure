export type Group = {
    id: number;
    name: string;
};

export type VaultUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    is_active: boolean;
    groups?: Group[];
};

export type VaultItem = {
    id: number;
    title: string;
    username: string | null;
    server_ip: string | null;
    url: string | null;
    tags_json: string[] | null;
    assigned_user_id: number | null;
    assigned_group_id: number | null;
    groups?: Group[];
    assigned_user?: VaultUser | null;
    assigned_group?: Group | null;
    created_at: string;
    updated_at: string;
};

export type VaultReveal = {
    value: string | null;
    password: string | null;
    notes: string | null;
};

export type VaultShareLinkResponse = {
    url: string;
    expires_at: string;
};

export type SharedVaultItem = {
    title: string;
    username: string | null;
    server_ip: string | null;
    url: string | null;
    value: string | null;
    password: string | null;
    notes: string | null;
};
