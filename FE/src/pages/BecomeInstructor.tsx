import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { DollarSign, Globe, TrendingUp, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const benefits = [
  { icon: <DollarSign size={48} className="text-primary" />, title: "Thu nhập hấp dẫn", desc: "Kiếm thu nhập thụ động từ các khóa học bạn tạo ra." },
  { icon: <Globe size={48} className="text-primary" />, title: "Tiếp cận toàn cầu", desc: "Chia sẻ kiến thức đến hàng nghìn học viên khắp nơi." },
  { icon: <TrendingUp size={48} className="text-primary" />, title: "Phát triển sự nghiệp", desc: "Xây dựng thương hiệu cá nhân và mở rộng mạng lưới." },
];

const steps = [
  { title: "Đăng nhập tài khoản", desc: "Đăng nhập vào tài khoản student của bạn." },
  { title: "Gửi yêu cầu", desc: "Nhấn nút đăng ký để gửi yêu cầu trở thành giảng viên." },
  { title: "Tạo khóa học", desc: "Sau khi được duyệt, bắt đầu tạo và quản lý khóa học." },
];

const BecomeInstructor = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAlreadyInstructor = user?.roles?.includes('instructor');

  const handleBecome = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await api.post('/instructor/become');

      // Refresh token để cập nhật roles mới
      const refreshRes = await api.post('/auth/refresh-token');
      login(refreshRes.data.token, refreshRes.data.user);

      setSuccess(true);
      toast({
        title: "Thành công",
        description: "Bạn đã trở thành giảng viên! Hãy chuyển sang chế độ Giảng viên.",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Gửi yêu cầu thất bại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-muted py-12 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Trở thành Giảng viên</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chia sẻ kiến thức, truyền cảm hứng và tạo thu nhập cùng AcadeLink.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="bg-card rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-center mb-4">{b.icon}</div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-6">Cách thức hoạt động</h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-gradient-to-r from-primary to-warning rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">Sẵn sàng bắt đầu?</h2>
            <p className="text-lg text-primary-foreground/90 mb-6">Tham gia cùng hàng trăm giảng viên trên AcadeLink.</p>

            {isAlreadyInstructor ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <CheckCircle size={24} />
                  <span className="text-lg font-semibold">Bạn đã là giảng viên!</span>
                </div>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <CheckCircle size={24} />
                  <span className="text-lg font-semibold">Yêu cầu đã được gửi thành công!</span>
                </div>
                <p className="text-sm text-primary-foreground/75">Tài khoản của bạn đã được nâng cấp lên giảng viên.</p>
              </div>
            ) : isAuthenticated ? (
              <Button variant="hero" size="lg" onClick={handleBecome} disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng ký trở thành giảng viên"}
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Link to="/login">
                  <Button variant="hero" size="lg">Đăng nhập để đăng ký</Button>
                </Link>
                <p className="text-sm text-primary-foreground/75">
                  Chưa có tài khoản?{" "}
                  <Link to="/register" className="underline font-medium">Đăng ký ngay</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeInstructor;
