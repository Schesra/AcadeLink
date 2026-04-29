import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { courseService } from '@/services/courseService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  full_name: string;
  username: string;
}

interface ReviewStats {
  total: number;
  avg_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        size={20}
        className={`${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'} ${onChange ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
        onClick={() => onChange?.(star)}
      />
    ))}
  </div>
);

export default function ReviewSection({ courseId, isEnrolled }: { courseId: string; isEnrolled: boolean }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await courseService.getCourseReviews(courseId);
      setReviews(data.reviews);
      setStats(data.stats);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchReviews(); }, [courseId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await courseService.createReview(courseId, { rating, comment });
      toast({ title: 'Đánh giá thành công' });
      setComment('');
      fetchReviews();
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e.response?.data?.message || 'Không thể gửi đánh giá', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Đánh giá khóa học</h2>

      {/* Stats */}
      {stats && stats.total > 0 && (
        <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-500">{stats.avg_rating}</p>
            <StarRating value={Math.round(stats.avg_rating)} />
            <p className="text-sm text-muted-foreground mt-1">{stats.total} đánh giá</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats[`${['one', 'two', 'three', 'four', 'five'][star - 1]}_star` as keyof ReviewStats] as number;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-right">{star}</span>
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write review */}
      {isAuthenticated && isEnrolled && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <p className="font-medium text-sm">Viết đánh giá của bạn</p>
          <StarRating value={rating} onChange={setRating} />
          <Textarea
            placeholder="Chia sẻ trải nghiệm học tập của bạn..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting} size="sm">
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">Chưa có đánh giá nào.</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{r.full_name || r.username}</span>
                <StarRating value={r.rating} />
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(r.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
