
// src/components/icons/CustomBeerGlassIcon.tsx
import type React from 'react';

interface CustomBeerGlassIconProps {
  srmHexColor: string;
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
  glassOutlineColor?: string;
}

const CustomBeerGlassIcon: React.FC<CustomBeerGlassIconProps> = ({
  srmHexColor,
  size = 48,
  className,
  strokeWidth = 1.5,
  glassOutlineColor = "currentColor",
}) => {
  // Path for the liquid portion. This path starts at the top-left of the liquid surface,
  // goes across, then traces the bottom contours of the glass, and comes back up.
  // Points are derived from the original Lucide 'glass-water' icon's viewBox="0 0 24 24".
  const liquidPathD = "M5 11 H19 L17.19 20.21 A2 2 0 0 1 15.2 22 H8.8 A2 2 0 0 1 6.81 20.21 L5 11 Z";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true" // Decorative icon
    >
      {/* Liquid part - filled with beer color */}
      <path
        d={liquidPathD}
        fill={srmHexColor}
        stroke={srmHexColor} // Stroke with same color to prevent thin outline if glass stroke is thick
        strokeWidth={strokeWidth as number}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glass outline itself (stroked, no fill) */}
      {/* This path defines the main body of the glass. */}
      <path
        d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 11h14l-1.81 9.21a2 2 0 0 1-2 1.79Z"
        fill="none"
        stroke={glassOutlineColor}
        strokeWidth={strokeWidth as number}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Rim of the glass (stroked, no fill) */}
      <path
        d="M17.89 3.75a7.5 7.5 0 0 0-11.78 0"
        fill="none"
        stroke={glassOutlineColor}
        strokeWidth={strokeWidth as number}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Water line (stroked, no fill, drawn on top of liquid edge for definition) */}
      <path
        d="M5 11h14"
        fill="none"
        stroke={glassOutlineColor}
        strokeWidth={strokeWidth as number}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomBeerGlassIcon;
