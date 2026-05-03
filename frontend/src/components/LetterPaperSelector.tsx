export type PaperStyle = "default" | "warm" | "night" | "handwritten";

interface PaperOption {
  id: PaperStyle;
  label: string;
  emoji: string;
  previewClass: string;
}

const paperOptions: PaperOption[] = [
  { id: "default", label: "기본 편지지", emoji: "📝", previewClass: "bg-[hsl(40,40%,94%)]" },
  { id: "warm", label: "따뜻한 감성", emoji: "🧡", previewClass: "bg-[hsl(30,40%,90%)]" },
  { id: "night", label: "밤 감성", emoji: "🌙", previewClass: "bg-[hsl(230,20%,22%)]" },
  { id: "handwritten", label: "손글씨 느낌", emoji: "✍️", previewClass: "bg-[hsl(45,50%,92%)]" },
];

interface LetterPaperSelectorProps {
  selected: PaperStyle;
  onSelect: (style: PaperStyle) => void;
}

const LetterPaperSelector = ({ selected, onSelect }: LetterPaperSelectorProps) => {
  return (
    <div>
      <p className="font-body text-sm font-medium text-foreground mb-3">
        편지지를 선택하세요
      </p>
      <div className="grid grid-cols-4 gap-2">
        {paperOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
              selected === opt.id
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-input bg-background hover:border-primary/40"
            }`}
          >
            <div className={`w-10 h-12 rounded-md border border-border ${opt.previewClass}`} />
            <span className="font-body text-[10px] text-muted-foreground leading-tight text-center">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LetterPaperSelector;

export const getPaperClasses = (style: PaperStyle) => {
  switch (style) {
    case "warm":
      return {
        paper: "bg-[hsl(30,40%,90%)] bg-none border-[hsl(25,30%,75%)]",
        text: "text-[hsl(20,30%,20%)]",
        placeholder: "placeholder:text-[hsl(20,20%,50%)]/50",
        font: "font-letter",
      };
    case "night":
      return {
        paper: "bg-[hsl(230,20%,22%)] bg-none border-[hsl(230,15%,35%)]",
        text: "text-[hsl(40,30%,85%)]",
        placeholder: "placeholder:text-[hsl(40,20%,55%)]/50",
        font: "font-letter",
      };
    case "handwritten":
      return {
        paper: "bg-[hsl(45,50%,92%)] bg-none border-[hsl(40,30%,78%)]",
        text: "text-[hsl(25,30%,22%)]",
        placeholder: "placeholder:text-[hsl(25,20%,50%)]/50",
        font: "font-letter italic",
      };
    default:
      return {
        paper: "letter-paper",
        text: "text-foreground",
        placeholder: "placeholder:text-muted-foreground/50",
        font: "font-letter",
      };
  }
};
