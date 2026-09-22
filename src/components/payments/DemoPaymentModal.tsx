import React, { useState } from 'react';
import { 
  X, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, 
  Smartphone, Sparkles, Lock, ArrowRight, RefreshCw, QrCode
} from 'lucide-react';

interface DemoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (details: {
    paymentId: string;
    method: string;
    cardLast4: string;
    cardNetwork: string;
  }) => void;
  amount: number;
  title: string;
  itemType?: string;
}

export const DemoPaymentModal: React.FC<DemoPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  title,
  itemType = 'booking'
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'upi' | 'simulator'>('simulator');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState('YATRA TRAVELER');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Simulator outcome choice: 'success' or 'fail'
  const [simulatedOutcome, setSimulatedOutcome] = useState<'success' | 'fail'>('success');

  if (!isOpen) return null;

  const handleSimulatePayment = (forcedOutcome?: 'success' | 'fail') => {
    const outcome = forcedOutcome || simulatedOutcome;
    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsProcessing(false);
      if (outcome === 'success') {
        const paymentId = `pay_demo_${Date.now()}`;
        onSuccess({
          paymentId,
          method: activeTab === 'upi' ? 'UPI (Google Pay / PhonePe)' : 'Visa Platinum (Demo Card)',
          cardLast4: cardNumber.replace(/\s+/g, '').slice(-4) || '4242',
          cardNetwork: 'Visa Platinum'
        });
        onClose();
      } else {
        setErrorMsg('Payment Failed (Simulated Decline: Bank server timeout or insufficient test balance). You can retry or choose Success.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Yatra Setu Demo Payment Gateway</span>
          </div>

          <h2 className="text-xl font-bold font-serif text-white">{title}</h2>
          
          <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-white/15">
            <span className="text-xs text-stone-300">Total Payable Amount (inc. 5% GST):</span>
            <span className="text-2xl font-black text-amber-400">₹{amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'simulator'
                ? 'border-amber-500 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'card'
                ? 'border-amber-500 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            <span>Demo Card</span>
          </button>
          <button
            onClick={() => setActiveTab('upi')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'upi'
                ? 'border-amber-500 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Demo UPI / QR</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Transaction Failed:</strong>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900">
                <p className="font-bold mb-1">⚡ Testing Environment Active</p>
                <p>This is a sandbox simulation mode. No real money will be charged from your account. Choose your test outcome below:</p>
              </div>

              {/* Outcome choice buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSimulatedOutcome('success')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    simulatedOutcome === 'success'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-emerald-800">Test Success</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-stone-600">Simulates 100% successful payment, booking confirmation, and Tax Invoice download.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulatedOutcome('fail')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    simulatedOutcome === 'fail'
                      ? 'border-rose-600 bg-rose-50/70 text-rose-950 shadow-sm'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-rose-800">Test Failure</span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-[11px] text-stone-600">Simulates card decline / bank timeout error handling in UI.</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-4">
              {/* Card visual */}
              <div className="h-44 rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-800 to-amber-900 text-white p-5 flex flex-col justify-between shadow-lg relative overflow-hidden border border-amber-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">Yatra Setu Platinum</span>
                  <span className="font-bold text-sm tracking-wider">VISA</span>
                </div>
                <div className="text-xl font-mono tracking-widest text-amber-100 font-bold">
                  {cardNumber}
                </div>
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <div className="text-[9px] uppercase text-stone-400">Card Holder</div>
                    <div className="font-bold tracking-wide">{cardHolder}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-stone-400">Expires</div>
                    <div className="font-bold">{cardExpiry}</div>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 uppercase">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upi' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-36 h-36 mx-auto bg-stone-100 border border-stone-300 rounded-2xl flex flex-col items-center justify-center p-3">
                <QrCode className="w-24 h-24 text-stone-800" />
                <span className="text-[10px] font-bold text-stone-500 uppercase mt-1">Scan & Pay ₹{amount}</span>
              </div>
              <p className="text-xs text-stone-600">
                Supports Google Pay, PhonePe, Paytm, and BHIM UPI with instant auto-verification.
              </p>
            </div>
          )}
        </div>

        {/* Footer & Submit Action */}
        <div className="bg-stone-50 p-6 border-t border-stone-200 flex flex-col gap-3">
          <button
            disabled={isProcessing}
            onClick={() => handleSimulatePayment()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-black py-3.5 px-6 rounded-2xl text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>Authorizing 3D Secure Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-stone-950" />
                <span>Pay ₹{amount.toLocaleString('en-IN')} Now</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center space-x-4 text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>PCI-DSS Compliant Demo</span>
          </div>
        </div>

      </div>
    </div>
  );
};
