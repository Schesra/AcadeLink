const db = require('../config/database');
const { createNotification } = require('./notificationController');

// ── Bank Account ──────────────────────────────────────────────────────────────

const getBankAccount = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;
    const [rows] = await db.query(
      'SELECT id, bank_name, bank_account, account_name, created_at FROM instructor_bank_accounts WHERE instructor_id = ?',
      [instructor_id]
    );
    res.json({ bank_account: rows[0] || null });
  } catch (error) {
    console.error('Get bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const saveBankAccount = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;
    const { bank_name, bank_account, account_name } = req.body;

    if (!bank_name || !bank_account || !account_name) {
      return res.status(400).json({ error: 'Missing fields', message: 'Vui lòng điền đầy đủ thông tin ngân hàng' });
    }

    await db.query(`
      INSERT INTO instructor_bank_accounts (instructor_id, bank_name, bank_account, account_name)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name), bank_account = VALUES(bank_account), account_name = VALUES(account_name), updated_at = CURRENT_TIMESTAMP
    `, [instructor_id, bank_name, bank_account, account_name]);

    res.json({ message: 'Liên kết tài khoản ngân hàng thành công' });
  } catch (error) {
    console.error('Save bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteBankAccount = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;
    await db.query('DELETE FROM instructor_bank_accounts WHERE instructor_id = ?', [instructor_id]);
    res.json({ message: 'Đã hủy liên kết tài khoản ngân hàng' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ── Withdrawals ───────────────────────────────────────────────────────────────

const getWithdrawals = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;
    const [withdrawals] = await db.query(
      'SELECT id, amount, bank_name, bank_account, account_name, status, created_at FROM withdrawal_requests WHERE instructor_id = ? ORDER BY created_at DESC',
      [instructor_id]
    );
    res.json({ withdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createWithdrawal = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount', message: 'Số tiền rút phải lớn hơn 0' });
    }
    if (Number(amount) < 50000) {
      return res.status(400).json({ error: 'Min amount', message: 'Số tiền rút tối thiểu là 50.000₫' });
    }

    // Kiểm tra tài khoản ngân hàng đã liên kết chưa
    const [bankRows] = await db.query(
      'SELECT bank_name, bank_account, account_name FROM instructor_bank_accounts WHERE instructor_id = ?',
      [instructor_id]
    );
    if (bankRows.length === 0) {
      return res.status(400).json({ error: 'No bank account', message: 'Bạn chưa liên kết tài khoản ngân hàng' });
    }
    const bank = bankRows[0];

    // Tính số dư khả dụng từ instructor_transactions
    const [[balRow]] = await db.query(`
      SELECT COALESCE(SUM(
        CASE
          WHEN type = 'credit' THEN amount
          WHEN type = 'debit' THEN -amount
          ELSE 0
        END
      ), 0) AS available_balance
      FROM instructor_transactions
      WHERE instructor_id = ?
    `, [instructor_id]);

    const available = Number(balRow.available_balance);
    if (Number(amount) > available) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: `Số dư khả dụng không đủ. Số dư hiện tại: ${available.toLocaleString('vi-VN')}₫`
      });
    }

    // Tạo yêu cầu rút tiền (chờ admin duyệt)
    const [result] = await db.query(
      'INSERT INTO withdrawal_requests (instructor_id, amount, bank_name, bank_account, account_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      [instructor_id, amount, bank.bank_name, bank.bank_account, bank.account_name, 'pending_admin']
    );

    // Notify admins
    const [[instructor]] = await db.query('SELECT full_name, username FROM users WHERE id = ?', [instructor_id]);
    const instructorName = instructor?.full_name || instructor?.username || 'Giảng viên';
    const [admins] = await db.query('SELECT user_id FROM user_roles WHERE role = ?', ['admin']);
    for (const admin of admins) {
      await createNotification(
        admin.user_id,
        'withdrawal_request',
        'Yêu cầu rút tiền mới 📤',
        `${instructorName} yêu cầu rút ${Number(amount).toLocaleString('vi-VN')}₫ về tài khoản ${bank.account_name} - ${bank.bank_account} (${bank.bank_name}).`,
        result.insertId
      );
    }

    res.status(201).json({
      message: 'Yêu cầu rút tiền đã được gửi. Admin sẽ xét duyệt trong 1-3 ngày làm việc.',
      withdrawal_id: result.insertId
    });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ── Admin Withdrawal Management ───────────────────────────────────────────────

const adminGetWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT wr.*, u.full_name AS instructor_name, u.username AS instructor_username
      FROM withdrawal_requests wr
      JOIN users u ON wr.instructor_id = u.id
    `;
    const params = [];
    if (status) {
      query += ' WHERE wr.status = ?';
      params.push(status);
    }
    query += ' ORDER BY wr.created_at DESC';
    const [withdrawals] = await db.query(query, params);
    res.json({ withdrawals });
  } catch (error) {
    console.error('Admin get withdrawals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const adminApproveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;

    const [[wr]] = await db.query(
      'SELECT * FROM withdrawal_requests WHERE id = ? AND status = ?',
      [id, 'pending_admin']
    );
    if (!wr) return res.status(404).json({ error: 'Not found', message: 'Yêu cầu không tồn tại hoặc đã được xử lý' });

    await db.query(
      'UPDATE withdrawal_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      ['completed', id]
    );

    // Insert debit transaction to reduce instructor balance
    await db.query(
      `INSERT INTO instructor_transactions
        (instructor_id, type, amount, description, related_withdrawal_id, status)
       VALUES (?, 'debit', ?, ?, ?, 'available')`,
      [wr.instructor_id, wr.amount, `Rút tiền #${id} về ${wr.account_name} - ${wr.bank_account}`, Number(id)]
    );

    await createNotification(
      wr.instructor_id,
      'withdrawal_completed',
      'Rút tiền thành công 💸',
      `${Number(wr.amount).toLocaleString('vi-VN')}₫ đã được chuyển đến tài khoản ${wr.account_name} - ${wr.bank_account} (${wr.bank_name}).`,
      Number(id)
    );

    res.json({ message: 'Đã duyệt yêu cầu rút tiền' });
  } catch (error) {
    console.error('Admin approve withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const adminRejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const [[wr]] = await db.query(
      'SELECT * FROM withdrawal_requests WHERE id = ? AND status = ?',
      [id, 'pending_admin']
    );
    if (!wr) return res.status(404).json({ error: 'Not found', message: 'Yêu cầu không tồn tại hoặc đã được xử lý' });

    await db.query(
      'UPDATE withdrawal_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      ['rejected', id]
    );

    await createNotification(
      wr.instructor_id,
      'withdrawal_rejected',
      'Yêu cầu rút tiền bị từ chối 🚫',
      `Yêu cầu rút ${Number(wr.amount).toLocaleString('vi-VN')}₫ của bạn đã bị từ chối.${reason ? ` Lý do: ${reason}` : ''}`,
      Number(id)
    );

    res.json({ message: 'Đã từ chối yêu cầu rút tiền' });
  } catch (error) {
    console.error('Admin reject withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getBankAccount, saveBankAccount, deleteBankAccount,
  getWithdrawals, createWithdrawal,
  adminGetWithdrawals, adminApproveWithdrawal, adminRejectWithdrawal,
};
