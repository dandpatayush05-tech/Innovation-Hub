import React, { useState, useEffect } from 'react';
import { getPayments, downloadReceipt, Payment, PaymentsResponse } from '../api/payments';
import { FileText, Download, CheckCircle2, AlertCircle, Clock, XCircle, Search, Filter } from 'lucide-react';

const Payments = () => {
  const [paymentsData, setPaymentsData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPayments({
        status: statusFilter || undefined,
        booking_type: typeFilter || undefined,
      });
      setPaymentsData(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load payments history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, typeFilter]);

  const handleDownload = async (paymentId: string) => {
    try {
      setDownloadingId(paymentId);
      await downloadReceipt(paymentId);
    } catch (err) {
      console.error('Failed to download receipt', err);
      // Fallback alert for demo purposes
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Failed</span>;
      case 'refunded':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"><AlertCircle className="w-3.5 h-3.5" /> Refunded</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
            <p className="text-gray-500 mt-1">View all your transactions and download receipts.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-40">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">All Types</option>
                <option value="hotel">Hotels</option>
                <option value="flight">Flights</option>
                <option value="bus">Buses</option>
                <option value="tour">Tours</option>
                <option value="auto">Auto/Taxi</option>
              </select>
            </div>
            
            <div className="relative flex-1 md:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading payment history...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            {error}
            <button onClick={fetchPayments} className="ml-4 underline text-blue-500">Retry</button>
          </div>
        ) : !paymentsData?.data.length ? (
          <div className="text-center py-10 text-gray-500">
            {statusFilter || typeFilter ? "Try adjusting your filters" : "You haven't made any payments yet."}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500">Transaction ID</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Type</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Amount</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paymentsData.data.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {payment.provider_payment_id || `INV-${payment.id.substring(0, 8).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(payment.paid_at || payment.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium">
                          {payment.booking_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {payment.currency} {Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownload(payment.id)}
                          disabled={downloadingId === payment.id || payment.status !== 'paid'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${payment.status !== 'paid' 
                              ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                              : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                        >
                          {downloadingId === payment.id ? (
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls could go here */}
            {paymentsData.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>Showing page {paymentsData.pagination.page} of {paymentsData.pagination.totalPages}</span>
                {/* Add standard Prev/Next buttons if needed */}
              </div>
            )}
          </div>
        )}
      </div>
  );
};

export default Payments;
