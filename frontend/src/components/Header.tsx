import { Link, useLocation } from "react-router-dom";
import { Mail, BookOpen, Heart, Home, User } from "lucide-react";

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "홈", icon: Home },
    { path: "/write", label: "편지 쓰기", icon: Mail },
    { path: "/letters", label: "편지함", icon: BookOpen },
    { path: "/profile", label: "프로필", icon: User },
    { path: "/archive", label: "감정 기록", icon: Heart },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-letter text-xl font-bold text-foreground tracking-wide">
          마음편지
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
                location.pathname === path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
