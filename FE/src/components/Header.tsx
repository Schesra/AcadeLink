import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const studentNavItems = [
  { label: "Trang chủ", path: "/" },
  { label: "Khóa học", path: "/courses" },
];

const instructorNavItems = [
  { label: "Dashboard", path: "/instructor/dashboard" },
  { label: "Khóa học của tôi", path: "/instructor/courses" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, activeMode, setActiveMode } = useAuth();

  const isInstructor = user?.roles?.includes('instructor');
  const navItems = activeMode === 'instructor' ? instructorNavItems : studentNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const handleSwitchMode = () => {
    const newMode = activeMode === 'student' ? 'instructor' : 'student';
    setActiveMode(newMode);
    navigate(newMode === 'instructor' ? '/instructor/dashboard' : '/');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm h-16">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">AcadeLink</Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Mode badge */}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                activeMode === 'instructor'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {activeMode === 'instructor' ? 'Giảng viên' : 'Học viên'}
              </span>

              {/* Switch mode button - chỉ hiện nếu có role instructor */}
              {isInstructor && (
                <Button variant="outline" size="sm" onClick={handleSwitchMode} className="gap-2">
                  {activeMode === 'student' ? (
                    <><GraduationCap size={16} /> Chuyển sang GV</>
                  ) : (
                    <><BookOpen size={16} /> Chuyển sang HV</>
                  )}
                </Button>
              )}

              {activeMode === 'student' && (
                <>
                  <Link to="/my-courses">
                    <Button variant="ghost" size="sm">Khóa học của tôi</Button>
                  </Link>
                  {!isInstructor && (
                    <Link to="/become-instructor" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                      Trở thành GV
                    </Link>
                  )}
                </>
              )}

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </>
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

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t shadow-lg animate-fade-in">
          <nav className="flex flex-col p-4 gap-2">
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
                {isInstructor && (
                  <button
                    onClick={handleSwitchMode}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-accent text-left"
                  >
                    {activeMode === 'student' ? '🎓 Chuyển sang Giảng viên' : '📚 Chuyển sang Học viên'}
                  </button>
                )}
                {activeMode === 'student' && (
                  <>
                    <Link to="/my-courses" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent">
                      Khóa học của tôi
                    </Link>
                    {!isInstructor && (
                      <Link to="/become-instructor" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-primary">
                        Trở thành GV
                      </Link>
                    )}
                  </>
                )}
                <Button variant="ghost" className="w-full mt-2 justify-start" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
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
