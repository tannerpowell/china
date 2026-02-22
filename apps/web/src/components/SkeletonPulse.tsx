/**
 * Shared skeleton loading primitive used across route loading states.
 * Inject `pulseKeyframes` in a <style> tag in the consuming loading component.
 */

export const pulseKeyframes = `
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}`;

export function SkeletonPulse({ width, height = 16 }: { width: string | number; height?: number }) {
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
