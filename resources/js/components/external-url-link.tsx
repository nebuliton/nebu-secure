import { cn } from '@/lib/utils';

type ExternalUrlLinkProps = {
    url: string | null | undefined;
    className?: string;
};

const toExternalUrl = (url: string) => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
        return null;
    }

    const normalizedUrl = /^[a-z][a-z\d+.-]*:/i.test(trimmedUrl)
        ? trimmedUrl
        : `https://${trimmedUrl}`;

    try {
        return new URL(normalizedUrl).toString();
    } catch {
        return null;
    }
};

export function ExternalUrlLink({ url, className }: ExternalUrlLinkProps) {
    if (!url) {
        return <span>-</span>;
    }

    const href = toExternalUrl(url);

    if (!href) {
        return <span className={cn('break-all', className)}>{url}</span>;
    }

    return (
        <a
            className={cn(
                'cursor-pointer break-all font-medium text-foreground/85 underline decoration-primary/45 decoration-2 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/70 dark:text-foreground/90',
                className,
            )}
            href={href}
            rel="noreferrer noopener"
            target="_blank"
        >
            {url}
        </a>
    );
}
