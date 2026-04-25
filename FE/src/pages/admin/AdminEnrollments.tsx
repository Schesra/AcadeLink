import { useState, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { toast } from "sonner";
import api from "@/services/api";

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const res = await api.get('/admin/enrollments');
    setEnrollments(res.data.enrollments || []);
    setSelected(new Set());
  };

  const filtered = enrollments.filter(e => {
    const matchSearch = e.username?.toLowerCase().includes(search.toLowerCase()) ||
      e.course_title?.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "all" || e.status === tab;
    return matchSearch && matchTab;
  });

  const pendingFiltered = filtered.filter(e => e.status === "pending");

  const changeStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/enrollments/${id}`, { status });
      toast.success(status === "approved" ? "Đã duyệt ghi danh!" : "Đã từ chối ghi danh!");
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Thao tác thất bại");
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === pendingFiltered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingFiltered.map((e) => e.id)));
    }
  };

  const bulkChangeStatus = async (status: "approved" | "rejected") => {
    try {
      await Promise.all([...selected].map((id) => api.put(`/admin/enrollments/${id}`, { status })));
      toast.success(status === "approved"
        ? `Đã duyệt ${selected.size} ghi danh!`
        : `Đã từ chối ${selected.size} ghi danh!`);
      fetchData();
    } catch {
      toast.error("Thao tác hàng loạt thất bại");
    }
  };

  const allPendingSelected = pendingFiltered.length > 0 && selected.size === pendingFiltered.length;

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tìm học viên hoặc khóa học..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelected(new Set()); }}>
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
                <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
                <TabsTrigger value="rejected">Từ chối</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Đã chọn {selected.size} ghi danh:</span>
              <Button
                size="sm"
                className="gap-1.5 h-7"
                style={{ background: "hsl(var(--admin-approve))" }}
                onClick={() => bulkChangeStatus("approved")}
              >
                <Check size={13} /> Duyệt tất cả
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 h-7"
                onClick={() => bulkChangeStatus("rejected")}
              >
                <X size={13} /> Từ chối tất cả
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? <AdminEmptyState message="Không tìm thấy ghi danh nào." /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    {pendingFiltered.length > 0 && (
                      <Checkbox
                        checked={allPendingSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    )}
                  </TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Khóa học</TableHead>
                  <TableHead className="hidden sm:table-cell">Ngày đăng ký</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => {
                  const isPending = e.status === "pending";
                  const isSelected = selected.has(e.id);
                  return (
                    <TableRow key={e.id} className={`h-14 ${isSelected ? "bg-muted/50" : ""}`}>
                      <TableCell>
                        {isPending && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(e.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{e.username}</TableCell>
                      <TableCell className="text-muted-foreground">{e.course_title}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {new Date(e.enrolled_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-center"><AdminStatusBadge status={e.status} /></TableCell>
                      <TableCell className="text-right">
                        {isPending && (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => changeStatus(e.id, "approved")}>
                              <Check size={16} style={{ color: "hsl(var(--admin-approve))" }} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => changeStatus(e.id, "rejected")}>
                              <X size={16} style={{ color: "hsl(var(--admin-reject))" }} />
                            </Button>
                          </div>
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
    </div>
  );
};

export default AdminEnrollments;
