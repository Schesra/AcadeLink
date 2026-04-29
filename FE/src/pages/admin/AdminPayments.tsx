import { useState, useEffect } from 'react';
import { paymentService, Order, AdminWithdrawal, AdminBalance } from '@/services/paymentService';
import { withdrawalService, BankAccount } from '@/services/withdrawalService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Wallet, ArrowDownLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LinkBankDialog, WithdrawDialog } from '@/components/instructor/WithdrawDialogs';

const fmt = (n: number) => Number(n).toLocaleString('vi-VN') + '₫';

const orderStatusConfig = {
  pending_payment: { label: 'Chờ xác nhận', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  paid: { label: 'Đã thanh toán', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500/10 text-red-600' },
};

const withdrawalStatusConfig = {
  pending_admin: { label: 'Chờ duyệt', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  approved: { label: 'Đã duyệt', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  completed: { label: 'Hoàn thành', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  rejected: { label: 'Bị từ chối', color: 'bg-red-500/10 text-red-600' },
};

export default function AdminPayments() {
  const [tab, setTab] = useState<'orders' | 'withdrawals' | 'balance'>('orders');

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {(['orders', 'withdrawals', 'balance'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'orders' ? 'Đơn hàng' : t === 'withdrawals' ? 'Rút tiền Giảng viên' : 'Số dư Admin'}
          </button>
        ))}
      </div>

      {tab === 'orders' ? <OrdersTab /> : tab === 'withdrawals' ? <WithdrawalsTab /> : <AdminBalanceTab />}
    </div>
  );
}

// ── Orders Tab ─────────────────────────────────────────────────────────────────

function OrdersTab() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_payment');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await paymentService.adminGetOrders(statusFilter || undefined);
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const confirm = async (id: number) => {
    setProcessing(id);
    try {
      await paymentService.adminConfirmPayment(id);
      toast({ title: 'Đã xác nhận thanh toán', description: 'Học viên đã được cấp quyền truy cập.' });
      load();
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.response?.data?.message || 'Thử lại sau', variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const cancel = async (id: number) => {
    if (!window.confirm(`Hủy đơn hàng #${id}?`)) return;
    setProcessing(id);
    try {
      await paymentService.adminCancelOrder(id);
      toast({ title: 'Đã hủy đơn hàng' });
      load();
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.response?.data?.message || 'Thử lại sau', variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-foreground">Danh sách đơn hàng</h2>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả</option>
          <option value="pending_payment">Chờ xác nhận</option>
          <option value="paid">Đã thanh toán</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
      {loading ? (
        <div className="p-8 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Không có đơn hàng nào</p>
      ) : (
        <div className="divide-y">
          {orders.map(order => {
            const cfg = orderStatusConfig[order.status];
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id}>
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-foreground">{order.order_code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.student_name || order.student_username} · {order.item_count} khóa học · {fmt(Number(order.total_amount))}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: vi })}
                      {order.payment_note && <span className="ml-2 italic">"{order.payment_note}"</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {order.status === 'pending_payment' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => confirm(order.id)}
                          disabled={processing === order.id}
                          className="gap-1"
                        >
                          <CheckCircle2 size={14} />
                          {processing === order.id ? 'Đang xử lý...' : 'Xác nhận'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancel(order.id)}
                          disabled={processing === order.id}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <XCircle size={14} /> Hủy
                        </Button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                {isExpanded && order.items && (
                  <div className="px-4 pb-4 bg-muted/30">
                    <div className="rounded-lg border divide-y">
                      {order.items.map(item => (
                        <div key={item.id} className="p-3 flex items-center justify-between text-sm">
                          <span className="text-foreground font-medium">{item.course_title}</span>
                          <span className="text-muted-foreground">{fmt(Number(item.price))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Withdrawals Tab ────────────────────────────────────────────────────────────

function WithdrawalsTab() {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_admin');
  const [processing, setProcessing] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<{ id: number; reason: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await paymentService.adminGetWithdrawals(statusFilter || undefined);
      setWithdrawals(data.withdrawals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const approve = async (id: number) => {
    setProcessing(id);
    try {
      await paymentService.adminApproveWithdrawal(id);
      toast({ title: 'Đã duyệt yêu cầu rút tiền', description: 'Giảng viên sẽ nhận được thông báo.' });
      load();
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.response?.data?.message || 'Thử lại sau', variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const reject = async (id: number, reason: string) => {
    setProcessing(id);
    try {
      await paymentService.adminRejectWithdrawal(id, reason || undefined);
      toast({ title: 'Đã từ chối yêu cầu rút tiền' });
      setRejectReason(null);
      load();
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.response?.data?.message || 'Thử lại sau', variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-foreground">Yêu cầu rút tiền</h2>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả</option>
          <option value="pending_admin">Chờ duyệt</option>
          <option value="completed">Hoàn thành</option>
          <option value="rejected">Bị từ chối</option>
        </select>
      </div>
      {loading ? (
        <div className="p-8 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : withdrawals.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Không có yêu cầu rút tiền nào</p>
      ) : (
        <div className="divide-y">
          {withdrawals.map(wr => {
            const cfg = withdrawalStatusConfig[wr.status];
            return (
              <div key={wr.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{wr.instructor_name || wr.instructor_username}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-lg font-bold text-primary">{fmt(Number(wr.amount))}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {wr.account_name} · {wr.bank_account} · {wr.bank_name}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {formatDistanceToNow(new Date(wr.created_at), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                  {wr.status === 'pending_admin' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => approve(wr.id)}
                        disabled={processing === wr.id}
                        className="gap-1"
                      >
                        <CheckCircle2 size={14} />
                        {processing === wr.id ? 'Đang xử lý...' : 'Duyệt'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectReason({ id: wr.id, reason: '' })}
                        disabled={processing === wr.id}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <XCircle size={14} /> Từ chối
                      </Button>
                    </div>
                  )}
                </div>
                {/* Reject reason inline input */}
                {rejectReason?.id === wr.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={rejectReason.reason}
                      onChange={e => setRejectReason({ ...rejectReason, reason: e.target.value })}
                      placeholder="Lý do từ chối (tùy chọn)..."
                      className="flex-1 text-sm border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => reject(wr.id, rejectReason.reason)}
                      disabled={processing === wr.id}
                    >
                      Xác nhận từ chối
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRejectReason(null)}>Hủy</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Admin Balance Tab ──────────────────────────────────────────────────────────

function AdminBalanceTab() {
  const { toast } = useToast();
  const [balance, setBalance] = useState<AdminBalance | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLinkBank, setShowLinkBank] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [balData, bankData] = await Promise.all([
        paymentService.adminGetBalance(),
        withdrawalService.getBankAccount(),
      ]);
      setBalance(balData);
      setBankAccount(bankData.bank_account);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải dữ liệu', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleWithdrawClick = () => {
    if (!bankAccount) setShowLinkBank(true);
    else setShowWithdraw(true);
  };

  const handleWithdrawSuccess = async () => {
    setShowWithdraw(false);
    await load();
    toast({ title: 'Rút tiền thành công!' });
  };

  // Override: dùng paymentService.adminCreateWithdrawal thay vì withdrawalService.createWithdrawal
  // Truyền custom onSuccess để gọi đúng API
  const AdminWithdrawDialog = showWithdraw && bankAccount ? (
    <AdminWithdrawDialogWrapper
      availableBalance={balance?.available_balance ?? 0}
      bankAccount={bankAccount}
      onSuccess={handleWithdrawSuccess}
      onClose={() => setShowWithdraw(false)}
      onChangeBankAccount={() => { setShowWithdraw(false); setShowLinkBank(true); }}
    />
  ) : null;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium opacity-90">Số dư khả dụng</p>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{loading ? '—' : fmt(balance?.available_balance ?? 0)}</p>
          <button
            onClick={handleWithdrawClick}
            disabled={loading || (balance?.available_balance ?? 0) <= 0}
            className="mt-4 w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <ArrowDownLeft size={15} /> Rút tiền
          </button>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-6">
          <p className="text-sm text-muted-foreground mb-1">Tổng doanh thu nền tảng</p>
          <p className="text-2xl font-bold text-foreground">{loading ? '—' : fmt(balance?.total_platform_revenue ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">20% từ tất cả đơn hàng</p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-6">
          <p className="text-sm text-muted-foreground mb-1">Đã rút</p>
          <p className="text-2xl font-bold text-foreground">{loading ? '—' : fmt(balance?.total_withdrawn ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Tổng đã chuyển ra</p>
        </div>
      </div>

      {/* Linked bank account */}
      <div className="bg-card rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground">Tài khoản ngân hàng</h2>
          <button onClick={() => setShowLinkBank(true)} className="text-sm text-primary hover:underline">
            {bankAccount ? 'Thay đổi' : 'Liên kết ngân hàng'}
          </button>
        </div>
        {bankAccount ? (
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{bankAccount.account_name}</p>
              <p className="text-sm text-muted-foreground">{bankAccount.bank_account} · {bankAccount.bank_name}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Chưa liên kết tài khoản ngân hàng</p>
        )}
      </div>

      {/* Withdrawal history */}
      {(balance?.withdrawal_history?.length ?? 0) > 0 && (
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-foreground mb-4">Lịch sử rút tiền</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">Số tiền</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Tài khoản</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {balance!.withdrawal_history.map(w => (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="py-3 font-semibold text-foreground">{fmt(Number(w.amount))}</td>
                    <td className="py-3 text-muted-foreground">
                      <p className="font-medium text-foreground text-xs">{w.account_name}</p>
                      <p className="text-xs">{w.bank_account} · {w.bank_name}</p>
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

      {/* Dialogs */}
      {showLinkBank && (
        <LinkBankDialog
          onSuccess={(bank) => { setBankAccount(bank); setShowLinkBank(false); setShowWithdraw(true); }}
          onClose={() => setShowLinkBank(false)}
        />
      )}
      {AdminWithdrawDialog}
    </div>
  );
}

// WithdrawDialog wrapper dùng admin API thay vì instructor API
function AdminWithdrawDialogWrapper({ availableBalance, bankAccount, onSuccess, onClose, onChangeBankAccount }: {
  availableBalance: number;
  bankAccount: BankAccount;
  onSuccess: () => void;
  onClose: () => void;
  onChangeBankAccount: () => void;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const fmt = (n: number) => Number(n).toLocaleString('vi-VN') + '₫';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '');
    setAmount(raw);
    setAmountDisplay(raw ? Number(raw).toLocaleString('vi-VN') : '');
  };

  const handleWithdraw = async () => {
    const num = Number(amount);
    if (!num || num <= 0) { toast({ title: 'Số tiền không hợp lệ', variant: 'destructive' }); return; }
    if (num > availableBalance) { toast({ title: 'Số dư không đủ', variant: 'destructive' }); return; }
    if (num < 50000) { toast({ title: 'Số tiền tối thiểu là 50.000₫', variant: 'destructive' }); return; }
    setProcessing(true);
    try {
      await paymentService.adminCreateWithdrawal(num);
      setDone(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.response?.data?.message || 'Rút tiền thất bại', variant: 'destructive' });
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Rút tiền thành công!</h2>
          <p className="text-muted-foreground text-sm">
            {fmt(Number(amount))} đã được chuyển đến<br />
            <span className="font-medium text-foreground">{bankAccount.account_name}</span><br />
            <span className="text-xs">{bankAccount.bank_account} · {bankAccount.bank_name}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Rút tiền Admin</h2>
              <p className="text-sm text-muted-foreground">Số dư: <span className="font-semibold text-foreground">{fmt(availableBalance)}</span></p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet size={18} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">{bankAccount.account_name}</p>
                <p className="text-xs text-muted-foreground">{bankAccount.bank_account} · {bankAccount.bank_name}</p>
              </div>
            </div>
            <button onClick={onChangeBankAccount} className="text-xs text-primary hover:underline shrink-0">Thay đổi</button>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Số tiền muốn rút</label>
            <div className="relative mt-1">
              <input
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full border border-input rounded-md px-3 py-2 pr-8 text-lg font-semibold bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₫</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[500000, 1000000, 2000000, 5000000].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setAmount(String(v)); setAmountDisplay(v.toLocaleString('vi-VN')); }}
                  disabled={v > availableBalance}
                  className="flex-1 text-xs py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {(v / 1000000).toFixed(v < 1000000 ? 1 : 0)}tr
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tối thiểu 50.000₫</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={processing} className="flex-1 border border-input rounded-md py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50">Hủy</button>
            <button
              onClick={handleWithdraw}
              disabled={processing || !amount || Number(amount) <= 0}
              className="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownLeft size={15} />
              {processing ? 'Đang xử lý...' : 'Xác nhận rút'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
