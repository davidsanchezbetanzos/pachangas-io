import React from "react";
import Link from "next/link";

export const Logo = ({ className }: { className?: string }) => {
  const greenNeon = "#00CC66";
  const effectCyan = "#E0FFFF";
  const effectGreen = "#006633";
  const white = "#FFFFFF";

  return (
    <Link href="/" aria-label="Ir al inicio">
      <svg
        viewBox="0 0 650 180"
        className={className || "h-9 w-auto"}
        aria-label="Pachangas.io Logo"
      >
        <g transform="translate(60, 60)">
          <circle cx="0" cy="0" r="45" stroke={greenNeon} strokeWidth="4" fill="none" />
          <g stroke={greenNeon} strokeWidth="2.5" fill="none">
            <path d="M0 -20 L19 -6.2 L11.8 16 L-11.8 16 L-19 -6.2 Z" />
            <line x1="0" y1="-20" x2="0" y2="-45" />
            <line x1="19" y1="-6.2" x2="43" y2="-13" />
            <line x1="11.8" y1="16" x2="27" y2="36" />
            <line x1="-11.8" y1="16" x2="-27" y2="36" />
            <line x1="-19" y1="-6.2" x2="-43" y2="-13" />
          </g>
          <g stroke={greenNeon} strokeWidth="5" strokeLinecap="round">
            <line x1="-30" y1="25" x2="-130" y2="120" />
            <line x1="-45" y1="40" x2="-145" y2="135" />
            <line x1="-60" y1="55" x2="-160" y2="150" />
          </g>
        </g>

        <g
          transform="translate(160, 120)"
          fontStyle="italic"
          fontWeight="bold"
          fontSize="90px"
          fontFamily="sans-serif"
        >
          {/* Subtle glow behind text */}
          <text x="1" y="1" fill={effectCyan} opacity="0.15">
            Pachangas<tspan>.io</tspan>
          </text>
          <text x="0" y="0" fill={white}>
            Pachangas<tspan fill={greenNeon} fontWeight="800">.io</tspan>
          </text>
        </g>
      </svg>
    </Link>
  );
};