import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const typeConfig: Record<string, { bg: string; emoji: string; label: string }> = {
  enrollment_approved:  { bg: 'bg-green-500',  emoji: '✅', label: 'Duyệt' },
  enrollment_rejected:  { bg: 'bg-red-500',    emoji: '❌', label: 'Từ chối' },
  new_enrollment:       { bg: 'bg-blue-500',   emoji: '📋', label: 'Ghi danh' },
  new_review:           { bg: 'bg-yellow-500', emoji: '⭐', label: 'Đánh giá' },
  review_reminder:      { bg: 'bg-orange-500', emoji: '💬', label: 'Nhắc nhở' },
  course_completed:     { bg: 'bg-emerald-500',emoji: '🎉', label: 'Hoàn thành' },
  new_lesson:           { bg: 'bg-indigo-500', emoji: '📚', label: 'Bài mới' },
  new_support_ticket:   { bg: 'bg-rose-500',   emoji: '🎫', label: 'Hỗ trợ' },
  payment_reported:     { bg: 'bg-orange-500', emoji: '💳', label: 'Thanh toán' },
  payment_confirmed:    { bg: 'bg-green-500',  emoji: '✅', label: 'Xác nhận' },
  payment_cancelled:    { bg: 'bg-red-500',    emoji: '❌', label: 'Hủy đơn' },
  new_sale:             { bg: 'bg-emerald-500',emoji: '💰', label: 'Doanh thu' },
  withdrawal_request:   { bg: 'bg-blue-500',   emoji: '📤', label: 'Rút tiền' },
  withdrawal_completed: { bg: 'bg-green-500',  emoji: '💸', label: 'Rút tiền' },
  withdrawal_rejected:  { bg: 'bg-red-500',    emoji: '🚫', label: 'Từ chối' },
  default:              { bg: 'bg-primary',    emoji: '🔔', label: 'TB' },
};

function getTypeConfig(type: string) {
  return typeConfig[type] || typeConfig.default;
}

const PREVIEW_LIMIT = 5;

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  if (!isAuthenticated) return null;

  const preview = notifications.slice(0, PREVIEW_LIMIT);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(o => !o)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <span className="font-semibold text-sm text-foreground">Thông Báo Mới Nhận</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-border">
            {preview.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">
                Không có thông báo nào
              </p>
            ) : (
              preview.map(n => {
                const cfg = getTypeConfig(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    {/* Icon box */}
                    <div className={`${cfg.bg} w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl`}>
                      {cfg.emoji}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-snug line-clamp-1 ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                      </p>
                    </div>

                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block w-full text-center text-sm font-medium text-foreground py-3 hover:bg-muted/50 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
