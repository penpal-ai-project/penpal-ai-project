import EmotionBadge from "./EmotionBadge";

interface LetterCardProps {
  sender?: string;
  date: string;
  preview: string;
  emotions: string[];
  isReceived?: boolean;
  onClick?: () => void;
}

const LetterCard = ({ sender, date, preview, emotions, isReceived, onClick }: LetterCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left letter-paper rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-body text-muted-foreground">
          {isReceived ? `${sender || "익명"}님으로부터` : "내가 쓴 편지"}
        </span>
        <span className="text-xs font-body text-muted-foreground">{date}</span>
      </div>
      <p className="font-letter text-foreground leading-relaxed mb-4 line-clamp-3">
        {preview}
      </p>
      <div className="flex flex-wrap gap-2">
        {emotions.map((e) => (
          <EmotionBadge key={e} emotion={e} />
        ))}
      </div>
    </button>
  );
};

export default LetterCard;
