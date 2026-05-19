import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, BookOpen, Heart, Home } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: "홈", icon: Home, requireAuth: false },
    { path: "/write", label: "편지 쓰기", icon: Mail, requireAuth: true },
    { path: "/letters", label: "편지함", icon: BookOpen, requireAuth: true },
    { path: "/archive", label: "감정 기록", icon: Heart, requireAuth: true },
  ];

  const handleNavClick = (path: string, requireAuth: boolean) => {
    if (requireAuth && !localStorage.getItem("maeum-user")) {
      navigate("/signup");
      return;
    }
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-letter text-xl font-bold text-foreground tracking-wide">
          마음편지
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon, requireAuth }) => (
            <button
              key={path}
              onClick={() => handleNavClick(path, requireAuth)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
                location.pathname === path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
