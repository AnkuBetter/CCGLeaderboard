interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AuroraText({
  children,
  className = "",
}: AuroraTextProps) {
  return <span className={`aurora-text ${className}`}>{children}</span>;
}
