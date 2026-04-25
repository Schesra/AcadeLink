import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mail, Lock, GraduationCap, BookOpen,
  Eye, EyeOff, Check, AlertCircle, Calendar,
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-orange-500", "bg-blue-500", "bg-green-500",
  "bg-purple-500", "bg-pink-500", "bg-teal-500",
];
function getAvatarColor(name: string) {
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

const Profile = () => {
  const { user, isAuthenticated, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: "Lỗi", description: "Họ và tên không được để trống", variant: "destructive" });
      return;
    }
    setProfileLoading(true);
    try {
      const data = await userService.updateProfile({ full_name: fullName.trim(), bio: bio.trim() });
      updateUser({ full_name: data.user.full_name, bio: data.user.bio });
      toast({ title: "Đã lưu", description: "Cập nhật hồ sơ thành công" });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.response?.data?.message || "Không thể cập nhật hồ sơ",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    try {
      await userService.changePassword({ current_password: currentPw, new_password: newPw });
      toast({ title: "Thành công", description: "Đổi mật khẩu thành công" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.response?.data?.message || "Không thể đổi mật khẩu",
        variant: "destructive",
      });
    } finally {
      setPwLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user) return null;

  const isInstructor = user.roles?.includes("instructor");
  const avatarColor = getAvatarColor(user.full_name || user.username);
  const avatarInitial = (user.full_name || user.username || "U").charAt(0).toUpperCase();
  const joinedDate = new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long" });

  // Password strength helpers
  const pwChecks = [
    { label: "Ít nhất 8 ký tự", ok: newPw.length >= 8 },
    { label: "Chữ hoa và chữ thường", ok: /[a-z]/.test(newPw) && /[A-Z]/.test(newPw) },
    { label: "Có chữ số", ok: /\d/.test(newPw) },
    { label: "Ký tự đặc biệt (@$!%*?&)", ok: /[@$!%*?&]/.test(newPw) },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-10 flex-1 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">Hồ sơ của tôi</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: identity card */}
          <div className="md:col-span-1 space-y-4">
            {/* Avatar card */}
            <div className="bg-card rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              <div className={`h-20 w-20 rounded-full ${avatarColor} flex items-center justify-center text-white text-3xl font-bold mb-4`}>
                {avatarInitial}
              </div>
              <p className="font-semibold text-foreground text-lg leading-tight">{user.full_name || user.username}</p>
              <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>

              {/* Role badges */}
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                  <BookOpen size={12} /> Học viên
                </span>
                {isInstructor && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <GraduationCap size={12} /> Giảng viên
                  </span>
                )}
              </div>

              <Separator className="my-4 w-full" />

              <div className="w-full space-y-2 text-sm text-left">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} className="shrink-0" />
                  <span>Tham gia {joinedDate}</span>
                </div>
              </div>

              {bio && (
                <>
                  <Separator className="my-4 w-full" />
                  <p className="text-sm text-muted-foreground text-left w-full italic">"{bio}"</p>
                </>
              )}
            </div>

            {/* Instructor callout */}
            {isInstructor && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Tài khoản Giảng viên</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Thông tin hồ sơ bên dưới được dùng chung cho cả vai trò Học viên và Giảng viên.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                  onClick={() => navigate("/instructor/dashboard")}
                >
                  Trang quản lý GV
                </Button>
              </div>
            )}
          </div>

          {/* Right column: forms */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic info form */}
            <div className="bg-card rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <User size={18} className="text-primary" />
                <h2 className="text-base font-semibold text-foreground">Thông tin cơ bản</h2>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Họ và tên <span className="text-destructive">*</span></Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input id="username" value={user.username} disabled className="opacity-60 cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled className="opacity-60 cursor-not-allowed" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Giới thiệu bản thân</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Viết vài dòng về bản thân bạn..."
                    rows={3}
                    maxLength={500}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Change password form */}
            <div className="bg-card rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lock size={18} className="text-primary" />
                <h2 className="text-base font-semibold text-foreground">Đổi mật khẩu</h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current password */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPw">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="currentPw"
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPw">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPw"
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength checklist */}
                  {newPw && (
                    <ul className="mt-2 space-y-1">
                      {pwChecks.map(c => (
                        <li key={c.label} className={`flex items-center gap-2 text-xs ${c.ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                          {c.ok ? <Check size={12} /> : <AlertCircle size={12} />}
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPw">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="confirmPw"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className={`pr-10 ${confirmPw && newPw !== confirmPw ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPw && newPw !== confirmPw && (
                    <p className="text-xs text-destructive">Mật khẩu không khớp</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                    variant="outline"
                  >
                    {pwLoading ? "Đang đổi..." : "Đổi mật khẩu"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
