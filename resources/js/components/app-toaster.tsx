import {
    AlertCircle,
    CheckCircle2,
    Info,
    LoaderCircle,
    TriangleAlert,
    X,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const iconShellClassName =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]';

const iconToneClassNames = {
    success:
        'bg-emerald-500/14 text-emerald-700 ring-emerald-500/18 dark:bg-emerald-400/16 dark:text-emerald-100 dark:ring-emerald-300/18',
    error: 'bg-rose-500/14 text-rose-700 ring-rose-500/18 dark:bg-rose-400/16 dark:text-rose-100 dark:ring-rose-300/18',
    info: 'bg-sky-500/14 text-sky-700 ring-sky-500/18 dark:bg-sky-400/16 dark:text-sky-100 dark:ring-sky-300/18',
    warning:
        'bg-amber-500/16 text-amber-800 ring-amber-500/20 dark:bg-amber-300/16 dark:text-amber-100 dark:ring-amber-200/18',
    loading:
        'bg-slate-500/12 text-slate-700 ring-slate-500/16 dark:bg-slate-300/12 dark:text-slate-100 dark:ring-slate-200/14',
} as const;

type ToastTone = keyof typeof iconToneClassNames;

function ToastIcon({
    icon,
    tone,
}: {
    icon: React.ReactNode;
    tone: ToastTone;
}) {
    return (
        <span className={cn(iconShellClassName, iconToneClassNames[tone])}>
            {icon}
        </span>
    );
}

export function AppToaster() {
    const { resolvedAppearance } = useAppearance();

    return (
        <Toaster
            closeButton
            containerAriaLabel="Benachrichtigungen"
            duration={4200}
            expand
            gap={12}
            mobileOffset={16}
            offset={20}
            position="top-right"
            theme={resolvedAppearance}
            visibleToasts={4}
            icons={{
                success: (
                    <ToastIcon
                        tone="success"
                        icon={<CheckCircle2 className="size-4.5" strokeWidth={2.25} />}
                    />
                ),
                error: (
                    <ToastIcon
                        tone="error"
                        icon={<AlertCircle className="size-4.5" strokeWidth={2.25} />}
                    />
                ),
                info: (
                    <ToastIcon
                        tone="info"
                        icon={<Info className="size-4.5" strokeWidth={2.25} />}
                    />
                ),
                warning: (
                    <ToastIcon
                        tone="warning"
                        icon={<TriangleAlert className="size-4.5" strokeWidth={2.25} />}
                    />
                ),
                loading: (
                    <ToastIcon
                        tone="loading"
                        icon={
                            <LoaderCircle
                                className="size-4.5 animate-spin"
                                strokeWidth={2.25}
                            />
                        }
                    />
                ),
                close: <X className="size-4" strokeWidth={2.25} />,
            }}
            toastOptions={{
                closeButton: true,
                duration: 4200,
                unstyled: true,
                classNames: {
                    toast: 'app-toast',
                    content: 'app-toast__content',
                    title: 'app-toast__title',
                    description: 'app-toast__description',
                    icon: 'app-toast__icon',
                    loader: 'app-toast__loader',
                    closeButton: 'app-toast__close',
                    actionButton: 'app-toast__action',
                    cancelButton: 'app-toast__cancel',
                    success: 'app-toast--success',
                    error: 'app-toast--error',
                    info: 'app-toast--info',
                    warning: 'app-toast--warning',
                    loading: 'app-toast--loading',
                    default: 'app-toast--default',
                },
            }}
        />
    );
}
