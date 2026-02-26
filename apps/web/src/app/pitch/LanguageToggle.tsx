'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { Locale } from './translations';
import styles from './page.module.css';

export function LanguageToggle({ locale }: { locale: Locale; label: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = () => {
    if (locale === 'en') {
      router.push(`${pathname}?lang=zh`);
    } else {
      router.push(pathname);
    }
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
