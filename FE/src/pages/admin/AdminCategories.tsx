import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import api from "@/services/api";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [formData, setFormData] = useState({ category_name: "", description: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const res = await api.get('/admin/categories');
    setCategories(res.data.categories || []);
  };

  const openAdd = () => {
    setEditItem(null);
    setFormData({ category_name: "", description: "" });
    setFormOpen(true);
  };

  const openEdit = (c: any) => {
    setEditItem(c);
    setFormData({ category_name: c.category_name, description: c.description || "" });
    setFormOpen(true);
  };

  const saveForm = async () => {
    if (!formData.category_name.trim()) return;
    try {
      if (editItem) {
        await api.put(`/admin/categories/${editItem.id}`, formData);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await api.post('/admin/categories', formData);
        toast.success("Thêm danh mục thành công!");
      }
      setFormOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Thao tác thất bại");
    }
  };

  const deleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      toast.success("Đã xóa danh mục!");
      setDeleteTarget(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="gap-1.5" style={{ background: "hsl(var(--admin-approve))" }}>
          <Plus size={16} /> Thêm danh mục
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {categories.length === 0 ? <AdminEmptyState message="Chưa có danh mục nào." /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                  <TableHead className="text-center">Số khóa học</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(c => (
                  <TableRow key={c.id} className="h-14">
                    <TableCell className="font-medium">{c.category_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{c.description || '—'}</TableCell>
                    <TableCell className="text-center">{c.course_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil size={16} /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeleteTarget(c)}>
                          <Trash2 size={16} style={{ color: "hsl(var(--admin-reject))" }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Tên danh mục *</Label><Input value={formData.category_name} onChange={e => setFormData({ ...formData, category_name: e.target.value })} className="mt-1" /></div>
            <div><Label>Mô tả</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button onClick={saveForm} style={{ background: "hsl(var(--admin-approve))" }}>{editItem ? "Lưu" : "Thêm mới"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}
        title="Xóa danh mục" description={`Xóa danh mục "${deleteTarget?.category_name}"? Chỉ xóa được nếu không có khóa học nào.`}
        confirmLabel="Xóa" onConfirm={deleteCategory} destructive />
    </div>
  );
};

export default AdminCategories;
