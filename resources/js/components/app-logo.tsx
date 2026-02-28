import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { AppSettings } from '@/types';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { name, branding } = usePage<{
        name?: string;
        branding?: AppSettings;
    }>().props;
    const [logoLoadFailed, setLogoLoadFailed] = useState(false);

    const appName = useMemo(() => {
        if (branding?.app_name && branding.app_name.trim() !== '') {
            return branding.app_name;
        }

        if (name && name.trim() !== '') {
            return name;
        }

        return 'NebU Secure Vault';
    }, [branding?.app_name, name]);

    const logoUrl = branding?.app_logo_url ?? null;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {logoUrl && !logoLoadFailed ? (
                    <img
                        src={logoUrl}
                        alt={appName}
                        className="size-full object-cover"
                        onError={() => setLogoLoadFailed(true)}
                    />
                ) : (
                    <AppLogoIcon className="p-1" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {appName}
                </span>
            </div>
        </>
    );
}
