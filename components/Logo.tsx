import React from "react";

export const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 380 70"
      className="h-9 w-auto"
      aria-label="Pachangas.io Logo"
    >
      <g
        fill="none"
        stroke="#4ADE80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="15" y1="48" x2="38" y2="28" />
        <line x1="20" y1="56" x2="48" y2="32" strokeWidth="2" />
        <line x1="30" y1="62" x2="58" y2="38" strokeWidth="1.5" />

        <path d="M 32 58 A 22 22 0 0 1 68 22" strokeWidth="3" />

        <circle cx="55" cy="35" r="16" fill="#09090B" stroke="#4ADE80" strokeWidth="2.5" />
        <polygon points="55,25 59,31 54,36 48,34 49,27" fill="#4ADE80" opacity="0.2" />
        <line x1="55" y1="25" x2="55" y2="19" />
        <line x1="59" y1="31" x2="65" y2="29" />
        <line x1="54" y1="36" x2="55" y2="43" />
        <line x1="48" y1="34" x2="42" y2="37" />
        <line x1="49" y1="27" x2="44" y2="23" />
      </g>

      <text
        x="85"
        y="48"
        fill="#FFFFFF"
        fontFamily="Impact, 'Archivo Narrow', sans-serif"
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="0.5"
      >
        Pachangas
        <tspan fill="#4ADE80">.io</tspan>
      </text>
    </svg>
  );
};