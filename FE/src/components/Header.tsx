import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Menu, X, LogOut, GraduationCap, BookOpen,
  Moon, Sun, Search, ChevronDown,
  UserCircle, Heart, Award, Receipt, Settings, HelpCircle, ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import NotificationBell from "@/components/NotificationBell";

const studentNavItems = [
  { label: "Trang chủ", path: "/" },
  { label: "Khóa học", path: "/courses" },
];

const instructorNavItems = [
  { label: "Dashboard", path: "/instructor/dashboard" },
  { label: "Khóa học của tôi", path: "/instructor/courses" },
];

const AVATAR_COLORS = [
  "bg-orange-500", "bg-blue-500", "bg-green-500",
  "bg-purple-500", "bg-pink-500", "bg-teal-500",
];

function getAvatarColor(name: string) {
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

const ComingSoon = () => (
  <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground leading-none">
    Sắp có
  </span>
);

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, activeMode, setActiveMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { count: cartCount } = useCart();

  const isInstructor = user?.roles?.includes("instructor");
  const navItems = activeMode === "instructor" ? instructorNavItems : studentNavItems;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const handleSwitchMode = () => {
    const newMode = activeMode === "student" ? "instructor" : "student";
    setActiveMode(newMode);
    navigate(newMode === "instructor" ? "/instructor/dashboard" : "/");
    setMobileOpen(false);
  };

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = headerSearch.trim();
    navigate(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
    setHeaderSearch("");
    setMobileOpen(false);
  };

  const showComingSoon = (label: string) => {
    toast({ title: `${label}`, description: "Tính năng đang được phát triển, sẽ sớm ra mắt!" });
  };

  const avatarColor = user ? getAvatarColor(user.full_name || user.username) : "bg-primary";
  const avatarInitial = (user?.full_name || user?.username || "U").charAt(0).toUpperCase();
  const displayRole = activeMode === "instructor" ? "Giảng viên" : "Học viên";

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border h-16">
      <div className="container mx-auto px-4 h-full">

        {/* ── Desktop: 3-column grid ── */}
        <div className="hidden md:grid grid-cols-3 items-center h-full">

          {/* Col 1 — Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-primary shrink-0">
              <img src="/src/assets/Logo.png" alt="logo" className="h-8 w-8 object-contain" />
              AcadeLink
            </Link>
            <nav className="flex items-center gap-5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-sm font-medium transition-colors duration-200 pb-0.5
                      after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary
                      after:transition-transform after:duration-200
                      ${isActive
                        ? "text-primary after:scale-x-100"
                        : "text-muted-foreground hover:text-primary after:scale-x-0 hover:after:scale-x-100"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Col 2 — Search (truly centered) */}
          <div className="flex justify-center">
            <form onSubmit={handleHeaderSearch} className="w-full max-w-sm">
              <div className="relative w-full transition-all focus-within:shadow-md focus-within:ring-1 ring-primary/30 rounded-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-full"
                />
              </div>
            </form>
          </div>

          {/* Col 3 — Theme + Notifications + User */}
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-primary h-9 w-9"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </Button>

            <NotificationBell />

            {isAuthenticated && activeMode === 'student' && (
              <Link to="/cart" className="relative inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none pointer-events-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 border border-border/60 hover:bg-muted transition-colors outline-none">
                    <div className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                      {avatarInitial}
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-sm font-medium text-foreground leading-none">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{displayRole}</p>
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                {/* Phần 1: User info */}
                <DropdownMenuLabel className="font-normal pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-9 w-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                      {avatarInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-muted-foreground">{displayRole}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Phần 2: Hồ sơ & Học tập */}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <UserCircle size={15} className="text-muted-foreground" />
                    Hồ sơ của tôi
                  </Link>
                </DropdownMenuItem>

                {activeMode === "student" && (
                  <DropdownMenuItem asChild>
                    <Link to="/my-courses" className="flex items-center gap-2 cursor-pointer">
                      <BookOpen size={15} className="text-muted-foreground" />
                      Khóa học của tôi
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => showComingSoon("Khóa học yêu thích")} className="flex items-center gap-2 cursor-pointer">
                  <Heart size={15} className="text-muted-foreground" />
                  Khóa học yêu thích
                  <ComingSoon />
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => showComingSoon("Chứng chỉ của tôi")} className="flex items-center gap-2 cursor-pointer">
                  <Award size={15} className="text-muted-foreground" />
                  Chứng chỉ của tôi
                  <ComingSoon />
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Phần 3: GV & Thanh toán */}
                {activeMode === "student" && !isInstructor && (
                  <DropdownMenuItem asChild>
                    <Link to="/become-instructor" className="flex items-center gap-2 cursor-pointer">
                      <GraduationCap size={15} className="text-muted-foreground" />
                      Trở thành Giảng viên
                    </Link>
                  </DropdownMenuItem>
                )}

                {isInstructor && (
                  <DropdownMenuItem onClick={handleSwitchMode} className="flex items-center gap-2 cursor-pointer">
                    <GraduationCap size={15} className="text-muted-foreground" />
                    {activeMode === "student" ? "Chuyển sang Giảng viên" : "Chuyển sang Học viên"}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => showComingSoon("Lịch sử thanh toán")} className="flex items-center gap-2 cursor-pointer">
                  <Receipt size={15} className="text-muted-foreground" />
                  Lịch sử thanh toán
                  <ComingSoon />
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Phần 4: Cài đặt & Hỗ trợ */}
                <DropdownMenuItem onClick={() => showComingSoon("Cài đặt tài khoản")} className="flex items-center gap-2 cursor-pointer">
                  <Settings size={15} className="text-muted-foreground" />
                  Cài đặt tài khoản
                  <ComingSoon />
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/support" className="flex items-center gap-2 cursor-pointer">
                    <HelpCircle size={15} className="text-muted-foreground" />
                    Trợ giúp & Hỗ trợ
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Phần 5: Đăng xuất */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Mobile: flex ── */}
        <div className="flex md:hidden items-center h-full gap-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-primary shrink-0">
            <img src="/src/assets/Logo.png" alt="logo" className="h-8 w-8 object-contain" />
            AcadeLink
          </Link>
          <div className="flex items-center gap-1 ml-auto">
          <button
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t shadow-lg max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleHeaderSearch} className="px-4 pt-3 pb-1">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </form>

          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mt-1 border-t">
                  <div className={`h-9 w-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                    {avatarInitial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user?.full_name || user?.username}</p>
                    <p className="text-xs text-muted-foreground">{displayRole}</p>
                  </div>
                </div>

                {/* Group 2 */}
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent">
                  <UserCircle size={15} /> Hồ sơ của tôi
                </Link>
                {activeMode === "student" && (
                  <Link to="/my-courses" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent">
                    <BookOpen size={15} /> Khóa học của tôi
                  </Link>
                )}
                <button onClick={() => { showComingSoon("Khóa học yêu thích"); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent text-left">
                  <Heart size={15} /> Khóa học yêu thích
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted">Sắp có</span>
                </button>
                <button onClick={() => { showComingSoon("Chứng chỉ của tôi"); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent text-left">
                  <Award size={15} /> Chứng chỉ của tôi
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted">Sắp có</span>
                </button>

                {/* Group 3 */}
                <div className="border-t my-1" />
                {activeMode === "student" && !isInstructor && (
                  <Link to="/become-instructor" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-accent">
                    <GraduationCap size={15} /> Trở thành Giảng viên
                  </Link>
                )}
                {isInstructor && (
                  <button onClick={handleSwitchMode} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-accent text-left">
                    <GraduationCap size={15} />
                    {activeMode === "student" ? "Chuyển sang Giảng viên" : "Chuyển sang Học viên"}
                  </button>
                )}
                <button onClick={() => { showComingSoon("Lịch sử thanh toán"); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent text-left">
                  <Receipt size={15} /> Lịch sử thanh toán
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted">Sắp có</span>
                </button>

                {/* Group 4 */}
                <div className="border-t my-1" />
                <button onClick={() => { showComingSoon("Cài đặt tài khoản"); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent text-left">
                  <Settings size={15} /> Cài đặt tài khoản
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted">Sắp có</span>
                </button>
                <Link to="/support" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent">
                  <HelpCircle size={15} /> Trợ giúp & Hỗ trợ
                </Link>

                {/* Group 5 */}
                <div className="border-t my-1" />
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 text-left">
                  <LogOut size={15} /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full mt-2">Đăng nhập</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Đăng ký</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
