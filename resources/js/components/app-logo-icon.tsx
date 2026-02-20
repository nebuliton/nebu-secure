import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, alt = 'NebU Secure Vault', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/logo.png" alt={alt} className={`block h-full w-full object-contain ${className ?? ''}`.trim()} {...props} />;
}
