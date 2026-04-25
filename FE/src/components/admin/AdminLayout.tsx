import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  ChevronLeft, ChevronRight, LogOut, Tag, Bell, Moon, Sun, GraduationCap,
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
import api from "@/services/api";

const menuItems = [
  { label: "Dashboard",     path: "/admin",               icon: LayoutDashboard },
  { label: "Khóa học",      path: "/admin/courses",       icon: BookOpen },
  { label: "Ghi danh",      path: "/admin/enrollments",   icon: ClipboardList },
  { label: "Giảng viên",    path: "/admin/instructors",   icon: GraduationCap },
  { label: "Người dùng",    path: "/admin/users",         icon: Users },
  { label: "Danh mục",      path: "/admin/categories",    icon: Tag },
];

const pageTitles: Record<string, string> = {
  "/admin":                 "Dashboard",
  "/admin/courses":         "Quản lý Khóa học",
  "/admin/enrollments":     "Quản lý Ghi danh",
  "/admin/instructors":     "Quản lý Giảng viên",
  "/admin/users":           "Quản lý Người dùng",
  "/admin/categories":      "Quản lý Danh mục",
};

const AdminLayout = () => {
  const [collapsed, setCollapsed]         = useState(false);
  const [pendingCount, setPendingCount]   = useState(0);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const currentTitle = pageTitles[location.pathname] || "Admin";

  useEffect(() => {
    api.get('/admin/enrollments')
      .then(res => {
        const pending = (res.data.enrollments || []).filter((e: any) => e.status === 'pending');
        setPendingCount(pending.length);
      })
      .catch(() => {});
  }, [location.pathname]);

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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/admin/enrollments" className="relative">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                      <Bell size={17} />
                    </Button>
                    {pendingCount > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-bold flex items-center justify-center"
                        style={{ background: "hsl(var(--admin-reject))", color: "#fff", borderRadius: "9999px" }}
                      >
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </Badge>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  {pendingCount > 0 ? `${pendingCount} ghi danh chờ duyệt` : "Không có thông báo mới"}
                </TooltipContent>
              </Tooltip>

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
