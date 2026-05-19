import { useState } from "react";
import { ArrowLeft, User, Send, StickyNote, Music, Lock, Unlock, Hash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LetterCard from "@/components/LetterCard";
import EmotionBadge from "@/components/EmotionBadge";
import GenderRevealBadge from "@/components/GenderRevealBadge";
import WaitingInteraction from "@/components/WaitingInteraction";
import { getPaperClasses, type PaperStyle } from "@/components/LetterPaperSelector";

interface PenpalLetter {
  id: number;
  date: string;
  content: string;
  isReceived: boolean;
  emotions: string[];
  keywords: string[];
  paperStyle: PaperStyle;
  music?: { title: string; artist: string };
}

interface PenpalProfile {
  id: number;
  nickname: string;
  gender?: "male" | "female";
  genderReveal: "immediate" | "after3";
  exchangeCount: number;
  sharedEmotions: string[];
  letters: PenpalLetter[];
  memo: string;
}

const mockPenpals: PenpalProfile[] = [
  {
    id: 1,
    nickname: "따뜻한 봄바람",
    gender: "female",
    genderReveal: "after3",
    exchangeCount: 4,
    sharedEmotions: ["따뜻함", "감사"],
    letters: [
      { id: 101, date: "2026년 4월 7일", isReceived: true, emotions: ["따뜻함"], keywords: ["봄", "벚꽃", "감사"], paperStyle: "warm", music: { title: "봄날", artist: "BTS" }, content: "안녕하세요, 오늘 퇴근길에 벚꽃이 흩날리는 걸 보면서 당신 생각이 났어요.\n\n따뜻한 봄날처럼 마음이 포근해지는 편지를 전하고 싶었어요." },
      { id: 102, date: "2026년 4월 5일", isReceived: false, emotions: ["감사"], keywords: ["위로", "감사"], paperStyle: "default", content: "답장을 읽고 마음이 따뜻해졌어요.\n\n이렇게 마음이 통하는 사람이 있다는 게 참 감사해요." },
      { id: 103, date: "2026년 4월 3일", isReceived: true, emotions: ["따뜻함", "감사"], keywords: ["시작", "설렘"], paperStyle: "warm", content: "처음 편지를 써봅니다. 저도 비슷한 마음이었어요.\n\n일상 속에서 작은 것들에 감사하면서도 어딘가 허전한 느낌이 들 때가 있잖아요." },
      { id: 104, date: "2026년 4월 1일", isReceived: false, emotions: ["그리움"], keywords: ["그리움", "카페"], paperStyle: "default", content: "고요한 하루, 누군가에게 마음을 전하고 싶었어요.\n\n카페에 앉아 창밖을 바라보다 이 편지를 씁니다." },
    ],
    memo: "봄을 좋아하는 사람. 따뜻한 말투가 인상적",
  },
  {
    id: 2,
    nickname: "고요한 달빛",
    gender: "male",
    genderReveal: "after3",
    exchangeCount: 1,
    sharedEmotions: ["평온함", "그리움"],
    letters: [
      { id: 201, date: "2026년 4월 4일", isReceived: true, emotions: ["평온함"], keywords: ["밤", "고독", "산책"], paperStyle: "night", content: "밤하늘을 올려다보면 마음이 편안해지는 사람이에요.\n\n오늘도 늦은 밤 산책을 하면서 생각이 많아졌어요." },
    ],
    memo: "",
  },
  {
    id: 3,
    nickname: "푸른 하늘",
    gender: "female",
    genderReveal: "immediate",
    exchangeCount: 2,
    sharedEmotions: ["기쁨", "따뜻함"],
    letters: [
      { id: 301, date: "2026년 4월 6일", isReceived: true, emotions: ["기쁨"], keywords: ["기쁨", "음악", "카페"], paperStyle: "handwritten", music: { title: "좋은 날", artist: "아이유" }, content: "오늘 정말 좋은 하루였어요!\n\n작은 카페에서 좋아하는 음악을 들으면서 편지를 쓰고 있어요." },
      { id: 302, date: "2026년 4월 5일", isReceived: false, emotions: ["기쁨"], keywords: ["음악", "공감"], paperStyle: "default", content: "음악을 좋아한다니 반가워요! 저는 요즘 잔잔한 음악에 빠져 있어요." },
    ],
    memo: "음악 취향이 비슷함",
  },
];

const Letters = () => {
  const navigate = useNavigate();
  const [selectedPenpal, setSelectedPenpal] = useState<PenpalProfile | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<PenpalLetter | null>(null);
  const [memos, setMemos] = useState<Record<number, string>>(
    Object.fromEntries(mockPenpals.map((p) => [p.id, p.memo]))
  );
  const [editingMemo, setEditingMemo] = useState(false);
  const [showMemoInput, setShowMemoInput] = useState(false);
  const [letterMemos, setLetterMemos] = useState<Record<number, string>>({});

  // 3단계: 편지 상세
  if (selectedLetter && selectedPenpal) {
    const paperClasses = getPaperClasses(selectedLetter.paperStyle);
    const revealThreshold = selectedPenpal.genderReveal === "immediate" ? 0 : 3;
    const isRevealed = selectedPenpal.exchangeCount >= revealThreshold;
    const mostRecentLetterId = selectedPenpal.letters.filter((l) => l.isReceived)[0]?.id;

    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <button
            onClick={() => { setSelectedLetter(null); setShowMemoInput(false); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {selectedPenpal.nickname}님과의 편지함으로
          </button>

          {selectedLetter.isReceived && (
            <div className="flex items-center justify-between mb-4">
              <span className="font-body text-sm font-medium text-foreground">{selectedPenpal.nickname}님의 편지</span>
              <GenderRevealBadge exchangeCount={selectedPenpal.exchangeCount} gender={selectedPenpal.gender} revealThreshold={revealThreshold} />
            </div>
          )}

          {selectedLetter.isReceived && selectedPenpal.exchangeCount === revealThreshold && revealThreshold > 0 && (
            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Unlock className="w-4 h-4 text-accent" />
                <p className="font-body text-sm font-medium text-accent">성별이 공개되었어요!</p>
              </div>
              <p className="font-body text-xs text-muted-foreground">{revealThreshold}회 편지 교환을 통해 마음의 연결이 충분히 이루어졌어요.</p>
            </div>
          )}

          {selectedLetter.isReceived && selectedLetter.keywords && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Hash className="w-3.5 h-3.5 text-muted-foreground" />
              {selectedLetter.keywords.map((kw, i) => (
                <span key={kw} className={`px-2 py-0.5 rounded-full font-body text-xs ${i < selectedPenpal.exchangeCount ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/40"}`}>
                  {i < selectedPenpal.exchangeCount ? `#${kw}` : "???"}
                </span>
              ))}
              <span className="font-body text-[10px] text-muted-foreground">(교환할수록 키워드가 공개돼요)</span>
            </div>
          )}

          <div className={`rounded-2xl p-8 border shadow-sm mb-4 ${paperClasses.paper}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-body text-xs opacity-60 ${paperClasses.text}`}>{selectedLetter.isReceived ? `${selectedPenpal.nickname}님의 편지` : "내가 쓴 편지"}</span>
              <span className={`font-body text-xs opacity-60 ${paperClasses.text}`}>{selectedLetter.date}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">{selectedLetter.emotions.map((e) => <EmotionBadge key={e} emotion={e} />)}</div>
            <div className={`${paperClasses.font} ${paperClasses.text} leading-[32px] whitespace-pre-line`}>{selectedLetter.content}</div>
          </div>

          {selectedLetter.music && (
            <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3 mb-4">
              <Music className="w-4 h-4 text-accent shrink-0" />
              <div>
                <p className="font-body text-xs text-muted-foreground">이 편지에 어울리는 음악</p>
                <p className="font-body text-sm font-medium text-foreground">{selectedLetter.music.title} - {selectedLetter.music.artist}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <button onClick={() => setShowMemoInput(!showMemoInput)} className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
              <StickyNote className="w-3.5 h-3.5" />
              {letterMemos[selectedLetter.id] ? "메모 수정" : "개인 메모 추가"}
            </button>
            {showMemoInput && (
              <textarea
                value={letterMemos[selectedLetter.id] || ""}
                onChange={(e) => setLetterMemos({ ...letterMemos, [selectedLetter.id]: e.target.value })}
                placeholder="이 편지에 대한 개인 메모를 남겨보세요..."
                className="w-full mt-2 px-3 py-2 rounded-lg border border-input bg-background font-body text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px] resize-none"
              />
            )}
            {letterMemos[selectedLetter.id] && !showMemoInput && (
              <p className="font-body text-xs text-muted-foreground mt-1 italic">📝 {letterMemos[selectedLetter.id]}</p>
            )}
          </div>

          {selectedLetter.isReceived && !isRevealed && revealThreshold > 0 && (
            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <p className="font-body text-xs font-medium text-foreground">점진적 정보 공개</p>
              </div>
              <p className="font-body text-xs text-muted-foreground mb-2">편지를 {revealThreshold - selectedPenpal.exchangeCount}회 더 주고받으면 상대방의 성별이 공개됩니다.</p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(selectedPenpal.exchangeCount / revealThreshold) * 100}%` }} />
              </div>
            </div>
          )}

          {selectedLetter.id === mostRecentLetterId && (
            <button
              onClick={() => navigate("/write", { state: { receiverId: selectedPenpal.id } })}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-body font-medium hover:opacity-90 transition-opacity"
            >
              <Send className="w-5 h-5" /> 답장 쓰기
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2단계: 특정 펜팔과의 편지 목록
  if (selectedPenpal) {
    const revealThreshold = selectedPenpal.genderReveal === "immediate" ? 0 : 3;

    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <button
            onClick={() => { setSelectedPenpal(null); setEditingMemo(false); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 편지함으로 돌아가기
          </button>

          {/* 펜팔 프로필 카드 */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedPenpal.nickname}</h2>
                  <p className="font-body text-xs text-muted-foreground">편지 {selectedPenpal.exchangeCount}회 교환</p>
                </div>
              </div>
              <GenderRevealBadge exchangeCount={selectedPenpal.exchangeCount} gender={selectedPenpal.gender} revealThreshold={revealThreshold} />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedPenpal.sharedEmotions.map((e) => <EmotionBadge key={e} emotion={e} />)}
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-body text-xs font-medium text-foreground">개인 메모</span>
                </div>
                <button onClick={() => setEditingMemo(!editingMemo)} className="font-body text-[10px] text-accent hover:text-accent/80 transition-colors">
                  {editingMemo ? "저장" : "수정"}
                </button>
              </div>
              {editingMemo ? (
                <textarea
                  value={memos[selectedPenpal.id] || ""}
                  onChange={(e) => setMemos({ ...memos, [selectedPenpal.id]: e.target.value })}
                  placeholder="이 상대에 대한 메모를 남겨보세요..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[60px] resize-none"
                />
              ) : (
                <p className="font-body text-xs text-muted-foreground">{memos[selectedPenpal.id] || "메모가 없습니다"}</p>
              )}
            </div>
          </div>

          {/* 편지 목록 */}
          <h3 className="text-lg font-bold mb-4">주고받은 편지</h3>
          <div className="space-y-4">
            {selectedPenpal.letters.filter((l) => l.isReceived).map((letter) => (
              <div key={letter.id} className="relative">
                <LetterCard
                  sender={letter.isReceived ? selectedPenpal.nickname : "나"}
                  date={letter.date}
                  preview={letter.content.slice(0, 80) + "..."}
                  emotions={letter.emotions}
                  isReceived={letter.isReceived}
                  onClick={() => setSelectedLetter(letter)}
                />
                {letter.isReceived && (
                  <div className="absolute top-4 right-4">
                    <GenderRevealBadge exchangeCount={selectedPenpal.exchangeCount} gender={selectedPenpal.gender} revealThreshold={revealThreshold} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 1단계: 펜팔 목록
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">편지함</h1>
        <p className="font-body text-muted-foreground mb-8">편지를 주고받는 사람들 · 최대 3명</p>

        <div className="mb-8">
          <WaitingInteraction />
        </div>

        <div className="space-y-4">
          {mockPenpals.map((penpal) => {
            const revealThreshold = penpal.genderReveal === "immediate" ? 0 : 3;
            return (
              <button
                key={penpal.id}
                onClick={() => setSelectedPenpal(penpal)}
                className="w-full text-left bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{penpal.nickname}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        편지 {penpal.exchangeCount}회 · {penpal.letters.length}통
                      </p>
                    </div>
                  </div>
                  <GenderRevealBadge exchangeCount={penpal.exchangeCount} gender={penpal.gender} revealThreshold={revealThreshold} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {penpal.sharedEmotions.map((e) => <EmotionBadge key={e} emotion={e} />)}
                </div>
                {memos[penpal.id] && (
                  <p className="font-body text-xs text-muted-foreground mt-2 italic">📝 {memos[penpal.id]}</p>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/write" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-body text-sm transition-colors">
            새 편지를 쓰면 AI가 새로운 상대를 추천해요 →
          </Link>
          <p className="font-body text-[10px] text-muted-foreground mt-2">최대 3명까지 편지를 주고받을 수 있어요</p>
        </div>
      </div>
    </div>
  );
};

export default Letters;
