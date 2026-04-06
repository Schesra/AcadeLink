import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ username, password });

      if (response.token && response.user) {
        login(response.token, response.user);
        toast({
          title: "Thành công",
          description: "Đăng nhập thành công!",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Đăng nhập thất bại",
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
          <Link to="/" className="text-3xl font-bold text-primary">AcadeLink</Link>
          <h1 className="text-2xl font-bold text-card-foreground mt-4">Đăng nhập</h1>
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
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
