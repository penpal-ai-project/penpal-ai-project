import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Sparkles, Shield, Upload, X, PenTool } from "lucide-react";

type Gender = "male" | "female";
type MatchPref = "any" | "male" | "female";

const Signup = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [matchPref, setMatchPref] = useState<MatchPref>("any");
  const [handwritingSample, setHandwritingSample] = useState<string | null>(null);

  // Gender reveal logic: specific gender = immediate, "any" = after 3 exchanges
  const genderReveal = matchPref === "any" ? "after3" : "immediate";

  const isValid = nickname.trim().length >= 2 && gender !== null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setHandwritingSample(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    localStorage.setItem(
      "maeum-user",
      JSON.stringify({ nickname, gender, matchPref, genderReveal, handwritingSample: !!handwritingSample })
    );
    navigate("/write");
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">마음편지에 오신 걸 환영해요</h1>
          <p className="font-body text-muted-foreground text-sm">
            간단한 정보만 입력하면 바로 시작할 수 있어요
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm space-y-6">
          {/* Nickname */}
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              닉네임 <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="편지에 사용될 닉네임을 입력하세요"
              maxLength={12}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
            <p className="font-body text-xs text-muted-foreground mt-1.5">
              2~12자, 중복 불가, 상대방에게 보여지는 이름이에요
            </p>
          </div>

          {/* Gender */}
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              성별 <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "male" as Gender, label: "남성", emoji: "👨" },
                { value: "female" as Gender, label: "여성", emoji: "👩" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-body text-sm transition-all duration-200 ${
                    gender === opt.value
                      ? "border-primary bg-primary/10 text-primary font-medium ring-2 ring-primary/20"
                      : "border-input bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Match Preference — drives gender reveal policy */}
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              매칭 선호 성별
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "any" as MatchPref, label: "상관없음" },
                { value: "male" as MatchPref, label: "남성만" },
                { value: "female" as MatchPref, label: "여성만" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMatchPref(opt.value)}
                  className={`px-3 py-2.5 rounded-xl border font-body text-xs transition-all duration-200 ${
                    matchPref === opt.value
                      ? "border-primary bg-primary/10 text-primary font-medium ring-2 ring-primary/20"
                      : "border-input bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="font-body text-xs text-muted-foreground mt-1.5">
              {matchPref === "any"
                ? "🔒 \"상관없음\" 선택 시, 성별은 편지 3회 교환 후 공개됩니다"
                : "🔓 특정 성별 선택 시, 매칭 즉시 성별이 공개됩니다"}
            </p>
          </div>

          {/* Handwriting Sample Upload */}
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              <PenTool className="w-4 h-4 inline mr-1" />
              손글씨 샘플 업로드 <span className="text-muted-foreground text-xs">(선택)</span>
            </label>
            {handwritingSample ? (
              <div className="relative rounded-xl border border-primary/30 bg-primary/5 p-3">
                <img src={handwritingSample} alt="손글씨 샘플" className="w-full h-24 object-contain rounded-lg" />
                <button
                  onClick={() => setHandwritingSample(null)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="font-body text-xs text-primary mt-2 text-center">
                  ✨ AI가 손글씨 스타일을 분석하여 편지에 반영합니다
                </p>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-input bg-background hover:border-primary/40 cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground text-center">
                  손글씨 이미지를 업로드하면<br/>AI가 글씨체를 분석해 편지에 반영해요
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Privacy Note */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">익명성이 보장됩니다</span>
                <br />
                성별 공개 방식은 매칭 선호에 따라 자동 결정됩니다.
                외형이나 조건이 아닌, 감정으로 먼저 연결되는 경험을 만들어갑니다.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-body font-medium text-base mt-6 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-5 h-5" />
          시작하기
        </button>
      </div>
    </div>
  );
};

export default Signup;
