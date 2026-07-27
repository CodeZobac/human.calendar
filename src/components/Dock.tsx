import type { ReactNode } from "react";
import "./Dock.css";

export interface NavigationItem {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

interface DockProps {
  items: NavigationItem[];
  className?: string;
}

/** Responsive primary navigation: a compact bar on desktop, bottom tabs on mobile. */
export default function Dock({ items, className = "" }: DockProps) {
  return (
    <nav className={`primary-nav ${className}`} aria-label="Cycle views">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`primary-nav__item ${item.isActive ? "is-active" : ""}`}
          onClick={item.onClick}
          aria-current={item.isActive ? "page" : undefined}
        >
          <span className="primary-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
