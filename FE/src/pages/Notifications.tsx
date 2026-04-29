import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const typeConfig: Record<string, { bg: string; emoji: string }> = {
  enrollment_approved:  { bg: 'bg-green-500',  emoji: '✅' },
  enrollment_rejected:  { bg: 'bg-red-500',    emoji: '❌' },
  new_enrollment:       { bg: 'bg-blue-500',   emoji: '📋' },
  new_review:           { bg: 'bg-yellow-500', emoji: '⭐' },
  review_reminder:      { bg: 'bg-orange-500', emoji: '💬' },
  course_completed:     { bg: 'bg-emerald-500',emoji: '🎉' },
  new_lesson:           { bg: 'bg-indigo-500', emoji: '📚' },
  new_support_ticket:   { bg: 'bg-rose-500',   emoji: '🎫' },
  payment_reported:     { bg: 'bg-orange-500', emoji: '💳' },
  payment_confirmed:    { bg: 'bg-green-500',  emoji: '✅' },
  payment_cancelled:    { bg: 'bg-red-500',    emoji: '❌' },
  new_sale:             { bg: 'bg-emerald-500',emoji: '💰' },
  withdrawal_request:   { bg: 'bg-blue-500',   emoji: '📤' },
  withdrawal_completed: { bg: 'bg-green-500',  emoji: '💸' },
  withdrawal_rejected:  { bg: 'bg-red-500',    emoji: '🚫' },
  default:              { bg: 'bg-primary',    emoji: '🔔' },
};

function getTypeConfig(type: string) {
  return typeConfig[type] || typeConfig.default;
}

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
    else setLoading(false);
  }, [isAuthenticated]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-muted py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Thông báo</h1>
            <p className="text-muted-foreground mt-1">
              {loading ? 'Đang tải...' : `${notifications.length} thông báo${unreadCount > 0 ? ` · ${unreadCount} chưa đọc` : ''}`}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 flex-1 max-w-2xl">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 flex gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card rounded-xl p-16 text-center">
            <Bell size={64} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-foreground">Chưa có thông báo nào</p>
            <p className="text-sm text-muted-foreground mt-1">Các thông báo về khóa học sẽ xuất hiện tại đây</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm divide-y divide-border">
            {notifications.map(n => {
              const cfg = getTypeConfig(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`flex gap-4 px-5 py-4 cursor-pointer hover:bg-muted/40 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className={`${cfg.bg} w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl`}>
                    {cfg.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {n.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                    </p>
                  </div>

                  {!n.is_read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
