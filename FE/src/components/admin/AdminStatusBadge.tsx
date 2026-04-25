interface AdminStatusBadgeProps {
  status: "pending" | "approved" | "rejected";
}

const config = {
  pending: { label: "Chờ duyệt", bg: "var(--admin-pending-light)", color: "var(--admin-pending)" },
  approved: { label: "Đã duyệt", bg: "var(--admin-approve-light)", color: "var(--admin-approve)" },
  rejected: { label: "Từ chối", bg: "var(--admin-reject-light)", color: "var(--admin-reject)" },
};

const AdminStatusBadge = ({ status }: AdminStatusBadgeProps) => {
  const c = config[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: `hsl(${c.bg})`, color: `hsl(${c.color})` }}
    >
      {c.label}
    </span>
  );
};

export default AdminStatusBadge;
