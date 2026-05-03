import { useState, useEffect } from "react";
import { Sparkles, Lightbulb, SpellCheck, X } from "lucide-react";

interface AIWritingAssistantProps {
  content: string;
  selectedEmotions: string[];
}

const emotionSuggestions: Record<string, string[]> = {
  "따뜻함": ["마음이 포근해지는", "따스한 온기가 느껴지는", "감싸안는 듯한"],
  "평온함": ["고요한 수면 위를 걷는 것처럼", "마음이 잔잔해지는", "깊은 호흡처럼"],
  "기쁨": ["마음속 꽃이 피어나는", "세상이 환해지는", "가슴이 설레는"],
  "슬픔": ["눈물이 고이는", "마음 한켠이 시리는", "빗소리처럼 스며드는"],
  "불안": ["파도 위의 작은 배처럼", "안갯속을 걷는 듯한", "가슴이 조여오는"],
  "그리움": ["아득한 기억 속으로", "손끝에서 스치는", "바람결에 실려오는"],
  "감사": ["마음 깊이 감사한", "소중함을 새삼 느끼는", "가슴이 벅차오르는"],
  "외로움": ["텅 빈 방에 울리는", "혼자서 걷는 길처럼", "누군가를 기다리는"],
};

const spellingFixes = [
  { wrong: "되요", correct: "돼요", tip: "'하여'로 바꿀 수 있으면 '돼'" },
  { wrong: "됬", correct: "됐", tip: "'되었'의 줄임말은 '됐'" },
  { wrong: "안돼", correct: "안 돼", tip: "'안'과 '돼'는 띄어쓰기" },
  { wrong: "몇일", correct: "며칠", tip: "'며칠'이 올바른 표현" },
];

const AIWritingAssistant = ({ content, selectedEmotions }: AIWritingAssistantProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"suggest" | "correct">("suggest");

  // Get expression suggestions based on selected emotions
  const suggestions = selectedEmotions.flatMap(
    (e) => emotionSuggestions[e] || []
  ).slice(0, 6);

  // Check for spelling issues
  const foundFixes = spellingFixes.filter((f) =>
    content.includes(f.wrong)
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-40"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-body text-sm font-medium text-foreground">AI 작성 도우미</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("suggest")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-body text-xs transition-colors ${
            activeTab === "suggest"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          <Lightbulb className="w-3 h-3" />
          표현 추천
        </button>
        <button
          onClick={() => setActiveTab("correct")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-body text-xs transition-colors ${
            activeTab === "correct"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          <SpellCheck className="w-3 h-3" />
          맞춤법
          {foundFixes.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
              {foundFixes.length}
            </span>
          )}
        </button>
      </div>

      <div className="p-3 max-h-48 overflow-y-auto">
        {activeTab === "suggest" ? (
          <div>
            {suggestions.length > 0 ? (
              <div className="space-y-1.5">
                <p className="font-body text-[10px] text-muted-foreground mb-2">
                  선택한 감정에 어울리는 표현이에요
                </p>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-lg bg-secondary/50 font-body text-xs text-foreground cursor-pointer hover:bg-secondary transition-colors"
                  >
                    "{s}..."
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-xs text-muted-foreground text-center py-4">
                감정 키워드를 선택하면<br/>표현 추천이 표시됩니다
              </p>
            )}
          </div>
        ) : (
          <div>
            {foundFixes.length > 0 ? (
              <div className="space-y-2">
                {foundFixes.map((f, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-body text-xs line-through text-destructive">{f.wrong}</span>
                      <span className="font-body text-xs text-foreground">→</span>
                      <span className="font-body text-xs font-medium text-primary">{f.correct}</span>
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground">{f.tip}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-xs text-muted-foreground text-center py-4">
                {content.length > 0 ? "✅ 맞춤법 오류가 없어요!" : "편지를 작성하면 맞춤법을 확인해드려요"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWritingAssistant;
