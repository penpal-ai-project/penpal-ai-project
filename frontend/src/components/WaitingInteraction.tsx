import { useState, useEffect } from "react";
import { Clock, Music, Eye, Sparkles } from "lucide-react";
import EmotionBadge from "./EmotionBadge";

const emotions = ["따뜻함", "평온함", "기쁨", "슬픔", "불안", "그리움", "감사", "외로움"];

interface IncomingLetter {
  sender: string;
  keywords: string[];
  arrivalProgress: number; // 0-100
  musicRecommendation?: { title: string; artist: string };
}

const mockIncoming: IncomingLetter = {
  sender: "따뜻한 봄바람",
  keywords: ["위로", "봄", "감사", "산책"],
  arrivalProgress: 65,
  musicRecommendation: { title: "봄날", artist: "BTS" },
};

const WaitingInteraction = () => {
  const [myEmotions, setMyEmotions] = useState<string[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);

  // Simulate keyword reveal over time
  useEffect(() => {
    const progress = mockIncoming.arrivalProgress;
    const total = mockIncoming.keywords.length;
    setRevealedCount(Math.floor((progress / 100) * total));
  }, []);

  return (
    <div className="space-y-4">
      {/* Incoming letter preview */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-accent animate-pulse" />
          <span className="font-body text-sm font-medium text-foreground">
            {mockIncoming.sender}님의 편지가 오고 있어요
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="font-body text-[10px] text-muted-foreground">전달 중...</span>
            <span className="font-body text-[10px] text-muted-foreground">{mockIncoming.arrivalProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${mockIncoming.arrivalProgress}%` }}
            />
          </div>
        </div>

        {/* Gradual keyword reveal */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-body text-xs text-muted-foreground">감정 키워드 미리보기</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mockIncoming.keywords.map((kw, i) => (
              <span
                key={kw}
                className={`px-2.5 py-1 rounded-full font-body text-xs transition-all duration-500 ${
                  i < revealedCount
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground/30"
                }`}
              >
                {i < revealedCount ? `#${kw}` : "???"}
              </span>
            ))}
          </div>
          <p className="font-body text-[10px] text-muted-foreground mt-1.5">
            시간이 지날수록 키워드가 하나씩 공개됩니다
          </p>
        </div>

        {/* Music recommendation */}
        {mockIncoming.musicRecommendation && revealedCount >= 2 && (
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2.5 mt-3" style={{ animation: "fadeInUp 0.4s ease-out" }}>
            <Music className="w-4 h-4 text-accent shrink-0" />
            <div>
              <p className="font-body text-[10px] text-muted-foreground">이 편지에 어울리는 음악</p>
              <p className="font-body text-xs font-medium text-foreground">
                {mockIncoming.musicRecommendation.title} - {mockIncoming.musicRecommendation.artist}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingInteraction;
