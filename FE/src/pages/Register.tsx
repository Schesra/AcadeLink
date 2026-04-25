import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !fullName || !email || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        username,
        email,
        password,
        full_name: fullName,
      });

      toast({
        title: "Thành công",
        description: "Đăng ký tài khoản thành công!",
      });

      // Redirect to login after registration
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Đăng ký thất bại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
            <img src="/src/assets/Logo.png" alt="logo" className="h-10 w-10 object-contain" />
            AcadeLink
          </Link>
          <h1 className="text-2xl font-bold text-card-foreground mt-4">Đăng ký</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-sm font-semibold text-muted-foreground">Tên đăng nhập</Label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 focus-visible:ring-primary"
              required
            />
          </div>
          <div>
            <Label htmlFor="fullName" className="text-sm font-semibold text-muted-foreground">Họ và tên</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 focus-visible:ring-primary"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 focus-visible:ring-primary"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-semibold text-muted-foreground">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 focus-visible:ring-primary"
              required
            />
          </div>
          <Button type="submit" className="w-full mt-6 text-base font-semibold py-3" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
