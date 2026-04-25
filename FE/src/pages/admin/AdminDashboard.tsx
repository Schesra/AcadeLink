import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Users, ClipboardList, Tag,
  Clock, CheckCircle2, XCircle, Plus, ChevronDown, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import api from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type DateRange = "today" | "7days" | "month" | "all";

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "today",  label: "Hôm nay" },
  { value: "7days",  label: "7 ngày qua" },
  { value: "month",  label: "Tháng này" },
  { value: "all",    label: "Tất cả" },
];

const STATUS_CFG = {
  pending:  { label: "Chờ duyệt", Icon: Clock,        tw: "text-warning",     bg: "bg-warning/10" },
  approved: { label: "Đã duyệt",  Icon: CheckCircle2, tw: "text-success",     bg: "bg-success/10" },
  rejected: { label: "Từ chối",   Icon: XCircle,      tw: "text-destructive", bg: "bg-destructive/10" },
};

const AVATAR_PALETTES = [
  { bg: "#fff3e8", color: "#e05a00" },
  { bg: "#e8f5e9", color: "#2e7d32" },
  { bg: "#e3f2fd", color: "#1565c0" },
  { bg: "#f3e5f5", color: "#6a1b9a" },
  { bg: "#fff8e1", color: "#f57f17" },
  { bg: "#fce4ec", color: "#c62828" },
];

const avatarPalette = (name: string) =>
  AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isInRange = (dateStr: string, range: DateRange): boolean => {
  const d   = new Date(dateStr);
  const now = new Date();
  if (range === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (range === "7days") {
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);
    return d >= cutoff;
  }
  if (range === "month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  return true;
};

const buildChartData = (enrollments: any[], range: DateRange) => {
  if (range === "all") {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (11 - i));
      const label = d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" });
      const count = enrollments.filter(e => {
        const ed = new Date(e.enrolled_at);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      }).length;
      return { date: label, "Ghi danh": count };
    });
  }
  const days = range === "today" ? 1 : range === "month" ? 30 : 7;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    const label = range === "month"
      ? d.getDate() + "/" + (d.getMonth() + 1)
      : d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" });
    const count = enrollments.filter(e => {
      const ed = new Date(e.enrolled_at);
      return ed.toDateString() === d.toDateString();
    }).length;
    return { date: label, "Ghi danh": count };
  });
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
          <CardContent><Skeleton className="h-9 w-16 mt-1" /></CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="border-0 shadow-sm lg:col-span-3">
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-52 w-full" /></CardContent>
      </Card>
      <Card className="border-0 shadow-sm lg:col-span-2">
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyActivity = () => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <ClipboardList size={28} className="text-muted-foreground/50" />
    </div>
    <p className="text-sm font-medium text-card-foreground">Chưa có hoạt động nào</p>
    <p className="text-xs text-muted-foreground mt-1">Ghi danh mới sẽ xuất hiện ở đây</p>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border shadow-md rounded-lg px-3 py-2 text-sm">
      <p className="font-medium text-card-foreground">{label}</p>
      <p className="text-primary">{payload[0].value} ghi danh</p>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [loading, setLoading]               = useState(true);
  const [range, setRange]                   = useState<DateRange>("7days");
  const [allEnrollments, setAllEnrollments] = useState<any[]>([]);
  const [totalUsers, setTotalUsers]         = useState(0);
  const [totalCourses, setTotalCourses]     = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [categoryStats, setCategoryStats]   = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/admin/courses'),
      api.get('/admin/enrollments'),
      api.get('/admin/categories'),
      api.get('/admin/users'),
    ]).then(([c, e, cat, u]) => {
      const enrollments: any[] = e.data.enrollments || [];
      const courses: any[]     = c.data.courses     || [];
      const categories: any[]  = cat.data.categories || [];

      setAllEnrollments(enrollments);
      setTotalCourses(courses.length);
      setTotalCategories(categories.length);
      setTotalUsers(u.data.users?.filter((usr: any) => usr.roles?.includes('student')).length ?? 0);

      const catMap: Record<string, number> = {};
      courses.forEach((course: any) => {
        const name = course.category_name || "Khác";
        catMap[name] = (catMap[name] || 0) + 1;
      });
      setCategoryStats(
        Object.entries(catMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      );
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredEnrollments = useMemo(
    () => allEnrollments.filter(e => isInRange(e.enrolled_at, range)),
    [allEnrollments, range]
  );

  const recentEnrollments = useMemo(
    () => [...filteredEnrollments]
      .sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
      .slice(0, 6),
    [filteredEnrollments]
  );

  const chartData = useMemo(
    () => buildChartData(allEnrollments, range),
    [allEnrollments, range]
  );

  const rangeLabel = DATE_RANGE_OPTIONS.find(o => o.value === range)?.label ?? "";
  const maxCount   = Math.max(...categoryStats.map(c => c.count), 1);

  const statCards = [
    { label: "Khóa học",                      value: totalCourses,               icon: BookOpen,      accent: "#e05a00" },
    { label: "Học viên",                      value: totalUsers,                 icon: Users,         accent: "#2e7d32" },
    { label: `Ghi danh (${rangeLabel})`,      value: filteredEnrollments.length, icon: ClipboardList, accent: "#1565c0" },
    { label: "Danh mục",                      value: totalCategories,            icon: Tag,           accent: "#6a1b9a" },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Date range picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 shadow-sm">
              <TrendingUp size={14} />
              {rangeLabel}
              <ChevronDown size={14} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {DATE_RANGE_OPTIONS.map(opt => (
              <DropdownMenuItem key={opt.value} onClick={() => setRange(opt.value)}
                className={range === opt.value ? "font-semibold text-primary" : ""}>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick action */}
        <Link to="/admin/courses">
          <Button size="sm" className="gap-2 shadow-sm">
            <Plus size={14} /> Tạo khóa học mới
          </Button>
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 w-full" style={{ background: s.accent }} />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground leading-snug">
                {s.label}
              </CardTitle>
              <div className="p-1.5 rounded-md" style={{ background: s.accent + "18" }}>
                <s.icon size={16} style={{ color: s.accent }} />
              </div>
            </CardHeader>
            <CardContent className="pt-1 pb-4">
              <p className="text-4xl font-extrabold tracking-tight" style={{ color: s.accent }}>
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Chart + Recent ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Line chart */}
        <Card className="border-0 shadow-sm lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Xu hướng ghi danh</CardTitle>
            <span className="text-xs text-muted-foreground">{range === "all" ? "12 tháng gần nhất" : rangeLabel}</span>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Ghi danh"
                  stroke="#e05a00"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#e05a00", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent enrollments */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentEnrollments.length === 0 ? (
              <EmptyActivity />
            ) : (
              <div className="divide-y">
                {recentEnrollments.map((e) => {
                  const cfg     = STATUS_CFG[e.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
                  const palette = avatarPalette(e.username || "U");
                  const initials = (e.full_name || e.username || "?")
                    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs font-bold"
                          style={{ background: palette.bg, color: palette.color }}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{e.full_name || e.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{e.course_title}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        <Badge variant="outline"
                          className={`text-xs px-2 py-0.5 ${cfg.tw} border-current ${cfg.bg}`}>
                          {cfg.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.enrolled_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Category distribution ── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Phân bổ khóa học theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryStats.length === 0 ? (
            <p className="text-muted-foreground text-sm">Chưa có dữ liệu.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
              {categoryStats.map((cat, idx) => {
                const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium truncate max-w-[200px]">{cat.name}</span>
                      <span className="text-muted-foreground shrink-0 ml-2 tabular-nums">
                        {cat.count} khóa
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(cat.count / maxCount) * 100}%`,
                          background: palette.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminDashboard;
