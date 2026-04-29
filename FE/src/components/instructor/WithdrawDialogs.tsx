import { useState, useEffect } from 'react';
import { withdrawalService, BankAccount } from '@/services/withdrawalService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Building2, CreditCard, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const BANKS = [
  'Vietcombank', 'VietinBank', 'BIDV', 'Agribank', 'Techcombank',
  'MBBank', 'VPBank', 'TPBank', 'ACB', 'Sacombank',
  'HDBank', 'OCB', 'SHB', 'SeABank', 'MSB', 'Eximbank', 'Khác',
];

const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

// ── Dialog liên kết ngân hàng ──────────────────────────────────────────────────
interface LinkBankDialogProps {
  onSuccess: (bank: BankAccount) => void;
  onClose: () => void;
}

export function LinkBankDialog({ onSuccess, onClose }: LinkBankDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bank_name: '', bank_account: '', account_name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bank_name || !form.bank_account || !form.account_name) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng điền đầy đủ', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await withdrawalService.saveBankAccount(form);
      const { bank_account } = await withdrawalService.getBankAccount();
      toast({ title: 'Liên kết thành công', description: 'Tài khoản ngân hàng đã được liên kết' });
      onSuccess(bank_account!);
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.response?.data?.message || 'Liên kết thất bại', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Liên kết ngân hàng</h2>
              <p className="text-sm text-muted-foreground">Để rút tiền, bạn cần liên kết tài khoản ngân hàng</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>Ngân hàng *</Label>
            <select
              value={form.bank_name}
              onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
              className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">-- Chọn ngân hàng --</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="bank_account">Số tài khoản *</Label>
            <div className="relative mt-1">
              <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="bank_account"
                value={form.bank_account}
                onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))}
                placeholder="Nhập số tài khoản"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="account_name">Tên chủ tài khoản *</Label>
            <div className="relative mt-1">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="account_name"
                value={form.account_name}
                onChange={e => setForm(f => ({ ...f, account_name: e.target.value.toUpperCase() }))}
                placeholder="NGUYEN VAN A"
                className="pl-9 uppercase"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Nhập đúng tên như trên thẻ/sổ ngân hàng</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Liên kết ngay'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Dialog rút tiền ────────────────────────────────────────────────────────────
interface WithdrawDialogProps {
  availableBalance: number;
  bankAccount: BankAccount;
  onSuccess: () => void;
  onClose: () => void;
  onChangeBankAccount: () => void;
}

export function WithdrawDialog({ availableBalance, bankAccount, onSuccess, onClose, onChangeBankAccount }: WithdrawDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '');
    setAmount(raw);
    setAmountDisplay(raw ? Number(raw).toLocaleString('vi-VN') : '');
  };

  const handleWithdraw = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      toast({ title: 'Số tiền không hợp lệ', variant: 'destructive' }); return;
    }
    if (num > availableBalance) {
      toast({ title: 'Số dư không đủ', description: `Số dư khả dụng: ${fmt(availableBalance)}`, variant: 'destructive' }); return;
    }
    if (num < 50000) {
      toast({ title: 'Số tiền tối thiểu là 50.000₫', variant: 'destructive' }); return;
    }
    setProcessing(true);
    try {
      await withdrawalService.createWithdrawal(num);
      setDone(true);
      setTimeout(() => { onSuccess(); }, 2000);
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
              <h2 className="text-lg font-bold text-foreground">Rút tiền</h2>
              <p className="text-sm text-muted-foreground">Số dư khả dụng: <span className="font-semibold text-foreground">{fmt(availableBalance)}</span></p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Tài khoản đích */}
          <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">{bankAccount.account_name}</p>
                <p className="text-xs text-muted-foreground">{bankAccount.bank_account} · {bankAccount.bank_name}</p>
              </div>
            </div>
            <button onClick={onChangeBankAccount} className="text-xs text-primary hover:underline shrink-0">
              Thay đổi
            </button>
          </div>

          {/* Số tiền */}
          <div>
            <Label htmlFor="amount">Số tiền muốn rút</Label>
            <div className="relative mt-1">
              <Input
                id="amount"
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder="0"
                className="pr-8 text-lg font-semibold"
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

          {Number(amount) > 0 && (
            <div className="bg-muted/40 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={14} className="text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Số dư sau khi rút: <span className="font-semibold text-foreground">{fmt(availableBalance - Number(amount))}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={processing}>
              Hủy
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleWithdraw}
              disabled={processing || !amount || Number(amount) <= 0}
            >
              {processing ? 'Đang xử lý...' : <><ArrowRight size={16} /> Xác nhận rút</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
