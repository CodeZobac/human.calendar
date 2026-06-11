import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from "framer-motion";
import {
  useRef,
  type ReactNode,
} from "react";
import "./Dock.css";

interface DockItemData {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

interface DockProps {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
}

export default function Dock({
  items,
  className = "",
  distance = 150,
  panelHeight = 80,
  baseItemSize = 48,
  magnification = 72,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => {
        mouseX.set(e.pageX);
      }}
      onMouseLeave={() => {
        mouseX.set(Infinity);
      }}
      className={`dock-container ${className}`}
    >
      <motion.div
        className="dock-panel glass-panel"
        style={{
          height: panelHeight,
        }}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            mouseX={mouseX}
            distance={distance}
            baseItemSize={baseItemSize}
            magnification={magnification}
            onClick={item.onClick}
            className={item.className}
            label={item.label}
            isActive={item.isActive}
            spring={spring}
          >
            {item.icon}
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}

function DockItem({
  mouseX,
  distance,
  baseItemSize,
  magnification,
  children,
  onClick,
  className = "",
  label,
  isActive,
  spring,
}: {
  mouseX: MotionValue;
  distance: number;
  baseItemSize: number;
  magnification: number;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  label: string;
  isActive?: boolean;
  spring: SpringOptions;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distanceCalc = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - (bounds.x + bounds.width / 2);
  });

  const widthTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );

  const width = useSpring(widthTransform, spring);

  return (
    <div className="dock-item-wrapper" onClick={onClick}>
      <motion.div
        ref={ref}
        style={{ width, height: width }}
        className={`dock-item ${isActive ? "active" : ""} ${className}`}
      >
        {children}
      </motion.div>
      <span className={`dock-label ${isActive ? "active" : ""}`}>{label}</span>
    </div>
  );
}
