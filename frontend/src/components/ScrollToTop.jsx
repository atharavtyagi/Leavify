import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — On every navigation:
 *   - If the URL has a hash (#section), scroll to that element.
 *   - If no hash, scroll to the very top instantly.
 */
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Short delay so the new page has time to render before we scroll
            const timer = setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 80);
            return () => clearTimeout(timer);
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
