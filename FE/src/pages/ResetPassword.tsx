import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import api from "@/services/api";

type TokenState = "checking" | "valid" | "invalid";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token") || "";

  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      return;
    }
    api.get(`/auth/verify-reset-token?token=${token}`)
      .then((res) => setTokenState(res.data.valid ? "valid" : "invalid"))
      .catch(() => setTokenState("invalid"));
  }, [token]);

  const passwordRules = [
    { label: "Ít nhất 8 ký tự", ok: newPassword.length >= 8 },
    { label: "Có chữ hoa", ok: /[A-Z]/.test(newPassword) },
    { label: "Có chữ thường", ok: /[a-z]/.test(newPassword) },
    { label: "Có chữ số", ok: /\d/.test(newPassword) },
    { label: "Có ký tự đặc biệt (@$!%*?&)", ok: /[@$!%*?&]/.test(newPassword) },
  ];
  const passwordValid = passwordRules.every((r) => r.ok);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      toast({ title: "Lỗi", description: "Mật khẩu không đủ điều kiện", variant: "destructive" });
      return;
    }
    if (!passwordsMatch) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Đặt lại mật khẩu thất bại",
        variant: "destructive",
      });
      if (error.response?.status === 400) setTokenState("invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-md p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
            <img src="/src/assets/Logo.png" alt="logo" className="h-10 w-10 object-contain" />
            AcadeLink
          </Link>
        </div>

        {/* Đang kiểm tra token */}
        {tokenState === "checking" && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Đang xác thực đường dẫn...</p>
          </div>
        )}

        {/* Token không hợp lệ */}
        {tokenState === "invalid" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-card-foreground mb-2">Đường dẫn không hợp lệ</h1>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Đường dẫn đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.
              <br />
              Vui lòng gửi lại yêu cầu đặt lại mật khẩu.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full mb-3">Gửi lại email</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft size={16} /> Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        )}

        {/* Đặt lại thành công */}
        {tokenState === "valid" && done && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-card-foreground mb-2">Đặt lại thành công!</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Mật khẩu của bạn đã được cập nhật.
              <br />
              Đang chuyển hướng đến trang đăng nhập...
            </p>
            <Link to="/login">
              <Button className="w-full">Đăng nhập ngay</Button>
            </Link>
          </div>
        )}

        {/* Form đặt mật khẩu mới */}
        {tokenState === "valid" && !done && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-card-foreground mb-1">Đặt mật khẩu mới</h1>
              <p className="text-muted-foreground text-sm">Nhập mật khẩu mới cho tài khoản của bạn.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mật khẩu mới */}
              <div>
                <Label htmlFor="newPassword" className="text-sm font-semibold text-muted-foreground">
                  Mật khẩu mới
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 focus-visible:ring-primary"
                    required
                    autoFocus
                  />
                  <button type="button" tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password rules */}
                {newPassword.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordRules.map((rule) => (
                      <li key={rule.label} className={`flex items-center gap-2 text-xs ${rule.ok ? "text-green-600" : "text-muted-foreground"}`}>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${rule.ok ? "bg-green-500 border-green-500" : "border-muted-foreground/40"}`}>
                          {rule.ok && <span className="text-white text-[9px] font-bold">✓</span>}
                        </span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-muted-foreground">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pr-10 focus-visible:ring-primary ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-green-500 focus-visible:ring-green-500"
                          : "border-red-400 focus-visible:ring-red-400"
                        : ""
                    }`}
                    required
                  />
                  <button type="button" tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không khớp</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loading || !passwordValid || !passwordsMatch}
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link to="/login"
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
