import { Head } from '@inertiajs/react';
import { Palette } from 'lucide-react';
import { useState } from 'react';
import BrandingSettingsPanel from '@/components/admin/branding-settings-panel';
import UpdateManagementPanel from '@/components/admin/update-management-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Einstellungen', href: '/admin/settings' },
];

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<'branding' | 'updates'>(
        'branding',
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Einstellungen" />
            <div className="space-y-6 p-6">
                <Card className="overflow-hidden border-border/70 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-slate-900 dark:to-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Palette className="size-6" />
                            Open-Source App Einstellungen
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Branding, Projektlinks und verwaltete Updates an
                            einem Ort.
                        </p>
                    </CardContent>
                </Card>

                <div className="inline-flex rounded-xl border border-border/70 bg-card p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('branding')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            activeTab === 'branding'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Branding
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('updates')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            activeTab === 'updates'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Updates
                    </button>
                </div>

                {activeTab === 'branding' ? (
                    <BrandingSettingsPanel />
                ) : (
                    <UpdateManagementPanel />
                )}
            </div>
        </AppLayout>
    );
}
