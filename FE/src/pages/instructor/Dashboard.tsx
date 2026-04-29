import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, PlusCircle, Clock, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import api from "@/services/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { withdrawalService, BankAccount, Withdrawal } from "@/services/withdrawalService";
import { LinkBankDialog, WithdrawDialog } from "@/components/instructor/WithdrawDialogs";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const Dashboard = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<{
    total_revenue: number;
    total_withdrawn: number;
    available_balance: number;
    total_students: number;
    course_stats: any[];
    recent_transactions: any[];
  } | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [showLinkBankDialog, setShowLinkBankDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchEarningsAndBank = useCallback(async () => {
    const [earningsRes, bankRes, withdrawalsRes] = await Promise.all([
      api.get("/instructor/earnings"),
      withdrawalService.getBankAccount(),
      withdrawalService.getWithdrawals(),
    ]);
    setEarnings(earningsRes.data);
    setBankAccount(bankRes.bank_account);
    setWithdrawals(withdrawalsRes.withdrawals);
  }, []);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.get("/instructor/courses"),
      fetchEarningsAndBank(),
    ])
      .then(async ([coursesRes]) => {
        const fetchedCourses = coursesRes.data.courses || [];
        setCourses(fetchedCourses);

        // Lấy enrollments pending
        const allEnrollments: any[] = [];
        await Promise.all(
          fetchedCourses.map(async (course: any) => {
            try {
              const res = await api.get(`/instructor/enrollments?course_id=${course.id}&status=pending`);
              allEnrollments.push(
                ...(res.data.enrollments || []).map((e: any) => ({ ...e, course_title: course.title }))
              );
            } catch {}
          })
        );
        setEnrollments(allEnrollments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location.key, fetchEarningsAndBank]);

  const pendingCount = enrollments.filter((e) => e.status === "pending").length;
  const availableBalance = earnings?.available_balance ?? 0;
  const totalStudents = earnings?.total_students ?? courses.reduce((s, c) => s + (c.student_count || 0), 0);

  const handleWithdrawClick = () => {
    if (!bankAccount) {
      setShowLinkBankDialog(true);
    } else {
      setShowWithdrawDialog(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Giảng viên</h1>
          <Link to="/instructor/courses/new">
            <Button className="gap-2"><PlusCircle size={16} /> Tạo khóa học</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Số dư khả dụng */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Số dư khả dụng</p>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold">
              {loading ? "—" : fmt(availableBalance)}
            </p>
            <p className="text-xs opacity-75 mt-1">
              Tổng thu: {loading ? "—" : fmt(earnings?.total_revenue ?? 0)} · Đã rút: {loading ? "—" : fmt(earnings?.total_withdrawn ?? 0)}
            </p>
            <button
              onClick={handleWithdrawClick}
              disabled={loading || availableBalance <= 0}
              className="mt-4 w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowDownLeft size={15} /> Rút tiền
            </button>
          </div>

          {/* Khóa học */}
          <div className="bg-card rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Khóa học</p>
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                <BookOpen size={18} className="text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : courses.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Đang hoạt động</p>
          </div>

          {/* Học viên */}
          <div className="bg-card rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Học viên</p>
              <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users size={18} className="text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : totalStudents}</p>
            <p className="text-xs text-muted-foreground mt-1">Đã được duyệt</p>
          </div>

          {/* Chờ duyệt */}
          <div className="bg-card rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock size={18} className="text-warning" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Yêu cầu mới</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Doanh thu theo khóa học */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" /> Doanh thu theo khóa học
              </h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
              </div>
            ) : earnings?.course_stats.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Chưa có doanh thu</p>
            ) : (
              <div className="space-y-3">
                {earnings?.course_stats.map((c) => {
                  const maxRevenue = Math.max(...(earnings.course_stats.map(x => Number(x.revenue))), 1);
                  const pct = (Number(c.revenue) / maxRevenue) * 100;
                  return (
                    <div key={c.course_id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground font-medium line-clamp-1 flex-1 mr-4">{c.title}</span>
                        <div className="flex items-center gap-4 shrink-0 text-muted-foreground text-xs">
                          <span>{c.approved_count} học viên</span>
                          <span className="font-semibold text-foreground">{fmt(Number(c.revenue))}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Giao dịch gần nhất */}
          <div className="bg-card rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <ArrowUpRight size={18} className="text-green-500" /> Giao dịch gần đây
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
              </div>
            ) : earnings?.recent_transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Chưa có giao dịch</p>
            ) : (
              <div className="space-y-3">
                {earnings?.recent_transactions.map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowUpRight size={14} className="text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {t.student_name || t.student_username}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{t.course_title}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: vi })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-500 shrink-0">
                      +{fmt(Number(t.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Yêu cầu chờ duyệt */}
        {pendingCount > 0 && (
          <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Yêu cầu đăng ký chờ duyệt</h2>
              <Link to="/instructor/enrollments">
                <Button variant="ghost" size="sm">Xem tất cả</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {enrollments.filter((e) => e.status === "pending").slice(0, 5).map((e) => (
                <div key={e.enrollment_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{e.student_name}</p>
                    <p className="text-xs text-muted-foreground">{e.course_title}</p>
                  </div>
                  <Link to="/instructor/enrollments">
                    <Button size="sm" variant="outline">Xem</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lịch sử rút tiền */}
        {withdrawals.length > 0 && (
          <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ArrowDownLeft size={18} className="text-primary" /> Lịch sử rút tiền
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-muted-foreground font-medium">Số tiền</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Tài khoản</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Trạng thái</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.slice(0, 10).map((w) => (
                    <tr key={w.id} className="border-b last:border-0">
                      <td className="py-3 font-semibold text-foreground">{fmt(Number(w.amount))}</td>
                      <td className="py-3 text-muted-foreground">
                        <p className="font-medium text-foreground text-xs">{w.account_name}</p>
                        <p className="text-xs">{w.bank_account} · {w.bank_name}</p>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          w.status === 'completed'    ? 'bg-green-500/10 text-green-600' :
                          w.status === 'rejected'     ? 'bg-red-500/10 text-red-600' :
                          w.status === 'approved'     ? 'bg-blue-500/10 text-blue-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {({ completed: 'Hoàn thành', rejected: 'Bị từ chối', approved: 'Đã duyệt', pending_admin: 'Chờ duyệt' } as Record<string,string>)[w.status] ?? 'Chờ duyệt'}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(w.created_at), { addSuffix: true, locale: vi })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Danh sách khóa học */}
        <div className="bg-card rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Khóa học của tôi</h2>
            <Link to="/instructor/courses">
              <Button variant="ghost" size="sm">Xem tất cả</Button>
            </Link>
          </div>
          {loading ? (
            <p className="text-muted-foreground text-sm">Đang tải...</p>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground mb-4">Bạn chưa có khóa học nào</p>
              <Link to="/instructor/courses/new">
                <Button className="gap-2"><PlusCircle size={16} /> Tạo khóa học đầu tiên</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.category_name} · {course.student_count || 0} học viên · {fmt(Number(course.price))}
                    </p>
                  </div>
                  <Link to={`/instructor/courses/${course.id}/edit`} className="ml-3 shrink-0">
                    <Button size="sm" variant="outline">Quản lý</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {showLinkBankDialog && (
        <LinkBankDialog
          onSuccess={(bank) => {
            setBankAccount(bank);
            setShowLinkBankDialog(false);
            setShowWithdrawDialog(true);
          }}
          onClose={() => setShowLinkBankDialog(false)}
        />
      )}

      {showWithdrawDialog && bankAccount && (
        <WithdrawDialog
          availableBalance={availableBalance}
          bankAccount={bankAccount}
          onSuccess={() => {
            setShowWithdrawDialog(false);
            fetchEarningsAndBank();
          }}
          onClose={() => setShowWithdrawDialog(false)}
          onChangeBankAccount={() => {
            setShowWithdrawDialog(false);
            setShowLinkBankDialog(true);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
