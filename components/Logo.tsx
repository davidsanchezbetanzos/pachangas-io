import React from "react";
import Link from "next/link";

export const Logo = ({ className }: { className?: string }) => {
  const greenNeon = "#00CC66";
  const effectCyan = "#E0FFFF";
  const white = "#FFFFFF";

  return (
    <Link href="/" className="shrink-0" aria-label="Ir al inicio">
      <svg
        viewBox="-60 0 620 170"
        className={className || "h-9 w-auto"}
        style={{ overflow: "visible" }}
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
          {/* Three ascending trajectory lines */}
          <g stroke={greenNeon} strokeWidth="3" strokeLinecap="round" opacity="0.5">
            <line x1="-25" y1="20" x2="-85" y2="70" />
            <line x1="-35" y1="30" x2="-105" y2="85" />
            <line x1="-45" y1="40" x2="-125" y2="100" />
          </g>
        </g>

        <g
          transform="translate(140, 115)"
          fontStyle="italic"
          fontWeight="bold"
          fontSize="95px"
          fontFamily="sans-serif"
        >
          <text x="1" y="1" fill={effectCyan} opacity="0.15">
            Pachangas<tspan>.io</tspan>
          </text>
          <text x="0" y="0" fill={white}>
            Pachangas<tspan fill={greenNeon}>.io</tspan>
          </text>
        </g>
      </svg>
    </Link>
  );
};