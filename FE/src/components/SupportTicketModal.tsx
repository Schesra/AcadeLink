import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supportService } from '@/services/supportService';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle } from 'lucide-react';

interface Props {
  courseId?: number;
  courseTitle?: string;
}

export default function SupportTicketModal({ courseId, courseTitle }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await supportService.createTicket({ subject, description, course_id: courseId });
      toast({ title: 'Gửi thành công', description: 'Yêu cầu hỗ trợ của bạn đã được ghi nhận' });
      setSubject('');
      setDescription('');
      setOpen(false);
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e.response?.data?.message || 'Không thể gửi yêu cầu', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle size={16} /> Yêu cầu hỗ trợ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gửi yêu cầu hỗ trợ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {courseTitle && (
            <p className="text-sm text-muted-foreground">Khóa học: <span className="font-medium text-foreground">{courseTitle}</span></p>
          )}
          <div className="space-y-1.5">
            <Label>Tiêu đề</Label>
            <Input placeholder="Mô tả ngắn vấn đề của bạn" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Mô tả chi tiết</Label>
            <Textarea placeholder="Mô tả chi tiết vấn đề..." value={description} onChange={e => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
