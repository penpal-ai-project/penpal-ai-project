import { useState } from "react";
import { ArrowLeft, Send, Lock, Unlock, Hash, Music, StickyNote } from "lucide-react";
import { Link } from "react-router-dom";
import LetterCard from "@/components/LetterCard";
import EmotionBadge from "@/components/EmotionBadge";
import GenderRevealBadge from "@/components/GenderRevealBadge";
import WaitingInteraction from "@/components/WaitingInteraction";
import { getPaperClasses, type PaperStyle } from "@/components/LetterPaperSelector";

const sampleLetters = [
  {
    id: 1, sender: "따뜻한 봄바람", date: "2026년 4월 5일", isReceived: true,
    emotions: ["따뜻함", "감사"], exchangeCount: 4, gender: "female" as const,
    genderReveal: "after3" as const, paperStyle: "warm" as PaperStyle,
    keywords: ["위로", "봄", "감사"], musicRecommendation: { title: "봄날", artist: "BTS" },
    content: `안녕하세요, 처음 편지를 씁니다.\n\n저도 요즘 비슷한 마음이었어요. 일상 속에서 작은 것들에 감사하면서도, 어딘가 허전한 느낌이 들 때가 있잖아요.\n\n오늘 퇴근길에 벚꽃이 흩날리는 걸 보면서, 이 순간을 함께 나눌 수 있는 누군가가 있으면 좋겠다고 생각했어요.`,
  },
  {
    id: 2, sender: "고요한 달빛", date: "2026년 4월 4일", isReceived: true,
    emotions: ["평온함", "그리움"], exchangeCount: 1, gender: "male" as const,
    genderReveal: "after3" as const, paperStyle: "night" as PaperStyle,
    keywords: ["밤", "고독", "산책"], musicRecommendation: { title: "밤편지", artist: "아이유" },
    content: `밤하늘을 올려다보면 마음이 편안해지는 사람이에요.\n\n오늘도 늦은 밤 산책을 하면서 생각이 많아졌어요.`,
  },
  {
    id: 3, sender: "푸른 하늘", date: "2026년 4월 6일", isReceived: true,
    emotions: ["기쁨", "따뜻함"], exchangeCount: 2, gender: "female" as const,
    genderReveal: "immediate" as const, paperStyle: "handwritten" as PaperStyle,
    keywords: ["기쁨", "일상", "음악"], musicRecommendation: { title: "좋은 날", artist: "아이유" },
    content: `오늘 정말 좋은 하루였어요!\n\n작은 카페에서 좋아하는 음악을 들으면서 편지를 쓰고 있어요.`,
  },
  {
    id: 4, sender: "나", date: "2026년 4월 3일", isReceived: false,
    emotions: ["그리움", "평온함"], exchangeCount: 0, gender: undefined,
    genderReveal: "after3" as const, paperStyle: "default" as PaperStyle,
    keywords: ["그리움", "카페", "시간"], musicRecommendation: undefined,
    content: `오늘은 유난히 고요한 하루였어요.\n\n카페에 앉아서 창밖을 바라보는데, 문득 예전 생각이 났습니다.`,
  },
];

const Letters = () => {
  const [selectedLetter, setSelectedLetter] = useState<typeof sampleLetters[0] | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [memos, setMemos] = useState<Record<number, string>>({});
  const [showMemoInput, setShowMemoInput] = useState(false);

  if (selectedLetter) {
    return (
      <LetterDetail
        letter={selectedLetter}
        replyContent={replyContent}
        setReplyContent={setReplyContent}
        memos={memos}
        setMemos={setMemos}
        showMemoInput={showMemoInput}
        setShowMemoInput={setShowMemoInput}
        onBack={() => { setSelectedLetter(null); setShowMemoInput(false); }}
      />
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">편지함</h1>
        <p className="font-body text-muted-foreground mb-8">마음이 오고 간 기록들 · 최대 3명</p>

        {/* Waiting interaction */}
        <div className="mb-8">
          <WaitingInteraction />
        </div>

        <div className="space-y-4">
          {sampleLetters.map((letter) => {
            const revealThreshold = letter.genderReveal === "immediate" ? 0 : 3;
            return (
              <div key={letter.id} className="relative">
                <LetterCard
                  sender={letter.sender}
                  date={letter.date}
                  preview={letter.content.slice(0, 80) + "..."}
                  emotions={letter.emotions}
                  isReceived={letter.isReceived}
                  onClick={() => setSelectedLetter(letter)}
                />
                {letter.isReceived && (
                  <div className="absolute top-4 right-4">
                    <GenderRevealBadge exchangeCount={letter.exchangeCount} gender={letter.gender} revealThreshold={revealThreshold} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/write" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-body text-sm transition-colors">
            새로운 편지를 써보세요 →
          </Link>
        </div>
      </div>
    </div>
  );
};

// Extracted letter detail component
function LetterDetail({
  letter, replyContent, setReplyContent, memos, setMemos, showMemoInput, setShowMemoInput, onBack,
}: {
  letter: typeof sampleLetters[0];
  replyContent: string;
  setReplyContent: (v: string) => void;
  memos: Record<number, string>;
  setMemos: (v: Record<number, string>) => void;
  showMemoInput: boolean;
  setShowMemoInput: (v: boolean) => void;
  onBack: () => void;
}) {
  const paperClasses = getPaperClasses(letter.paperStyle);
  const revealThreshold = letter.genderReveal === "immediate" ? 0 : 3;
  const isRevealed = letter.exchangeCount >= revealThreshold;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 편지함으로 돌아가기
        </button>

        {letter.isReceived && (
          <div className="flex items-center justify-between mb-4">
            <span className="font-body text-sm font-medium text-foreground">{letter.sender}님의 편지</span>
            <GenderRevealBadge exchangeCount={letter.exchangeCount} gender={letter.gender} revealThreshold={revealThreshold} />
          </div>
        )}

        {letter.isReceived && letter.exchangeCount === revealThreshold && revealThreshold > 0 && (
          <div className="bg-accent/10 rounded-xl p-4 border border-accent/20 mb-4" style={{ animation: "fadeInUp 0.6s ease-out forwards" }}>
            <div className="flex items-center gap-2 mb-1">
              <Unlock className="w-4 h-4 text-accent" />
              <p className="font-body text-sm font-medium text-accent">성별이 공개되었어요!</p>
            </div>
            <p className="font-body text-xs text-muted-foreground">{revealThreshold}회 편지 교환을 통해 마음의 연결이 충분히 이루어졌어요.</p>
          </div>
        )}

        {letter.isReceived && letter.keywords && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
            {letter.keywords.map((kw, i) => (
              <span key={kw} className={`px-2 py-0.5 rounded-full font-body text-xs ${i < letter.exchangeCount ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/40"}`}>
                {i < letter.exchangeCount ? `#${kw}` : "???"}
              </span>
            ))}
            <span className="font-body text-[10px] text-muted-foreground">(교환할수록 키워드가 공개돼요)</span>
          </div>
        )}

        <div className={`rounded-2xl p-8 border shadow-sm mb-4 ${paperClasses.paper}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-body text-xs opacity-60 ${paperClasses.text}`}>{letter.isReceived ? `${letter.sender}님의 편지` : "내가 쓴 편지"}</span>
            <span className={`font-body text-xs opacity-60 ${paperClasses.text}`}>{letter.date}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">{letter.emotions.map((e) => <EmotionBadge key={e} emotion={e} />)}</div>
          <div className={`${paperClasses.font} ${paperClasses.text} leading-[32px] whitespace-pre-line`}>{letter.content}</div>
        </div>

        {letter.musicRecommendation && (
          <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3 mb-4">
            <Music className="w-4 h-4 text-accent shrink-0" />
            <div>
              <p className="font-body text-xs text-muted-foreground">이 편지에 어울리는 음악</p>
              <p className="font-body text-sm font-medium text-foreground">{letter.musicRecommendation.title} - {letter.musicRecommendation.artist}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <button onClick={() => setShowMemoInput(!showMemoInput)} className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
            <StickyNote className="w-3.5 h-3.5" />
            {memos[letter.id] ? "메모 수정" : "개인 메모 추가"}
          </button>
          {showMemoInput && (
            <textarea
              value={memos[letter.id] || ""}
              onChange={(e) => setMemos({ ...memos, [letter.id]: e.target.value })}
              placeholder="이 편지에 대한 개인 메모를 남겨보세요..."
              className="w-full mt-2 px-3 py-2 rounded-lg border border-input bg-background font-body text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px] resize-none"
            />
          )}
          {memos[letter.id] && !showMemoInput && <p className="font-body text-xs text-muted-foreground mt-1 italic">📝 {memos[letter.id]}</p>}
        </div>

        {letter.isReceived && !isRevealed && revealThreshold > 0 && (
          <div className="bg-secondary/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="font-body text-xs font-medium text-foreground">점진적 정보 공개</p>
            </div>
            <p className="font-body text-xs text-muted-foreground mb-2">편지를 {revealThreshold - letter.exchangeCount}회 더 주고받으면 상대방의 성별이 공개됩니다.</p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(letter.exchangeCount / revealThreshold) * 100}%` }} />
            </div>
          </div>
        )}

        {letter.isReceived && (
          <div>
            <h3 className="font-letter text-lg font-bold mb-4">답장을 쓰다</h3>
            <div className="letter-paper rounded-2xl p-8 border border-border shadow-sm mb-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="따뜻한 마음을 담아 답장을 적어보세요..."
                className="w-full min-h-[200px] bg-transparent font-letter text-foreground leading-[32px] resize-none focus:outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <button disabled={replyContent.trim().length < 10} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-body font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
              <Send className="w-5 h-5" /> 답장 보내기
            </button>
            <p className="font-body text-xs text-muted-foreground text-center mt-3">답장은 24시간 후에 상대방에게 전달됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Letters;
