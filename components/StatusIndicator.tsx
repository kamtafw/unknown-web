interface StatusIndicatorProps {
  children: React.ReactNode;
  variant?: 'active' | 'viewed';
}

export const StatusIndicator = ({ children, variant = 'active' }: StatusIndicatorProps) => {
  const strokeColor = variant === 'active' ? '#3B82F6' : '#D1D5DB';
  
  return (
    <div className="relative">
      {children}
      <div className="absolute -inset-1 w-17 h-17">
        <svg
          className="w-full h-full"
          viewBox="0 0 68 68"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="34"
            cy="34"
            r="32"
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="25 8"
          />
        </svg>
      </div>
    </div>
  );
};