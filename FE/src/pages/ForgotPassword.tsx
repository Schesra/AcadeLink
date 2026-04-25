import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import api from "@/services/api";

type Step = "email" | "otp" | "password" | "done";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    { label: "Ít nhất 8 ký tự", ok: newPassword.length >= 8 },
    { label: "Có chữ hoa", ok: /[A-Z]/.test(newPassword) },
    { label: "Có chữ thường", ok: /[a-z]/.test(newPassword) },
    { label: "Có chữ số", ok: /\d/.test(newPassword) },
    { label: "Có ký tự đặc biệt (@$!%*?&)", ok: /[@$!%*?&]/.test(newPassword) },
  ];
  const passwordValid = passwordRules.every((r) => r.ok);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setStep("otp");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      await api.post("/auth/reset-password", { email, otp, newPassword });
      setStep("done");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Đặt lại mật khẩu thất bại",
        variant: "destructive",
      });
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

        {/* Step 1: Email */}
        {step === "email" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-card-foreground mb-1">Quên mật khẩu?</h1>
              <p className="text-muted-foreground text-sm">
                Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã xác thực 6 chữ số về email đó.
              </p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">Email</Label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 focus-visible:ring-primary"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi mã xác thực"}
              </Button>
            </form>
            <div className="mt-5 text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </Link>
            </div>
          </>
        )}

        {/* Step 2: OTP + New Password */}
        {(step === "otp" || step === "password") && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-card-foreground mb-1">Đặt mật khẩu mới</h1>
              <p className="text-muted-foreground text-sm">
                Mã xác thực đã được gửi đến <strong className="text-foreground">{email}</strong>.
                Nhập mã và mật khẩu mới để hoàn tất.
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* OTP */}
              <div>
                <Label htmlFor="otp" className="text-sm font-semibold text-muted-foreground">Mã xác thực (6 chữ số)</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-1 text-center text-2xl tracking-widest font-mono focus-visible:ring-primary"
                  required
                  autoFocus
                />
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="newPassword" className="text-sm font-semibold text-muted-foreground">Mật khẩu mới</Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 focus-visible:ring-primary"
                    required
                  />
                  <button type="button" tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-muted-foreground">Xác nhận mật khẩu</Label>
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
                disabled={loading || otp.length !== 6 || !passwordValid || !passwordsMatch}
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setNewPassword(""); setConfirmPassword(""); }}
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Thay đổi email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Gửi lại mã
              </button>
            </div>
          </>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
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
      </div>
    </div>
  );
};

export default ForgotPassword;
