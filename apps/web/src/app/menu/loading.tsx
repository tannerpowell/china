import styles from './page.module.css';

function SkeletonPulse({ width, height = 16 }: { width: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: 'rgba(0,0,0,0.06)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

function SkeletonCategory() {
  return (
    <div className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <SkeletonPulse width={80} height={13} />
        <div style={{ marginTop: 8 }}>
          <SkeletonPulse width={160} height={24} />
        </div>
      </div>
      <div className={styles.menuItems}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <SkeletonPulse width={`${50 + Math.random() * 30}%`} height={14} />
            <SkeletonPulse width={48} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MenuLoading() {
  return (
    <div className={styles.layout}>
      {/* Left panel skeleton */}
      <aside className={styles.leftPanel}>
        <div className={styles.intro}>
          <div style={{ width: 250, height: 250, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', margin: '0 auto 12px' }} />
          <SkeletonPulse width={180} height={28} />
          <div style={{ marginTop: 8 }}>
            <SkeletonPulse width={100} height={14} />
          </div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonPulse key={i} width="100%" height={13} />
            ))}
          </div>
        </div>
      </aside>

      {/* Right panel skeleton */}
      <main className={styles.rightPanel}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCategory key={i} />
        ))}
      </main>
    </div>
  );
}
