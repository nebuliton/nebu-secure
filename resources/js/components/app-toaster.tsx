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
    'inline-flex size-8 shrink-0 items-center justify-center rounded-[1rem] ring-1 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.55)]';

const iconToneClassNames = {
    success:
        'bg-emerald-500/12 text-emerald-700 ring-emerald-500/16 dark:bg-emerald-400/14 dark:text-emerald-100 dark:ring-emerald-300/16',
    error: 'bg-rose-500/12 text-rose-700 ring-rose-500/16 dark:bg-rose-400/14 dark:text-rose-100 dark:ring-rose-300/16',
    info: 'bg-sky-500/12 text-sky-700 ring-sky-500/16 dark:bg-sky-400/14 dark:text-sky-100 dark:ring-sky-300/16',
    warning:
        'bg-amber-500/14 text-amber-800 ring-amber-500/16 dark:bg-amber-300/14 dark:text-amber-100 dark:ring-amber-200/16',
    loading:
        'bg-slate-500/10 text-slate-700 ring-slate-500/14 dark:bg-slate-300/10 dark:text-slate-100 dark:ring-slate-200/12',
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
            duration={3600}
            gap={10}
            mobileOffset={14}
            offset={18}
            position="top-right"
            theme={resolvedAppearance}
            visibleToasts={3}
            icons={{
                success: (
                    <ToastIcon
                        tone="success"
                        icon={<CheckCircle2 className="size-4" strokeWidth={2.2} />}
                    />
                ),
                error: (
                    <ToastIcon
                        tone="error"
                        icon={<AlertCircle className="size-4" strokeWidth={2.2} />}
                    />
                ),
                info: (
                    <ToastIcon
                        tone="info"
                        icon={<Info className="size-4" strokeWidth={2.2} />}
                    />
                ),
                warning: (
                    <ToastIcon
                        tone="warning"
                        icon={<TriangleAlert className="size-4" strokeWidth={2.2} />}
                    />
                ),
                loading: (
                    <ToastIcon
                        tone="loading"
                        icon={
                            <LoaderCircle
                                className="size-4 animate-spin"
                                strokeWidth={2.2}
                            />
                        }
                    />
                ),
                close: <X className="size-3.5" strokeWidth={2.25} />,
            }}
            toastOptions={{
                closeButton: true,
                duration: 3600,
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
