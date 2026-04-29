import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupportTicketModal from '@/components/SupportTicketModal';
import { Badge } from '@/components/ui/badge';
import { supportService, SupportTicket } from '@/services/supportService';
import { useToast } from '@/hooks/use-toast';

const STATUS_LABEL: Record<string, string> = {
  open: 'Mở',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
  closed: 'outline',
};

export default function SupportTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const data = await supportService.getMyTickets();
      setTickets(data.tickets);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách ticket', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Yêu cầu hỗ trợ của tôi</h1>
            <SupportTicketModal />
          </div>

          {loading ? (
            <p className="text-muted-foreground">Đang tải...</p>
          ) : tickets.length === 0 ? (
            <div className="bg-card rounded-lg p-10 text-center text-muted-foreground">
              Bạn chưa có yêu cầu hỗ trợ nào.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(t => (
                <div key={t.id} className="bg-card rounded-lg p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{t.subject}</p>
                      {t.course_title && (
                        <p className="text-xs text-muted-foreground mt-0.5">Khóa học: {t.course_title}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.description}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[t.status]} className="shrink-0">
                      {STATUS_LABEL[t.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-3">
                    {new Date(t.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
