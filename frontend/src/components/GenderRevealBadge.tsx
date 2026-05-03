import { Lock, Unlock } from "lucide-react";

interface GenderRevealBadgeProps {
  exchangeCount: number;
  gender?: string;
  revealThreshold?: number;
}

const GenderRevealBadge = ({
  exchangeCount,
  gender,
  revealThreshold = 3,
}: GenderRevealBadgeProps) => {
  const isRevealed = exchangeCount >= revealThreshold;

  if (isRevealed && gender) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-body text-xs text-accent">
        <Unlock className="w-3 h-3" />
        {gender === "male" ? "남성" : "여성"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border font-body text-xs text-muted-foreground">
      <Lock className="w-3 h-3" />
      성별 비공개
      <span className="text-[10px]">({exchangeCount}/{revealThreshold}회)</span>
    </span>
  );
};

export default GenderRevealBadge;
