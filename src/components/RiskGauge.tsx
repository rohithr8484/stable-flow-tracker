import { useEffect, useState } from "react";

interface RiskGaugeProps {
  score: number;
  size?: number;
}

const RiskGauge = ({ score, size = 200 }: RiskGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getRiskLabel = (s: number) => {
    if (s <= 30) return { label: "Low Risk", color: "text-success" };
    if (s <= 60) return { label: "Medium Risk", color: "text-warning" };
    return { label: "Severe Alert", color: "text-destructive" };
  };

  const getGradientId = (s: number) => {
    if (s <= 30) return "gaugeGreen";
    if (s <= 60) return "gaugeYellow";
    return "gaugeRed";
  };

  const risk = getRiskLabel(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox="0 0 200 130">
        <defs>
          <linearGradient id="gaugeGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(185, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(160, 84%, 39%)" />
          </linearGradient>
          <linearGradient id="gaugeYellow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(50, 90%, 50%)" />
            <stop offset="100%" stopColor="hsl(38, 92%, 50%)" />
          </linearGradient>
          <linearGradient id="gaugeRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(38, 92%, 50%)" />
            <stop offset="100%" stopColor="hsl(0, 72%, 51%)" />
          </linearGradient>
        </defs>

        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="12"
          strokeLinecap="round"
        />

        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke={`url(#${getGradientId(score)})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />

        <text x="100" y="95" textAnchor="middle" className="fill-foreground font-heading" fontSize="40" fontWeight="700">
          {animatedScore}
        </text>

        <text x="15" y="125" textAnchor="middle" className="fill-muted-foreground" fontSize="12">
          0
        </text>
        <text x="185" y="125" textAnchor="middle" className="fill-muted-foreground" fontSize="12">
          100
        </text>
      </svg>
      <span className={`text-sm font-semibold ${risk.color} mt-1`}>{risk.label}</span>
    </div>
  );
};

export default RiskGauge;
