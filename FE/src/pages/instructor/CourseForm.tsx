import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { courseService } from "@/services/courseService";

const CourseForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    thumbnail_url: "",
  });

  useEffect(() => {
    courseService.getCategories().then((data) => {
      setCategories(data.categories || []);
    });

    if (isEdit) {
      api.get(`/instructor/courses`).then((res) => {
        const course = (res.data.courses || []).find((c: any) => c.id === Number(id));
        if (course) {
          setForm({
            title: course.title || "",
            description: course.description || "",
            price: course.price?.toString() || "",
            category_id: course.category_id?.toString() || "",
            thumbnail_url: course.thumbnail_url || "",
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category_id || form.price === "") {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category_id: Number(form.category_id),
        thumbnail_url: form.thumbnail_url || null,
      };

      if (isEdit) {
        await api.put(`/instructor/courses/${id}`, payload);
        toast({ title: "Thành công", description: "Cập nhật khóa học thành công!" });
      } else {
        const res = await api.post('/instructor/courses', payload);
        toast({ title: "Thành công", description: "Tạo khóa học thành công!" });
        navigate('/instructor/dashboard');
        return;
      }
      navigate('/instructor/dashboard');
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Thao tác thất bại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {isEdit ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
        </h1>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-sm p-6 space-y-5">
          <div>
            <Label htmlFor="title">Tên khóa học *</Label>
            <Input id="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Nhập tên khóa học" className="mt-1" required />
          </div>

          <div>
            <Label htmlFor="category">Danh mục *</Label>
            <select
              id="category"
              value={form.category_id}
              onChange={e => setForm({ ...form, category_id: e.target.value })}
              className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="price">Giá (VNĐ) *</Label>
            <Input id="price" type="number" min="0" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="0" className="mt-1" required />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả nội dung khóa học..."
              rows={4}
              className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <Label htmlFor="thumbnail">URL ảnh thumbnail</Label>
            <Input id="thumbnail" value={form.thumbnail_url}
              onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
              placeholder="https://..." className="mt-1" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Tạo khóa học"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/instructor/dashboard')}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CourseForm;
