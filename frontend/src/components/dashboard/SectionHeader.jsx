// src/components/dashboard/SectionHeader.jsx
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "./icons";

export default function SectionHeader({ icon, title, subtitle, linkTo, linkLabel }) {
  const navigate = useNavigate();
  return (
    <div className="db-section-header">
      <div className="db-section-header__left">
        <div className="db-section-header__icon">{icon}</div>
        <div>
          <div className="db-section-header__title">{title}</div>
          {subtitle && (
            <div className="db-section-header__subtitle">{subtitle}</div>
          )}
        </div>
      </div>
      {linkTo && (
        <button className="db-detail-btn" onClick={() => navigate(linkTo)}>
          {linkLabel || "Lihat Detail"}
          <ArrowRightIcon />
        </button>
      )}
    </div>
  );
}