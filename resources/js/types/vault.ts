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

export type VaultItemType = 'login' | 'api_key' | 'ssh_key' | 'note' | 'credit_card' | 'other';

export type VaultItem = {
    id: number;
    title: string;
    item_type: VaultItemType;
    username: string | null;
    server_ip: string | null;
    url: string | null;
    tags_json: string[] | null;
    assigned_user_id: number | null;
    assigned_group_id: number | null;
    groups?: Group[];
    assigned_user?: VaultUser | null;
    assigned_group?: Group | null;
    is_favorite?: boolean;
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
