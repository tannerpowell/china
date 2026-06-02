'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { Locale } from './translations';
import styles from './page.module.css';

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = () => {
    // Preserve any existing query params; only flip the `lang` key.
    const params = new URLSearchParams(window.location.search);
    if (locale === 'en') {
      params.set('lang', 'zh');
    } else {
      params.delete('lang');
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={styles.langToggle}
      aria-label={locale === 'en' ? 'Switch to Chinese' : '切换至英文'}
    >
      {locale === 'en' ? '中文' : 'English'}
    </button>
  );
}
