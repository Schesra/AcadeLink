import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { cartService, CartItem } from '@/services/cartService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Trash2, BookOpen, X } from 'lucide-react';

const BE_URL = 'http://localhost:3000';
const imgSrc = (url: string | null) => {
  if (!url) return '/placeholder.svg';
  return url.startsWith('http') ? url : `${BE_URL}${url}`;
};

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { refresh } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      setItems(data.items);
      setTotal(data.total);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải giỏ hàng', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchCart();
  }, [isAuthenticated]);

  const handleRemove = async (course_id: number) => {
    setRemoving(course_id);
    try {
      await cartService.removeFromCart(course_id);
      setItems(prev => prev.filter(i => i.course_id !== course_id));
      setTotal(prev => {
        const item = items.find(i => i.course_id === course_id);
        return prev - (item ? Number(item.price) : 0);
      });
      refresh();
      toast({ title: 'Đã xóa', description: 'Đã xóa khóa học khỏi giỏ hàng' });
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xóa khỏi giỏ hàng', variant: 'destructive' });
    } finally {
      setRemoving(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const data = await cartService.checkout();
      refresh();
      if (data.order?.id) {
        toast({ title: 'Đặt hàng thành công!', description: `Đơn hàng ${data.order.order_code} đã được tạo.` });
        navigate(`/payment/${data.order.id}`);
      } else {
        toast({ title: 'Đăng ký thành công!', description: data.message });
        navigate('/my-courses');
      }
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.response?.data?.message || 'Thanh toán thất bại', variant: 'destructive' });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ShoppingCart size={28} /> Giỏ hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            {loading ? 'Đang tải...' : `${items.length} khóa học`}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-4 flex gap-4 animate-pulse border border-border">
                  <div className="w-40 h-24 rounded-lg bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded w-1/4 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-16 text-center max-w-md mx-auto">
            <ShoppingCart size={64} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-foreground">Giỏ hàng trống</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Hãy thêm khóa học bạn muốn học vào giỏ hàng</p>
            <Link to="/courses">
              <Button>Khám phá khóa học</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Danh sách */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.course_id} className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-sm transition-shadow">
                  <Link to={`/courses/${item.course_id}`} className="shrink-0">
                    <img
                      src={imgSrc(item.thumbnail_url)}
                      alt={item.title}
                      className="w-40 h-24 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/courses/${item.course_id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.instructor_name || item.instructor_username}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <BookOpen size={12} className="inline mr-1" />{item.lesson_count} bài học
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary">
                        {Number(item.price) === 0 ? 'Miễn phí' : `${Number(item.price).toLocaleString('vi-VN')}₫`}
                      </span>
                      <button
                        onClick={() => handleRemove(item.course_id)}
                        disabled={removing === item.course_id}
                        className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
                      >
                        {removing === item.course_id
                          ? <span className="text-xs">Đang xóa...</span>
                          : <><Trash2 size={14} /> Xóa</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="bg-card rounded-xl border border-border p-6 sticky top-20">
              <h2 className="text-lg font-bold text-foreground mb-4">Tổng đơn hàng</h2>
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.course_id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{item.title}</span>
                    <span className="font-medium shrink-0">
                      {Number(item.price) === 0 ? 'Miễn phí' : `${Number(item.price).toLocaleString('vi-VN')}₫`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {total === 0 ? 'Miễn phí' : `${total.toLocaleString('vi-VN')}₫`}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? 'Đang xử lý...' : total > 0 ? 'Tiến hành thanh toán' : 'Đăng ký miễn phí'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {total > 0
                  ? 'Bạn sẽ được chuyển đến trang thanh toán VietQR'
                  : 'Sau khi đăng ký, giảng viên sẽ xét duyệt yêu cầu của bạn'}
              </p>
              <Link to="/courses" className="block text-center text-sm text-primary hover:underline mt-3">
                Tiếp tục khám phá khóa học
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
