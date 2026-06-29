// src/components/dashboard/icons.jsx
// Kumpulan icon SVG inline yang dipakai di beberapa tempat berbeda di
// Dashboard (RobAlertBanner, SummaryStats, SectionHeaderCard, WeatherSection).
// Diekstrak ke sini supaya path SVG yang sama tidak diketik ulang di banyak
// file — size & strokeWidth dibuat jadi prop karena beberapa pemakaian
// butuh ukuran sedikit berbeda.

export function CloudIcon({ size = 18, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 010 9z" />
    </svg>
  );
}

export function LocationPinIcon({ size = 20, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function AlertTriangleIcon({ size = 18, strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function AlertCircleIcon({ size = 18, strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function WaveIcon({ size = 18, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M2 12h20M2 6c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3M2 18c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3" />
    </svg>
  );
}

export function ThermometerIcon({ size = 20, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    </svg>
  );
}

export function RobPinIcon({ size = 18, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 14, strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 16, strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}