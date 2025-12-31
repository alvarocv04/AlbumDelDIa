import { useEffect } from 'react';

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

const GA_MEASUREMENT_ID = 'G-PLR2813MBQ';

export const useAnalytics = () => {
    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');

        if (consent === 'true') {
            // Check if script is already present
            if (document.getElementById('google-analytics')) {
                return;
            }

            // Load Google Analytics Script
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            script.async = true;
            script.id = 'google-analytics';
            document.head.appendChild(script);

            // Initialize dataLayer
            window.dataLayer = window.dataLayer || [];
            function gtag(...args: any[]) {
                window.dataLayer.push(args);
            }
            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID);
        }
    }, []);
};
