import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Eye, BookOpen, Users, ListOrdered, CheckCircle2, Clock, XCircle, ImagePlus, X } from "lucide-react";

const BE_URL = "http://localhost:3000";
const getImgSrc = (url: string | null | undefined) => {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${BE_URL}${url}`;
};
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import api from "@/services/api";

const STATUS_CFG = {
  approved: { label: "Đã duyệt", icon: CheckCircle2, cls: "text-success border-success bg-success/10" },
  pending:  { label: "Chờ duyệt", icon: Clock,       cls: "text-warning border-warning bg-warning/10" },
  rejected: { label: "Từ chối",  icon: XCircle,      cls: "text-destructive border-destructive bg-destructive/10" },
};

// ─── Detail Drawer ─────────────────────────────────────────────────────────────
const CourseDetailDrawer = ({ courseId, open, onClose }: { courseId: number | null; open: boolean; onClose: () => void }) => {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId || !open) return;
    setLoading(true);
    setDetail(null);
    api.get(`/admin/courses/${courseId}`)
      .then(res => setDetail(res.data.course))
      .catch(() => toast.error("Không thể tải chi tiết khóa học"))
      .finally(() => setLoading(false));
  }, [courseId, open]);

  const formatPrice = (p: any) =>
    parseFloat(p) === 0 ? "Miễn phí" : Number(p).toLocaleString("vi-VN") + " ₫";

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          </div>
        ) : !detail ? null : (
          <>
            {/* Hero */}
            <div className="relative">
              <img
                src={getImgSrc(detail.thumbnail_url)}
                alt={detail.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-xs text-white/70 mb-1">{detail.category_name}</p>
                <h2 className="text-white font-bold text-lg leading-snug line-clamp-2">{detail.title}</h2>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: BookOpen, label: "Bài học", value: detail.lessons?.length ?? 0, color: "#e05a00" },
                  { icon: Users,    label: "Ghi danh", value: detail.enrollment_count ?? 0, color: "#1565c0" },
                  { icon: ListOrdered, label: "Giá",   value: formatPrice(detail.price),   color: "#2e7d32" },
                ].map(m => (
                  <div key={m.label} className="rounded-xl border p-3 text-center">
                    <m.icon size={18} className="mx-auto mb-1" style={{ color: m.color }} />
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-bold truncate">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-28 shrink-0">Giảng viên</span>
                  <span className="font-medium">{detail.instructor_full_name || detail.instructor_name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-28 shrink-0">Ngày tạo</span>
                  <span>{new Date(detail.created_at).toLocaleDateString("vi-VN")}</span>
                </div>
                {detail.description && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-28 shrink-0">Mô tả</span>
                    <span className="text-foreground leading-relaxed">{detail.description}</span>
                  </div>
                )}
              </div>

              {/* Tabs: Lessons & Enrollments */}
              <Tabs defaultValue="lessons">
                <TabsList className="w-full">
                  <TabsTrigger value="lessons" className="flex-1">
                    Bài học <Badge variant="secondary" className="ml-1.5 text-xs">{detail.lessons?.length ?? 0}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="enrollments" className="flex-1">
                    Học viên <Badge variant="secondary" className="ml-1.5 text-xs">{detail.enrollments?.length ?? 0}</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Lessons */}
                <TabsContent value="lessons" className="mt-3">
                  {detail.lessons?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có bài học nào.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.lessons.map((l: any, idx: number) => (
                        <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                          <span className="flex-none w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{l.title}</p>
                            {l.content && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{l.content}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Enrollments */}
                <TabsContent value="enrollments" className="mt-3">
                  {detail.enrollments?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Chưa có học viên nào.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.enrollments.map((e: any) => {
                        const cfg = STATUS_CFG[e.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
                        return (
                          <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {(e.full_name || e.username || "?")[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{e.full_name || e.username}</p>
                              <p className="text-xs text-muted-foreground">{new Date(e.enrolled_at).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <Badge variant="outline" className={`text-xs shrink-0 ${cfg.cls}`}>
                              {cfg.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const AdminCourses = () => {
  const [courses, setCourses]       = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch]         = useState("");
  const [formOpen, setFormOpen]     = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [detailId, setDetailId]     = useState<number | null>(null);
  const [formData, setFormData]     = useState({
    title: "", category_id: "", description: "", price: "", thumbnail_url: "",
  });
  const [originalData, setOriginalData] = useState<typeof formData | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [uploading, setUploading]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPrice = (val: string) => {
    const digits = val.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "");
    if (raw === "" || /^\d+$/.test(raw)) {
      setPriceDisplay(formatPrice(raw));
      setFormData(prev => ({ ...prev, price: raw }));
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [c, cat] = await Promise.all([api.get('/admin/courses'), api.get('/admin/categories')]);
      setCourses(c.data.courses || []);
      setCategories(cat.data.categories || []);
    } catch {
      toast.error("Không thể tải dữ liệu");
    }
  };

  const filtered = useMemo(() =>
    courses.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor_name?.toLowerCase().includes(search.toLowerCase())
    ), [courses, search]);

  const openAdd = () => {
    setEditCourse(null);
    setOriginalData(null);
    setFormData({ title: "", category_id: "", description: "", price: "", thumbnail_url: "" });
    setPreviewUrl("");
    setPriceDisplay("");
    setFormOpen(true);
  };

  const openEdit = (c: any) => {
    setEditCourse(c);
    const rawPrice = c.price != null ? Math.round(parseFloat(c.price)).toString() : "";
    const initial = {
      title: c.title,
      category_id: c.category_id?.toString() || "",
      description: c.description || "",
      price: rawPrice,
      thumbnail_url: c.thumbnail_url || "",
    };
    setFormData(initial);
    setOriginalData(initial);
    setPriceDisplay(formatPrice(rawPrice));
    setPreviewUrl(c.thumbnail_url ? getImgSrc(c.thumbnail_url) : "");
    setFormOpen(true);
  };

  const hasChanges = !editCourse || !originalData || JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("thumbnail", file);
      const res = await api.post("/upload/thumbnail", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData(prev => ({ ...prev, thumbnail_url: res.data.url }));
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Upload ảnh thất bại");
      setPreviewUrl("");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setPreviewUrl("");
    setFormData(prev => ({ ...prev, thumbnail_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveForm = async () => {
    if (!formData.title || !formData.category_id || formData.price === "") return;
    try {
      const payload = {
        title: formData.title,
        category_id: Number(formData.category_id),
        description: formData.description,
        price: Number(formData.price),
        thumbnail_url: formData.thumbnail_url || null,
      };
      if (editCourse) {
        await api.put(`/admin/courses/${editCourse.id}`, payload);
        toast.success("Cập nhật khóa học thành công!");
      } else {
        await api.post('/admin/courses', { ...payload, instructor_id: 1 });
        toast.success("Thêm khóa học thành công!");
      }
      setFormOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Thao tác thất bại");
    }
  };

  const deleteCourse = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/courses/${deleteTarget.id}`);
      toast.success("Đã xóa khóa học!");
      setDeleteTarget(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Xóa thất bại");
    }
  };

  const freeCourses = courses.filter(c => parseFloat(c.price) === 0).length;

  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Tổng", value: courses.length, cls: "bg-muted text-muted-foreground" },
          { label: "Miễn phí", value: freeCourses, cls: "bg-success/10 text-success" },
          { label: "Có phí", value: courses.length - freeCourses, cls: "bg-primary/10 text-primary" },
        ].map(s => (
          <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${s.cls}`}>
            {s.label}: <strong>{s.value}</strong>
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm khóa học hoặc giảng viên..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={openAdd} className="gap-1.5 shrink-0" style={{ background: "hsl(var(--admin-approve))" }}>
            <Plus size={16} /> Thêm mới
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0
            ? <AdminEmptyState message="Không tìm thấy khóa học nào." />
            : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Ảnh</TableHead>
                      <TableHead>Tên khóa học</TableHead>
                      <TableHead className="hidden md:table-cell">Danh mục</TableHead>
                      <TableHead className="hidden lg:table-cell">Giảng viên</TableHead>
                      <TableHead className="hidden sm:table-cell text-center">Ghi danh</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Giá</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(c => (
                      <TableRow
                        key={c.id}
                        className="h-14 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setDetailId(c.id)}
                      >
                        <TableCell onClick={e => e.stopPropagation()}>
                          <img
                            src={getImgSrc(c.thumbnail_url)}
                            alt={c.title}
                            className="w-[46px] h-[46px] rounded-lg object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-[180px] truncate">{c.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{c.category_name}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{c.instructor_name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-center">{c.enrollment_count || 0}</TableCell>
                        <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                          {parseFloat(c.price) === 0 ? "Miễn phí" : Number(c.price).toLocaleString("vi-VN") + " ₫"}
                        </TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => setDetailId(c.id)}>
                              <Eye size={15} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8"
                              onClick={() => openEdit(c)}>
                              <Pencil size={15} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8"
                              onClick={() => setDeleteTarget(c)}>
                              <Trash2 size={15} style={{ color: "hsl(var(--admin-reject))" }} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          }
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <CourseDetailDrawer
        courseId={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Tên khóa học *</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Danh mục *</Label>
              <Select value={formData.category_id} onValueChange={v => setFormData({ ...formData, category_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.category_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Giá (VNĐ) *</Label>
              <Input type="text" inputMode="numeric" value={priceDisplay} onChange={handlePriceChange} placeholder="0" className="mt-1 [appearance:textfield]" />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Ảnh thumbnail</Label>
              <div className="mt-1">
                {previewUrl ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-input group">
                    <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={handleRemoveThumbnail}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                      <X size={14} />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm">Đang upload...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video border-2 border-dashed border-input rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
                    <ImagePlus size={32} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Nhấn để chọn ảnh từ máy tính</span>
                    <span className="text-xs text-muted-foreground">JPG, PNG, WEBP — tối đa 5MB</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange} className="hidden" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button onClick={saveForm} disabled={!hasChanges}
              style={{ background: "hsl(var(--admin-approve))", color: "#000", border: "1px solid #9ca3af", opacity: hasChanges ? 1 : 0.4 }}>
              {editCourse ? "Lưu" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}
        title="Xóa khóa học" description={`Xóa khóa học "${deleteTarget?.title}"?`}
        confirmLabel="Xóa" onConfirm={deleteCourse} destructive
      />
    </div>
  );
};

export default AdminCourses;
