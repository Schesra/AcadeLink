import { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  ChevronLeft, ChevronRight, LogOut, Tag, Bell, Moon, Sun, GraduationCap, CreditCard,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { notificationService, Notification } from "@/services/notificationService";

const typeConfig: Record<string, { bg: string; emoji: string }> = {
  enrollment_approved:  { bg: "bg-green-500",  emoji: "✅" },
  enrollment_rejected:  { bg: "bg-red-500",    emoji: "❌" },
  new_enrollment:       { bg: "bg-blue-500",   emoji: "📋" },
  new_review:           { bg: "bg-yellow-500", emoji: "⭐" },
  review_reminder:      { bg: "bg-orange-500", emoji: "💬" },
  course_completed:     { bg: "bg-emerald-500",emoji: "🎉" },
  new_lesson:           { bg: "bg-indigo-500", emoji: "📚" },
  new_support_ticket:   { bg: "bg-rose-500",   emoji: "🎫" },
  payment_reported:     { bg: "bg-orange-500", emoji: "💳" },
  payment_confirmed:    { bg: "bg-green-500",  emoji: "✅" },
  payment_cancelled:    { bg: "bg-red-500",    emoji: "❌" },
  new_sale:             { bg: "bg-emerald-500",emoji: "💰" },
  withdrawal_request:   { bg: "bg-blue-500",   emoji: "📤" },
  withdrawal_completed: { bg: "bg-green-500",  emoji: "💸" },
  withdrawal_rejected:  { bg: "bg-red-500",    emoji: "🚫" },
  default:              { bg: "bg-primary",    emoji: "🔔" },
};
const getTypeConfig = (type: string) => typeConfig[type] || typeConfig.default;

const menuItems = [
  { label: "Dashboard",     path: "/admin",               icon: LayoutDashboard },
  { label: "Khóa học",      path: "/admin/courses",       icon: BookOpen },
  { label: "Ghi danh",      path: "/admin/enrollments",   icon: ClipboardList },
  { label: "Thanh toán",    path: "/admin/payments",      icon: CreditCard },
  { label: "Giảng viên",    path: "/admin/instructors",   icon: GraduationCap },
  { label: "Người dùng",    path: "/admin/users",         icon: Users },
  { label: "Danh mục",      path: "/admin/categories",    icon: Tag },
];

const pageTitles: Record<string, string> = {
  "/admin":                    "Dashboard",
  "/admin/courses":            "Quản lý Khóa học",
  "/admin/enrollments":        "Quản lý Ghi danh",
  "/admin/instructors":        "Quản lý Giảng viên",
  "/admin/users":              "Quản lý Người dùng",
  "/admin/categories":         "Quản lý Danh mục",
  "/admin/notifications":      "Thông báo",
  "/admin/payments":           "Quản lý Thanh toán",
};

const PREVIEW_LIMIT = 5;

const AdminLayout = () => {
  const [collapsed, setCollapsed]     = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen]       = useState(false);
  const bellRef                       = useRef<HTMLDivElement>(null);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const currentTitle = pageTitles[location.pathname] || "Admin";

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="admin-theme flex h-screen overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-[240px]"}`}
          style={{ background: "hsl(var(--admin-sidebar))", borderRight: "1px solid hsl(var(--border))" }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center px-4 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
            {collapsed
              ? <img src="/src/assets/Logo.png" alt="logo" className="h-8 w-8 object-contain" />
              : <img src="/src/assets/Logo.png" alt="logo" className="h-14 object-contain" />
            }
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const el = (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    collapsed ? "justify-center" : ""
                  }`}
                  style={{
                    background: isActive ? "hsl(var(--admin-sidebar-active))" : undefined,
                    color: isActive
                      ? "hsl(var(--admin-sidebar-text-active))"
                      : "hsl(var(--admin-sidebar-text))",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "hsl(var(--admin-sidebar-hover))"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <item.icon size={19} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
              return collapsed
                ? (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{el}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
                : el;
            })}
          </nav>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-11 flex items-center justify-center border-t transition-colors hover:bg-muted/30"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--admin-primary))" }}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </aside>

        {/* ── Main ── */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-16" : "ml-[240px]"}`}>

          {/* Topbar */}
          <header
            className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b shadow-sm gap-4"
            style={{ background: "hsl(var(--admin-header))" }}
          >
            {/* Breadcrumb + title */}
            <div className="min-w-0">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/admin" className="text-muted-foreground hover:text-foreground text-sm">Admin</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {location.pathname !== "/admin" && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-sm">{currentTitle}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-lg font-semibold text-foreground mt-0.5 truncate">{currentTitle}</h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Dark mode toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}</TooltipContent>
              </Tooltip>

              {/* Notification bell */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setBellOpen(o => !o)}
                  className="relative inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-bold flex items-center justify-center pointer-events-none"
                      style={{ background: "hsl(var(--admin-reject))", color: "#fff", borderRadius: "9999px" }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </button>

                {bellOpen && (
                  <div className="absolute right-0 top-11 w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                      <span className="font-semibold text-sm text-foreground">Thông Báo Mới Nhận</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline font-medium">
                          Đánh dấu tất cả đã đọc
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="divide-y divide-border max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-muted-foreground text-sm py-10">
                          Không có thông báo nào
                        </p>
                      ) : (
                        notifications.slice(0, PREVIEW_LIMIT).map(n => {
                          const cfg = getTypeConfig(n.type);
                          return (
                            <div
                              key={n.id}
                              onClick={() => !n.is_read && handleMarkRead(n.id)}
                              className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
                            >
                              <div className={`${cfg.bg} w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl`}>
                                {cfg.emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold line-clamp-1 ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                  {n.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                                </p>
                              </div>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border">
                      <Link
                        to="/admin/notifications"
                        onClick={() => setBellOpen(false)}
                        className="block w-full text-center text-sm font-medium text-foreground py-3 hover:bg-muted/50 transition-colors"
                      >
                        Xem tất cả
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer outline-none rounded-lg px-2 py-1 hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className="text-xs font-semibold"
                      style={{ background: "hsl(var(--admin-primary-light))", color: "hsl(var(--admin-primary))" }}
                    >
                      {user?.username?.slice(0, 2).toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
                    {user?.full_name || "Admin"}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.full_name || "Admin"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                    <LogOut size={15} className="mr-2" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6" style={{ background: "hsl(var(--admin-bg))" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;
