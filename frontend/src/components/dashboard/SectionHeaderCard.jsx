// src/components/dashboard/SectionHeaderCard.jsx
import SectionHeader from "./SectionHeader";

// Header (icon + judul + subtitle + tombol detail) dibungkus card sendiri,
// terpisah dari card konten di bawahnya (map/grafik/dll).
export default function SectionHeaderCard({ icon, title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="db-card db-card--header mb-3">
      <SectionHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        linkTo={linkTo}
        linkLabel={linkLabel}
      />
    </div>
  );
}