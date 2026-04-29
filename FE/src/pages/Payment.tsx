import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paymentService, Order } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle2, XCircle, Copy, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const fmt = (n: number) => Number(n).toLocaleString('vi-VN') + '₫';

const statusConfig = {
  paid: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Đã thanh toán' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Đã hủy' },
  pending_payment: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Chờ thanh toán' },
};

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadOrder = async () => {
    try {
      const data = await paymentService.getOrderById(Number(orderId));
      setOrder(data.order);
      if (data.order.status === 'paid' || data.order.status === 'cancelled') {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch {
      toast({ title: 'Không tìm thấy đơn hàng', variant: 'destructive' });
      navigate('/my-courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // Poll every 15s to detect admin confirmation
    intervalRef.current = setInterval(loadOrder, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [orderId]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `Đã sao chép ${label}` });
  };

  const handleReport = async () => {
    setReporting(true);
    try {
      await paymentService.reportPayment(Number(orderId), paymentNote || undefined);
      setReported(true);
      toast({ title: 'Đã gửi xác nhận', description: 'Admin sẽ kiểm tra và duyệt trong vài phút.' });
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.response?.data?.message || 'Thử lại sau', variant: 'destructive' });
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const cfg = statusConfig[order.status];
  const Icon = cfg.icon;

  // Paid / Cancelled state
  if (order.status === 'paid' || order.status === 'cancelled') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className={`w-20 h-20 rounded-full ${cfg.bg} flex items-center justify-center mx-auto mb-4`}>
              <Icon size={44} className={cfg.color} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {order.status === 'paid' ? 'Thanh toán thành công!' : 'Đơn hàng đã bị hủy'}
            </h2>
            <p className="text-muted-foreground text-sm mb-1">Đơn hàng <span className="font-mono font-semibold text-foreground">{order.order_code}</span></p>
            {order.status === 'paid' && (
              <p className="text-muted-foreground text-sm mb-6">
                {fmt(Number(order.total_amount))} · {order.items?.length ?? 0} khóa học
              </p>
            )}
            <div className="flex gap-3 justify-center">
              {order.status === 'paid' && (
                <Link to="/my-courses">
                  <Button>Vào học ngay</Button>
                </Link>
              )}
              <Link to="/courses">
                <Button variant="outline">Khám phá khóa học</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Pending payment state
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thanh toán đơn hàng</h1>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="font-mono font-semibold text-foreground">{order.order_code}</span>
              {' · '}
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: vi })}
            </p>
          </div>
          <button onClick={loadOrder} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Left: order summary */}
          <div className="md:col-span-3 space-y-4">
            <div className="bg-card rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-foreground mb-4">Khóa học trong đơn hàng</h2>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {item.thumbnail_url && (
                      <img
                        src={item.thumbnail_url.startsWith('http') ? item.thumbnail_url : `http://localhost:3000${item.thumbnail_url}`}
                        alt={item.course_title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground line-clamp-1">{item.course_title}</p>
                      <p className="text-xs text-muted-foreground">{item.instructor_name || item.instructor_username}</p>
                    </div>
                    <span className="font-semibold text-foreground shrink-0">{fmt(Number(item.price))}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="font-semibold text-foreground">Tổng cộng</span>
                <span className="text-xl font-bold text-primary">{fmt(Number(order.total_amount))}</span>
              </div>
            </div>

            {/* Confirmation section */}
            <div className="bg-card rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-foreground mb-3">Sau khi chuyển khoản</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Nhấn nút bên dưới để thông báo cho Admin xác nhận thanh toán của bạn.
              </p>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Ghi chú (tùy chọn): VD — Mã giao dịch ngân hàng..."
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
              <Button
                className="w-full"
                onClick={handleReport}
                disabled={reported || reporting}
              >
                {reporting ? 'Đang gửi...' : reported ? '✓ Đã gửi xác nhận' : 'Xác nhận đã chuyển khoản'}
              </Button>
              {reported && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Admin sẽ kiểm tra và xác nhận. Trang này tự động cập nhật khi được duyệt.
                </p>
              )}
            </div>
          </div>

          {/* Right: VietQR + bank info */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="font-bold text-foreground mb-4 text-center">Quét mã QR để thanh toán</h2>
              {order.vietqr_url && (
                <img
                  src={order.vietqr_url}
                  alt="VietQR"
                  className="w-full rounded-lg border mb-4"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="space-y-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <InfoRow label="Ngân hàng" value={order.platform_bank?.bank_id === 'VCB' ? 'Vietcombank' : order.platform_bank?.bank_id ?? 'Vietcombank'} />
                  <InfoRow
                    label="Số tài khoản"
                    value={order.platform_bank?.account_no ?? '1234567890'}
                    onCopy={() => handleCopy(order.platform_bank?.account_no ?? '1234567890', 'số tài khoản')}
                  />
                  <InfoRow label="Chủ tài khoản" value={order.platform_bank?.account_name ?? 'ACADELINK PLATFORM'} />
                  <InfoRow
                    label="Số tiền"
                    value={fmt(Number(order.total_amount))}
                    onCopy={() => handleCopy(String(Math.round(Number(order.total_amount))), 'số tiền')}
                    highlight
                  />
                  <InfoRow
                    label="Nội dung CK"
                    value={order.order_code}
                    onCopy={() => handleCopy(order.order_code, 'nội dung chuyển khoản')}
                    highlight
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Vui lòng nhập đúng nội dung chuyển khoản để hệ thống xác nhận tự động.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function InfoRow({ label, value, onCopy, highlight }: {
  label: string;
  value: string;
  onCopy?: () => void;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`font-semibold truncate ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>
        {onCopy && (
          <button onClick={onCopy} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
