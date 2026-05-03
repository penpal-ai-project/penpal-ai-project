import { useState } from "react";
import { ArrowLeft, User, Mail, StickyNote, Lock, Unlock, Music } from "lucide-react";
import { Link } from "react-router-dom";
import EmotionBadge from "@/components/EmotionBadge";
import GenderRevealBadge from "@/components/GenderRevealBadge";

interface PenpalProfile {
  id: number;
  nickname: string;
  gender?: "male" | "female";
  genderReveal: "immediate" | "after3";
  exchangeCount: number;
  sharedEmotions: string[];
  letters: { date: string; snippet: string; isReceived: boolean; emotions: string[]; music?: { title: string; artist: string } }[];
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
      { date: "4월 7일", snippet: "오늘 퇴근길에 벚꽃이 흩날리는 걸 보면서...", isReceived: true, emotions: ["따뜻함"], music: { title: "봄날", artist: "BTS" } },
      { date: "4월 5일", snippet: "답장을 읽고 마음이 따뜻해졌어요...", isReceived: false, emotions: ["감사"] },
      { date: "4월 3일", snippet: "처음 편지를 써봅니다. 저도 비슷한 마음이었어요...", isReceived: true, emotions: ["따뜻함", "감사"] },
      { date: "4월 1일", snippet: "고요한 하루, 누군가에게 마음을 전하고 싶었어요...", isReceived: false, emotions: ["그리움"] },
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
      { date: "4월 4일", snippet: "밤하늘을 올려다보면 마음이 편안해지는 사람이에요...", isReceived: true, emotions: ["평온함"] },
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
      { date: "4월 6일", snippet: "오늘 정말 좋은 하루였어요! 작은 카페에서...", isReceived: true, emotions: ["기쁨"], music: { title: "좋은 날", artist: "아이유" } },
      { date: "4월 5일", snippet: "음악을 좋아한다니 반가워요! 저는 요즘...", isReceived: false, emotions: ["기쁨"] },
    ],
    memo: "음악 취향이 비슷함",
  },
];

const Profile = () => {
  const [selectedPenpal, setSelectedPenpal] = useState<PenpalProfile | null>(null);
  const [memos, setMemos] = useState<Record<number, string>>(
    Object.fromEntries(mockPenpals.map((p) => [p.id, p.memo]))
  );
  const [editingMemo, setEditingMemo] = useState(false);

  if (selectedPenpal) {
    const revealThreshold = selectedPenpal.genderReveal === "immediate" ? 0 : 3;
    const isRevealed = selectedPenpal.exchangeCount >= revealThreshold;

    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <button
            onClick={() => { setSelectedPenpal(null); setEditingMemo(false); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 프로필 목록으로
          </button>

          {/* Profile header */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedPenpal.nickname}</h2>
                  <p className="font-body text-xs text-muted-foreground">
                    편지 {selectedPenpal.exchangeCount}회 교환
                  </p>
                </div>
              </div>
              <GenderRevealBadge
                exchangeCount={selectedPenpal.exchangeCount}
                gender={selectedPenpal.gender}
                revealThreshold={revealThreshold}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedPenpal.sharedEmotions.map((e) => (
                <EmotionBadge key={e} emotion={e} />
              ))}
            </div>

            {/* Personal memo */}
            <div className="bg-secondary/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-body text-xs font-medium text-foreground">개인 메모</span>
                </div>
                <button
                  onClick={() => setEditingMemo(!editingMemo)}
                  className="font-body text-[10px] text-accent hover:text-accent/80 transition-colors"
                >
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
                <p className="font-body text-xs text-muted-foreground">
                  {memos[selectedPenpal.id] || "메모가 없습니다"}
                </p>
              )}
            </div>
          </div>

          {/* Letter history */}
          <h3 className="text-lg font-bold mb-4">주고받은 편지</h3>
          <div className="space-y-3">
            {selectedPenpal.letters.map((letter, i) => (
              <div key={i} className={`relative pl-6 border-l-2 ${letter.isReceived ? "border-primary/50" : "border-accent/50"}`}>
                <div className={`absolute -left-[5px] top-3 w-2 h-2 rounded-full ${letter.isReceived ? "bg-primary" : "bg-accent"}`} />
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {letter.isReceived ? "받은 편지" : "보낸 편지"}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">{letter.date}</span>
                    </div>
                    <div className="flex gap-1">
                      {letter.emotions.map((e) => <EmotionBadge key={e} emotion={e} />)}
                    </div>
                  </div>
                  <p className="font-letter text-sm text-foreground">{letter.snippet}</p>
                  {letter.music && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Music className="w-3 h-3 text-accent" />
                      <span className="font-body text-[10px] text-muted-foreground">
                        {letter.music.title} - {letter.music.artist}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">프로필</h1>
        <p className="font-body text-muted-foreground mb-8">편지를 주고받는 사람들</p>

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
                  <GenderRevealBadge
                    exchangeCount={penpal.exchangeCount}
                    gender={penpal.gender}
                    revealThreshold={revealThreshold}
                  />
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
          <Link
            to="/write"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-body text-sm transition-colors"
          >
            새 편지를 쓰면 AI가 새로운 상대를 추천해요 →
          </Link>
          <p className="font-body text-[10px] text-muted-foreground mt-2">
            최대 3명까지 편지를 주고받을 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
