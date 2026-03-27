import { createInertiaApp } from '@inertiajs/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { AppToaster } from './components/app-toaster';
import { initializeTheme } from './hooks/use-appearance';
import { queryClient } from './lib/query-client';

let appName = import.meta.env.VITE_APP_NAME || 'NebU Secure Vault';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const initialName = (props.initialPage.props as { name?: unknown })
            .name;
        if (typeof initialName === 'string' && initialName.trim() !== '') {
            appName = initialName;
        }

        const root = createRoot(el);

        root.render(
            <StrictMode>
                <QueryClientProvider client={queryClient}>
                    <App {...props} />
                    <AppToaster />
                </QueryClientProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#1148A6',
    },
});

initializeTheme();
