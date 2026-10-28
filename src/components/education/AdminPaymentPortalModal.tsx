import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  KeyRound,
  Clock,
  Ban,
  Check
} from 'lucide-react';

interface AuditTrailItem {
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
}

interface AuthoritativeTransaction {
  id?: string;
  transactionId: string;
  orderId: string;
  planTier: 'plus' | 'pro';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'REVIEW_REQUIRED' | 'VERIFIED' | 'FAILED' | 'REFUNDED' | 'REVERSED';
  studentName: string;
  studentEmail?: string;
  accountId: string;
  createdAt: string;
  submittedAt?: string;
  verifiedAt?: string;
  claimedByAccount?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
  auditTrail?: AuditTrailItem[];
}

interface AdminPaymentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPaymentPortalModal({
  isOpen,
  onClose
}: AdminPaymentPortalModalProps) {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<AuthoritativeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEW_REQUIRED' | 'VERIFIED' | 'FAILED'>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedTxnAudit, setSelectedTxnAudit] = useState<AuthoritativeTransaction | null>(null);

  // New manual transaction form
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [newTxnId, setNewTxnId] = useState('');
  const [newOrderId, setNewOrderId] = useState('');
  const [newTier, setNewTier] = useState<'plus' | 'pro'>('plus');
  const [newCycle, setNewCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [newAmount, setNewAmount] = useState('99');
  const [newStudentName, setNewStudentName] = useState('');
  const [newAccountId, setNewAccountId] = useState('');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: adminKey.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setTransactions(data.transactions || []);
      } else {
        setAuthError(data.error || 'Invalid administrator key. Access denied.');
      }
    } catch {
      setAuthError('Connection error communicating with admin gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLedger = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTransactions(data.transactions || []);
      }
    } catch {}
    setIsLoading(false);
  };

  const handleApprove = async (txn: AuthoritativeTransaction) => {
    const confirmMsg = `Authorize genuine payment confirmation?\n\n• Transaction Ref / UTR: ${txn.transactionId}\n• Order ID: ${txn.orderId}\n• Student: ${txn.studentName} (${txn.studentEmail || txn.accountId})\n• Plan: NeoNova ${txn.planTier.toUpperCase()} (${txn.billingCycle}) ₹${txn.amount}\n\nPlease confirm you have verified ₹${txn.amount}.00 received into official PhonePe merchant account (Bank of Baroda **5536).`;
    if (!confirm(confirmMsg)) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/approve-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          transactionId: txn.transactionId,
          adminName: 'Naisarg Ramdatti (Administrator)',
          adminNotes: `Verified against Bank of Baroda **5536 statement for ${txn.studentName}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Transaction ${txn.transactionId} approved! Subscription activated for ${txn.studentName}.`);
        refreshLedger();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        alert(data.error || 'Failed to approve transaction.');
      }
    } catch {
      alert('Network error communicating with approval gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (txn: AuthoritativeTransaction) => {
    const reason = prompt(
      `Enter reason for rejecting transaction ${txn.transactionId}:`,
      "Payment could not be verified in PhonePe merchant records."
    );
    if (reason === null) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/reject-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          transactionId: txn.transactionId,
          reason: reason || "Payment not found in PhonePe merchant statement",
          adminName: 'Naisarg Ramdatti (Administrator)'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Transaction ${txn.transactionId} marked as FAILED. Premium access remains disabled.`);
        refreshLedger();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        alert(data.error || 'Failed to reject transaction.');
      }
    } catch {
      alert('Network error communicating with gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async (txn: AuthoritativeTransaction) => {
    const reason = prompt(
      `Are you sure you want to refund/revoke subscription for ${txn.transactionId} (${txn.studentName})?\nEnter reason:`,
      "Subscription refunded and revoked"
    );
    if (reason === null) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/refund-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          transactionId: txn.transactionId,
          reason,
          adminName: 'Naisarg Ramdatti (Administrator)'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Transaction ${txn.transactionId} marked as REFUNDED. Premium access revoked.`);
        refreshLedger();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        alert(data.error || 'Failed to refund transaction.');
      }
    } catch {
      alert('Network error updating refund status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorizeNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxnId.trim() || !newStudentName.trim()) {
      alert('Please fill out transaction ID and student name.');
      return;
    }

    try {
      const res = await fetch('/api/admin/authorize-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          transactionId: newTxnId.trim(),
          orderId: newOrderId.trim() || `ORD-MANUAL-${Date.now()}`,
          planTier: newTier,
          billingCycle: newCycle,
          amount: Number(newAmount) || 99,
          paymentMethod: 'upi',
          studentName: newStudentName.trim(),
          accountId: newAccountId.trim() || newStudentName.trim().toLowerCase().replace(/\s+/g, '-'),
          status: 'VERIFIED',
          notes: newNotes || 'Manually confirmed in PhonePe merchant records by Naisarg Ramdatti'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Transaction ${newTxnId} successfully authorized in ledger!`);
        setShowAddTxn(false);
        setNewTxnId('');
        setNewStudentName('');
        refreshLedger();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        alert(data.error || 'Failed to authorize transaction');
      }
    } catch {
      alert('Network error authorizing transaction');
    }
  };

  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const reviewCount = transactions.filter(t => t.status === 'REVIEW_REQUIRED').length;
  const verifiedCount = transactions.filter(t => t.status === 'VERIFIED').length;

  const filteredTxns = transactions.filter(t => {
    // Status filter
    if (statusFilter === 'PENDING' && t.status !== 'PENDING') return false;
    if (statusFilter === 'REVIEW_REQUIRED' && t.status !== 'REVIEW_REQUIRED') return false;
    if (statusFilter === 'VERIFIED' && t.status !== 'VERIFIED') return false;
    if (statusFilter === 'FAILED' && (t.status !== 'FAILED' && t.status !== 'REFUNDED' && t.status !== 'REVERSED')) return false;

    // Search query
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      t.transactionId.toLowerCase().includes(q) ||
      t.orderId.toLowerCase().includes(q) ||
      t.studentName.toLowerCase().includes(q) ||
      t.accountId.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>NeoNova Authoritative Payment Review Desk</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono rounded">
                  Admin: Naisarg Ramdatti
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Official PhonePe QR & Bank Reconciliation Switch (Bank of Baroda **5536)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <KeyRound size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Administrator Authentication
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your authoritative administrator credentials to review pending PhonePe payments and reconcile against merchant bank statements.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 w-full text-left">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter Administrator Key..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                <span>Access Payment Desk</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Merchant Settlement Account Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Official Reconciliation Target:</span>
                <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
                  <span>PhonePe UPI: 9898074424@axl</span>
                  <span className="text-slate-300">•</span>
                  <span>Bank of Baroda **5536</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-sans font-semibold">Naisarg Ramdatti</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-sans">
                Rule: Check bank/PhonePe statement before approving. Never trust transaction ID input alone.
              </div>
            </div>

            {/* Status Filter Tabs & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({transactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock size={12} />
                  <span>Pending ({pendingCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('REVIEW_REQUIRED')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'REVIEW_REQUIRED' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Review Required ({reviewCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('VERIFIED')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'VERIFIED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Check size={12} />
                  <span>Verified ({verifiedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('FAILED')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'FAILED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Failed / Refunded
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshLedger}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTxn(!showAddTxn)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Manual Entry</span>
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search by Transaction UTR, Order ID, Student Name, Email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            {/* Manual Authorize Form */}
            {showAddTxn && (
              <form onSubmit={handleAuthorizeNew} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Manually Authorize Confirmed Bank Payment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block">Bank Transaction ID / UTR</label>
                    <input
                      type="text"
                      value={newTxnId}
                      onChange={(e) => setNewTxnId(e.target.value)}
                      placeholder="e.g. 627114829103"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block">Student Name</label>
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block">Plan Tier</label>
                    <select
                      value={newTier}
                      onChange={(e) => {
                        const t = e.target.value as any;
                        setNewTier(t);
                        setNewAmount(t === 'plus' ? '99' : '199');
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="plus">NeoNova Plus (₹99)</option>
                      <option value="pro">NeoNova Pro (₹199)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTxn(false)}
                    className="px-3 py-1.5 text-slate-600 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Confirm & Authorize
                  </button>
                </div>
              </form>
            )}

            {/* Transactions Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Transaction UTR / Order ID</th>
                      <th className="py-2.5 px-3">Student Account</th>
                      <th className="py-2.5 px-3">Plan / Cycle</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Submitted At</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredTxns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          No transactions found in this category.
                        </td>
                      </tr>
                    ) : (
                      filteredTxns.map((txn) => {
                        const isVerified = txn.status === 'VERIFIED';
                        const isPending = txn.status === 'PENDING';
                        const isReview = txn.status === 'REVIEW_REQUIRED';
                        const isFailed = txn.status === 'FAILED';

                        return (
                          <tr key={txn.transactionId + (txn.orderId || '')} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-mono">
                              <div className="font-bold text-slate-900 select-all">{txn.transactionId}</div>
                              <div className="text-[10px] text-slate-400">{txn.orderId}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{txn.studentName || 'Student'}</div>
                              <div className="text-[10px] text-slate-400">{txn.studentEmail || txn.accountId}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold uppercase text-indigo-700 font-mono text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                {txn.planTier} ({txn.billingCycle || 'monthly'})
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-black text-slate-900">
                              ₹{txn.amount}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : isReview
                                  ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {isPending && <Clock size={10} />}
                                {isVerified && <Check size={10} />}
                                {isFailed && <Ban size={10} />}
                                <span>{txn.status}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[10px] text-slate-500 whitespace-nowrap">
                              {txn.submittedAt ? new Date(txn.submittedAt).toLocaleString() : new Date(txn.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                              {(isPending || isReview) && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(txn)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1"
                                    title="Verify against Bank of Baroda merchant statement and activate subscription"
                                  >
                                    <Check size={12} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReject(txn)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 cursor-pointer inline-flex items-center gap-1"
                                    title="Reject unreceived or unverified payment"
                                  >
                                    <X size={12} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {isVerified && (
                                <button
                                  type="button"
                                  onClick={() => handleRefund(txn)}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg border border-amber-200 cursor-pointer"
                                  title="Revoke subscription and mark as refunded"
                                >
                                  Revoke/Refund
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedTxnAudit(txn)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg cursor-pointer"
                                title="View audit trail"
                              >
                                Audit
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Trail Modal */}
            {selectedTxnAudit && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-800">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Audit Trail: {selectedTxnAudit.transactionId}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedTxnAudit(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between pb-1 border-b border-slate-100">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-bold">{selectedTxnAudit.status}</span>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-slate-100">
                      <span className="text-slate-500">Verified By:</span>
                      <span className="font-bold text-slate-800">{selectedTxnAudit.verifiedBy || 'Pending Administrator Review'}</span>
                    </div>
                    {selectedTxnAudit.notes && (
                      <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-600">
                        <strong>Notes:</strong> {selectedTxnAudit.notes}
                      </div>
                    )}
                    {selectedTxnAudit.auditTrail && selectedTxnAudit.auditTrail.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Event History:</span>
                        {selectedTxnAudit.auditTrail.map((item, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded-lg text-[11px] space-y-0.5 border border-slate-100">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>{item.action}</span>
                              <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-slate-600">{item.details}</div>
                            <div className="text-[10px] text-slate-400">By: {item.performedBy}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTxnAudit(null)}
                      className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
