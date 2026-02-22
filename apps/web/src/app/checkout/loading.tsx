import { SkeletonPulse, pulseKeyframes } from '@/components/SkeletonPulse';
import styles from './page.module.css';

function SkeletonField() {
  return (
    <div style={{ marginBottom: 16 }}>
      <SkeletonPulse width={80} height={13} />
      <div style={{ marginTop: 6 }}>
        <SkeletonPulse width="100%" height={44} />
      </div>
    </div>
  );
}

export default function CheckoutLoading() {
  return (
    <main className={styles.main}>
      <style>{pulseKeyframes}</style>

      <SkeletonPulse width={120} height={14} />

      <div className={styles.grid} style={{ marginTop: 24 }}>
        {/* Order summary skeleton */}
        <section>
          <SkeletonPulse width={140} height={24} />
          <div className={styles.dottedRule} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <SkeletonPulse width={`${60 + (i * 7) % 20}%`} height={15} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <SkeletonPulse width={80} height={28} />
                <SkeletonPulse width={48} height={14} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px dashed var(--red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <SkeletonPulse width={60} height={14} />
              <SkeletonPulse width={48} height={14} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <SkeletonPulse width={30} height={14} />
              <SkeletonPulse width={36} height={14} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <SkeletonPulse width={50} height={18} />
              <SkeletonPulse width={60} height={18} />
            </div>
          </div>
        </section>

        {/* Form skeleton */}
        <section>
          <SkeletonPulse width={120} height={24} />
          <div className={styles.dottedRule} />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <div style={{ marginTop: 16 }}>
            <SkeletonPulse width="100%" height={48} />
          </div>
        </section>
      </div>
    </main>
  );
}
