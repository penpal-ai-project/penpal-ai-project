import { Link } from "react-router-dom";
import { Mail, Heart, Users, Clock, ArrowRight, Sparkles, Lock, Eye, UserPlus, Brain, Hash, Music, BarChart3 } from "lucide-react";
import heroImage from "@/assets/hero-letters.jpg";
import { useNavigate } from "react-router-dom";


const features = [
  {
    icon: Heart,
    title: "감정으로 연결되다",
    description: "당신의 글 속 감정을 AI가 분석하고, 비슷한 마음을 가진 누군가와 연결해 드립니다.",
  },
  {
    icon: Lock,
    title: "익명으로 시작하다",
    description: "성별, 나이, 외모 모두 비공개. 오직 마음만으로 먼저 연결됩니다.",
  },
  {
    icon: Clock,
    title: "느리지만 깊은 소통",
    description: "채팅이 아닌 편지. 답장까지 기다리는 시간이 관계를 더 깊게 만듭니다.",
  },
  {
    icon: Users,
    title: "최대 3명과 연결",
    description: "1:1 매칭 기반으로 최대 3명까지 동시에 편지를 주고받을 수 있어요.",
  },
];

const steps = [
  { step: "01", title: "간단한 가입", description: "닉네임, 성별, 성별 공개 방식을 설정하세요.", icon: UserPlus },
  { step: "02", title: "나에게 편지 쓰기", description: "오늘의 감정을 자유롭게 편지로 적어보세요.", icon: Mail },
  { step: "03", title: "AI 분석 & 매칭", description: "감정 분석, 키워드 추출, 벡터화로 최적의 상대를 찾아요.", icon: Brain },
  { step: "04", title: "편지 교환 & 성장", description: "편지를 주고받으며 키워드와 성별이 점진적으로 공개돼요.", icon: Heart },
];

const Index = () => {
  const navigate = useNavigate();
  
  const handleStart = () => {
    const user = localStorage.getItem("maeum-user");
    if (user) {
      navigate("/letters");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 pt-20">
          <div className="flex-1 text-center lg:text-left">
            <p className="font-body text-sm tracking-widest text-accent uppercase mb-4 animate-fade-in-up">
              AI 기반 감정 교류 펜팔 서비스
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ animationDelay: "0.1s", animation: "fadeInUp 0.6s ease-out forwards" }}>
              느린 편지로
              <br />
              <span className="text-gradient">마음을 잇다</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8" style={{ animationDelay: "0.2s", animation: "fadeInUp 0.6s ease-out 0.2s forwards", opacity: 0 }}>
              외형이 아닌 감정으로 연결되는 새로운 관계.
              <br />
              AI가 당신의 마음을 분석하고 맞는 사람을 찾아드려요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" style={{ animationDelay: "0.3s", animation: "fadeInUp 0.6s ease-out 0.3s forwards", opacity: 0 }}>
              
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-body font-medium text-base hover:opacity-90 transition-opacity"
              >
                <Mail className="w-5 h-5" />
                시작하기
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-body font-medium text-base hover:bg-secondary/80 transition-colors"
              >
                어떻게 작동하나요?
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src={heroImage}
              alt="감성적인 편지 일러스트"
              className="w-full max-w-lg animate-float rounded-2xl"
              width={1280}
              height={720}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            마음편지가 특별한 이유
          </h2>
          <p className="font-body text-muted-foreground text-center mb-16 max-w-md mx-auto">
            조건이 아닌 감정으로, 빠름이 아닌 깊이로
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.1 * i}s forwards`, opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            이렇게 연결됩니다
          </h2>
          <p className="font-body text-muted-foreground text-center mb-16 max-w-md mx-auto">
            가입부터 관계 형성까지, 자연스러운 흐름
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ step, title, description, icon: Icon }, i) => (
              <div key={step} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-letter text-5xl font-bold text-primary/10">{step}</span>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mt-2 mb-3">{title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-primary/20">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Analysis Preview */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI가 당신의 마음을 읽어요
            </h2>
            <p className="font-body text-muted-foreground max-w-md mx-auto">
              편지를 쓰면 AI가 감정·키워드·성향을 분석하여 최적의 상대를 찾아줍니다
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "감정 분석", desc: "편지 속 감정 톤을 파악하여 따뜻함, 그리움, 기쁨 등을 분류합니다." },
              { icon: Hash, title: "키워드 추출", desc: "글에서 핵심 키워드를 추출하여 관심사와 성향을 파악합니다." },
              { icon: BarChart3, title: "벡터 매칭", desc: "감정과 키워드를 벡터화하여 가장 비슷한 마음의 사람을 매칭합니다." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="bg-card rounded-2xl p-6 border border-border text-center"
                style={{ animation: `fadeInUp 0.6s ease-out ${0.1 * i}s forwards`, opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gradual Reveal & Retention */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              마음이 먼저, 정보는 천천히
            </h2>
            <p className="font-body text-muted-foreground max-w-md mx-auto">
              점진적 정보 공개로 진정한 감정 연결을 경험하세요
            </p>
          </div>
          <div className="space-y-6">
            {[
              { round: "1~2회", status: "성별 비공개", desc: "오직 감정과 편지 내용만으로 소통합니다", icon: Lock, active: false },
              { round: "3회~", status: "성별 공개", desc: "충분한 교류 후 상대방의 정보가 단계적으로 공개됩니다", icon: Eye, active: true },
              { round: "계속", status: "감정 기록 공유 & 음악 추천", desc: "감정 변화를 함께 보고, 편지에 어울리는 음악도 추천받으세요", icon: Music, active: true },
            ].map(({ round, status, desc, icon: Icon, active }, i) => (
              <div
                key={round}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                  active ? "bg-card border-primary/20" : "bg-secondary/30 border-border"
                }`}
                style={{ animation: `fadeInUp 0.6s ease-out ${0.15 * i}s forwards`, opacity: 0 }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  active ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-body text-xs text-accent font-medium">{round}</span>
                    <span className="font-body text-sm font-medium text-foreground">{status}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            오늘의 마음을 전해보세요
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            당신의 감정을 기다리는 누군가가 있습니다
          </p>
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-body font-medium text-lg hover:opacity-90 transition-opacity"
          >
            <Mail className="w-5 h-5" />
            시작하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="font-letter text-lg font-bold text-foreground mb-2">마음편지</p>
          <p className="font-body text-sm text-muted-foreground">
            느린 편지로 마음을 잇는 서비스 © 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
