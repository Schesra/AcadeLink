import { useState, useEffect, useMemo } from "react";
import { Search, BookOpen, Users, Eye, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import api from "@/services/api";

const BE_URL = "http://localhost:3000";
const getImgSrc = (url: string | null | undefined) => {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${BE_URL}${url}`;
};

const InstructorCoursesDrawer = ({ instructorId, name, open, onClose }: {
  instructorId: number | null; name: string; open: boolean; onClose: () => void;
}) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!instructorId || !open) return;
    setLoading(true);
    api.get(`/admin/instructors/${instructorId}/courses`)
      .then(res => setCourses(res.data.courses || []))
      .catch(() => toast.error("Không thể tải khóa học"))
      .finally(() => setLoading(false));
  }, [instructorId, open]);

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <div className="p-5 border-b">
          <p className="text-xs text-muted-foreground">Giảng viên</p>
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{courses.length} khóa học</p>
        </div>
        <div className="p-5 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Chưa có khóa học nào.</p>
          ) : (
            courses.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
                <img src={getImgSrc(c.thumbnail_url)} alt={c.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.category_name}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {c.lesson_count} bài</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {c.student_count} học viên</span>
                  </div>
                </div>
                <p className="text-sm font-semibold shrink-0 text-primary">
                  {parseFloat(c.price) === 0 ? "Miễn phí" : Number(c.price).toLocaleString("vi-VN") + "₫"}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const AdminInstructors = () => {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailTarget, setDetailTarget] = useState<any>(null);
  const [removeTarget, setRemoveTarget] = useState<any>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/instructors");
      setInstructors(res.data.instructors || []);
    } catch {
      toast.error("Không thể tải danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() =>
    instructors.filter(i =>
      i.username?.toLowerCase().includes(search.toLowerCase()) ||
      i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase())
    ), [instructors, search]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await api.delete(`/admin/instructors/${removeTarget.id}/role`);
      toast.success(`Đã thu hồi quyền giảng viên của ${removeTarget.full_name || removeTarget.username}`);
      setRemoveTarget(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Thao tác thất bại");
    }
  };

  const totalCourses = instructors.reduce((s, i) => s + Number(i.course_count || 0), 0);
  const totalStudents = instructors.reduce((s, i) => s + Number(i.student_count || 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Giảng viên", value: instructors.length, cls: "bg-muted text-muted-foreground" },
          { label: "Tổng khóa học", value: totalCourses, cls: "bg-primary/10 text-primary" },
          { label: "Tổng học viên", value: totalStudents, cls: "bg-success/10 text-success" },
        ].map(s => (
          <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${s.cls}`}>
            {s.label}: <strong>{s.value}</strong>
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm tên, email, username..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <AdminEmptyState message="Không tìm thấy giảng viên nào." />
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Giảng viên</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-center">Khóa học</TableHead>
                    <TableHead className="text-center">Học viên</TableHead>
                    <TableHead className="hidden lg:table-cell">Ngày tham gia</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(inst => (
                    <TableRow key={inst.id} className="h-14 hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="text-xs font-semibold"
                              style={{ background: "hsl(var(--admin-primary-light))", color: "hsl(var(--admin-primary))" }}>
                              {(inst.full_name || inst.username || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{inst.full_name || inst.username}</p>
                            <p className="text-xs text-muted-foreground truncate">@{inst.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{inst.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">{inst.course_count}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">{inst.student_count}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {new Date(inst.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="Xem khóa học"
                            onClick={() => setDetailTarget(inst)}>
                            <Eye size={15} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8"
                            title="Thu hồi quyền giảng viên"
                            onClick={() => setRemoveTarget(inst)}>
                            <UserX size={15} style={{ color: "hsl(var(--admin-reject))" }} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses Drawer */}
      <InstructorCoursesDrawer
        instructorId={detailTarget?.id ?? null}
        name={detailTarget?.full_name || detailTarget?.username || ""}
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      {/* Confirm remove role */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={o => !o && setRemoveTarget(null)}
        title="Thu hồi quyền giảng viên"
        description={`Bạn có chắc muốn thu hồi quyền giảng viên của "${removeTarget?.full_name || removeTarget?.username}"? Người dùng vẫn giữ tài khoản nhưng sẽ không còn là giảng viên.`}
        confirmLabel="Thu hồi"
        onConfirm={handleRemove}
        destructive
      />
    </div>
  );
};

export default AdminInstructors;
