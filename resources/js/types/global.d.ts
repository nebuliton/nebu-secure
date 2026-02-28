import type { Auth } from '@/types/auth';
import type { AppSettings } from '@/types/app-settings';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            branding: AppSettings;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
