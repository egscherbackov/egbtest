interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  inverted?: boolean;
}

const fontSizes = { sm: 16, md: 19, lg: 26, xl: 38 };

export default function Logo({ size = "md", inverted = false }: LogoProps) {
  const fs = fontSizes[size];
  const baseColor = inverted ? "#ffffff" : "#171717";
  const accentColor = "#0081c0";

  return (
    <span
      className="inline-flex items-center select-none"
      style={{ lineHeight: 1 }}
    >
      <span
        style={{
          fontSize: fs,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: baseColor,
          fontFamily: "inherit",
        }}
      >
        egorbuyer
      </span>
      <span
        style={{
          fontSize: fs,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: accentColor,
          fontFamily: "inherit",
        }}
      >
        .com
      </span>
    </span>
  );
}
