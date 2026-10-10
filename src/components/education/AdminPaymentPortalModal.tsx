import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  FileText, 
  UserCheck, 
  KeyRound,
  ArrowRight,
  Database
} from 'lucide-react';

interface AuthoritativeTransaction {
  transactionId: string;
  orderId: string;
  planTier: 'plus' | 'pro';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  studentName: string;
  studentEmail?: string;
  accountId: string;
  createdAt: string;
  verifiedAt?: string;
  claimedByAccount?: string;
  verifiedBy?: string;
  notes?: string;
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
    } catch (err: any) {
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
          status: 'successful',
          notes: newNotes || 'Manually authorized bank transaction'
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
    } catch (err: any) {
      alert('Network error authorizing transaction');
    }
  };

  const handleUpdateStatus = async (transactionId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change transaction ${transactionId} status to ${newStatus}?`)) return;

    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          transactionId,
          newStatus,
          reason: `Manual update by Naisarg Ramdatti to ${newStatus}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Updated ${transactionId} to ${newStatus}`);
        refreshLedger();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        alert(data.error || 'Failed to update transaction status');
      }
    } catch {
      alert('Network error updating status');
    }
  };

  const filteredTxns = transactions.filter(t => {
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
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>NeoNova Authoritative Payment Ledger</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono rounded">
                  Admin: Naisarg Ramdatti
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Rule 13 Administrator Verification & Transaction Review System
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
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <KeyRound size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Administrator Authentication</h3>
              <p className="text-xs text-slate-500">
                Enter your administrative key to view and manage bank settlement records.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter Administrator Key"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
              />
              {authError && (
                <p className="text-xs text-rose-600 font-medium">{authError}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Access Admin Ledger'}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Search by Transaction ID, Order ID, Student, or Status..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshLedger}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTxn(!showAddTxn)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Authorize Transaction</span>
                </button>
              </div>
            </div>

            {/* Manual Authorize Form */}
            {showAddTxn && (
              <form onSubmit={handleAuthorizeNew} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Manually Authorize Genuine Bank Settlement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block">Bank Transaction ID / UTR</label>
                    <input
                      type="text"
                      value={newTxnId}
                      onChange={(e) => setNewTxnId(e.target.value)}
                      placeholder="e.g. 627114829103 or 42134565"
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
                      onChange={(e) => setNewTier(e.target.value as any)}
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
                    Confirm & Add to Authoritative Ledger
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
                      <th className="py-2.5 px-3">Transaction ID</th>
                      <th className="py-2.5 px-3">Student / Account</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredTxns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-slate-400">
                          No transactions found matching query.
                        </td>
                      </tr>
                    ) : (
                      filteredTxns.map((txn) => {
                        const isSuccess = txn.status === 'successful';
                        const isRefunded = txn.status === 'refunded' || txn.status === 'cancelled';
                        const isPending = txn.status === 'pending' || txn.status === 'verification_required';

                        return (
                          <tr key={txn.transactionId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                              {txn.transactionId}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{txn.studentName}</div>
                              <div className="text-[10px] text-slate-400">{txn.accountId}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold uppercase text-indigo-700 font-mono text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                {txn.planTier}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                              ₹{txn.amount}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isSuccess
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isRefunded
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                {txn.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[10px] text-slate-400">
                              {new Date(txn.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-1.5">
                              {txn.status !== 'successful' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(txn.transactionId, 'successful')}
                                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {txn.status === 'successful' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(txn.transactionId, 'refunded')}
                                  className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded border border-rose-200 cursor-pointer"
                                >
                                  Revoke/Refund
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
