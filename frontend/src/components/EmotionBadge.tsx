interface EmotionBadgeProps {
  emotion: string;
  selected?: boolean;
  onClick?: () => void;
}

const emotionConfig: Record<string, { emoji: string; colorClass: string }> = {
  따뜻함: { emoji: "🧡", colorClass: "bg-emotion-warm/15 text-emotion-warm border-emotion-warm/30" },
  평온함: { emoji: "🌊", colorClass: "bg-emotion-calm/15 text-emotion-calm border-emotion-calm/30" },
  기쁨: { emoji: "✨", colorClass: "bg-emotion-joy/15 text-emotion-joy border-emotion-joy/30" },
  슬픔: { emoji: "🌧️", colorClass: "bg-emotion-sad/15 text-emotion-sad border-emotion-sad/30" },
  불안: { emoji: "🍂", colorClass: "bg-emotion-anxious/15 text-emotion-anxious border-emotion-anxious/30" },
  그리움: { emoji: "🌙", colorClass: "bg-emotion-calm/15 text-emotion-calm border-emotion-calm/30" },
  감사: { emoji: "🌿", colorClass: "bg-emotion-joy/15 text-emotion-joy border-emotion-joy/30" },
  외로움: { emoji: "🫧", colorClass: "bg-emotion-sad/15 text-emotion-sad border-emotion-sad/30" },
};

const EmotionBadge = ({ emotion, selected, onClick }: EmotionBadgeProps) => {
  const config = emotionConfig[emotion] || { emoji: "💭", colorClass: "bg-muted text-muted-foreground border-border" };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body border transition-all duration-200 ${
        selected
          ? `${config.colorClass} ring-2 ring-offset-2 ring-offset-background`
          : `${config.colorClass} hover:scale-105`
      }`}
    >
      <span>{config.emoji}</span>
      <span>{emotion}</span>
    </button>
  );
};

export default EmotionBadge;
