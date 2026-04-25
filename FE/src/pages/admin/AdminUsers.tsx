import { useState, useEffect, useMemo } from "react";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import api from "@/services/api";

const roleLabel: Record<string, { label: string; bg: string; color: string }> = {
  admin:      { label: "Admin",      bg: "var(--admin-reject-light)",   color: "var(--admin-reject)" },
  instructor: { label: "Giảng viên", bg: "var(--admin-primary-light)",  color: "var(--admin-primary)" },
  student:    { label: "Học viên",   bg: "var(--admin-approve-light)",  color: "var(--admin-approve)" },
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
      setSelected(new Set());
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  const filtered = useMemo(() =>
    users.filter(u =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const deletableFiltered = useMemo(() =>
    filtered.filter(u => !u.roles?.includes('admin')), [filtered]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === deletableFiltered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(deletableFiltered.map((u) => u.id)));
    }
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      toast.success("Đã xóa người dùng!");
      setDeleteTarget(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Xóa thất bại");
    }
  };

  const bulkDelete = async () => {
    try {
      await Promise.all([...selected].map((id) => api.delete(`/admin/users/${id}`)));
      toast.success(`Đã xóa ${selected.size} người dùng!`);
      setBulkDeleteOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error("Xóa hàng loạt thất bại");
    }
  };

  const allDeletableSelected =
    deletableFiltered.length > 0 && selected.size === deletableFiltered.length;

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm người dùng..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 size={14} /> Xóa {selected.size} người dùng
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? <AdminEmptyState message="Không tìm thấy người dùng nào." /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allDeletableSelected}
                      onCheckedChange={toggleSelectAll}
                      disabled={deletableFiltered.length === 0}
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Vai trò</TableHead>
                  <TableHead className="hidden lg:table-cell">Ngày tham gia</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => {
                  const isDeletable = !u.roles?.includes('admin');
                  const isSelected = selected.has(u.id);
                  return (
                    <TableRow key={u.id} className={`h-14 ${isSelected ? "bg-muted/50" : ""}`}>
                      <TableCell>
                        {isDeletable && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(u.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs font-semibold"
                            style={{ background: "hsl(var(--admin-primary-light))", color: "hsl(var(--admin-primary))" }}>
                            {u.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {u.roles?.split(',').map((r: string) => {
                            const cfg = roleLabel[r] || { label: r, bg: "var(--admin-pending-light)", color: "var(--admin-pending)" };
                            return (
                              <span key={r} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                style={{ background: `hsl(${cfg.bg})`, color: `hsl(${cfg.color})` }}>
                                {cfg.label}
                              </span>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        {isDeletable && (
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeleteTarget(u)}>
                            <Trash2 size={16} style={{ color: "hsl(var(--admin-reject))" }} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}
        title="Xóa người dùng" description={`Xóa người dùng "${deleteTarget?.username}"?`}
        confirmLabel="Xóa" onConfirm={deleteUser} destructive />

      <ConfirmDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}
        title="Xóa hàng loạt" description={`Xóa ${selected.size} người dùng đã chọn?`}
        confirmLabel="Xóa tất cả" onConfirm={bulkDelete} destructive />
    </div>
  );
};

export default AdminUsers;
