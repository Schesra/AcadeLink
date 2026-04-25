import { Inbox } from "lucide-react";

interface AdminEmptyStateProps {
  message?: string;
}

const AdminEmptyState = ({ message = "Chưa có dữ liệu để hiển thị" }: AdminEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
    <Inbox size={56} strokeWidth={1.2} className="mb-4 opacity-40" />
    <p className="text-base">{message}</p>
  </div>
);

export default AdminEmptyState;
