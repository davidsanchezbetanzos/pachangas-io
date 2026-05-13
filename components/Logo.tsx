import React from "react";

export const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 360 70"
      className="h-9 w-auto"
      aria-label="Pachangas.io Logo"
    >
      <g
        fill="none"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="10" y1="48" x2="28" y2="36" strokeWidth="2" opacity="0.7" />
        <line x1="14" y1="56" x2="34" y2="42" strokeWidth="2.5" />
        <line x1="22" y1="62" x2="40" y2="50" strokeWidth="1.5" opacity="0.5" />

        <circle cx="46" cy="35" r="16" strokeWidth="2.5" />

        <polygon
          points="46,26 55,32 52,42 40,42 37,32"
          fill="#22C55E"
          fillOpacity="0.15"
          strokeWidth="2"
        />
        <line x1="46" y1="26" x2="46" y2="19" />
        <line x1="55" y1="32" x2="60" y2="28" />
        <line x1="52" y1="42" x2="56" y2="49" />
        <line x1="40" y1="42" x2="36" y2="49" />
        <line x1="37" y1="32" x2="32" y2="28" />
      </g>

      <text
        x="78"
        y="47"
        fill="#FFFFFF"
        fontFamily="'Archivo Narrow', 'Arial Narrow', 'Helvetica Neue', sans-serif"
        fontSize="31"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="0.5"
      >
        Pachangas
        <tspan fill="#22C55E" fontWeight="800">
          .io
        </tspan>
      </text>
    </svg>
  );
};