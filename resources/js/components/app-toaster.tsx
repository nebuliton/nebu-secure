import { Toaster } from 'sonner';
import { useAppearance } from '@/hooks/use-appearance';

export function AppToaster() {
    const { resolvedAppearance } = useAppearance();

    return (
        <Toaster
            closeButton
            containerAriaLabel="Benachrichtigungen"
            duration={3200}
            expand={false}
            gap={8}
            mobileOffset={12}
            offset={16}
            position="top-right"
            theme={resolvedAppearance}
            visibleToasts={3}
            toastOptions={{
                closeButton: true,
                duration: 3200,
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
