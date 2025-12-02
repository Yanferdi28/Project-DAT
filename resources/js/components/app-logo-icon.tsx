import { ImgHTMLAttributes } from 'react';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {
    variant?: 'dark' | 'light' | 'auto';
}

export default function AppLogoIcon({ variant = 'auto', className, ...props }: AppLogoIconProps) {
    // Logo biru untuk light mode, logo putih untuk dark mode
    const lightLogo = '/logo-light.png';
    const darkLogo = '/logo-dark.png';
    
    if (variant === 'light') {
        return <img src={lightLogo} alt="RRI Banjarmasin" className={className} {...props} />;
    }
    
    if (variant === 'dark') {
        return <img src={darkLogo} alt="RRI Banjarmasin" className={className} {...props} />;
    }
    
    // Auto: show both, CSS will handle visibility
    return (
        <>
            <img 
                src={lightLogo} 
                alt="RRI Banjarmasin" 
                className={`dark:hidden ${className || ''}`} 
                {...props} 
            />
            <img 
                src={darkLogo} 
                alt="RRI Banjarmasin" 
                className={`hidden dark:block ${className || ''}`} 
                {...props} 
            />
        </>
    );
}
