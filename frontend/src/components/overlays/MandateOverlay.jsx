import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import BottomSheet from './BottomSheet';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

const DEBIT_DATES = [1, 5, 10, 15];

// Generate UPI deep-link for mandate transaction
const buildVerificationQR = ({ emi, lenderName }) => {
  const pa = 'fibe@upi';
  const pn = encodeURIComponent(lenderName || 'Lender');
  const amount = (emi || 0).toFixed(2);
  const tn = encodeURIComponent(`Mandate setup — ₹${amount} refundable`);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${amount}&tn=${tn}&cu=INR`;
};

const MandateOverlay = ({ isOpen, onClose, onMandateSet, emi, lenderName }) => {
  const [step, setStep] = useState('setup'); // setup | waiting | done
  const [debitDate, setDebitDate] = useState(5);
  const [countdown, setCountdown] = useState(180);

  const verifyQR = buildVerificationQR({ emi, lenderName });

  // Countdown during waiting
  useEffect(() => {
    if (step !== 'waiting') return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  // Simulate scan approval after 3s
  useEffect(() => {
    if (step !== 'waiting') return;
    const t = setTimeout(() => setStep('done'), 3000);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step === 'done') {
      const t = setTimeout(() => onMandateSet?.(), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Simulate a QR scan tap (demo)
  const handleQRTap = () => {
    setCountdown(180);
    setTimeout(() => setStep('waiting'), 600);
  };

  const handleClose = () => {
    setStep('setup');
    setDebitDate(5);
    setCountdown(180);
    onClose?.();
  };

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <BottomSheet isOpen={isOpen} onClose={step === 'waiting' ? null : handleClose} title="Set Up Auto-debit">
      {step === 'setup' && (
        <div className="overlay-form">
          <div className="mandate-intro">
            <div className="mandate-icon-row">
              <div className="mandate-icon">
                <svg width="22" height="22" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <div>
                <p className="mandate-title">UPI AutoPay Mandate</p>
                <p className="mandate-sub">Auto-debit for your EMIs via UPI</p>
              </div>
            </div>
            <div className="mandate-emi-badge">
              <span className="mandate-emi-amount">{formatPrice(emi || 0)}</span>
              <span className="mandate-emi-label">per month to {lenderName}</span>
            </div>
          </div>

          <div className="overlay-field">
            <label>Monthly Debit Date</label>
            <div className="mandate-date-grid">
              {DEBIT_DATES.map(d => (
                <button
                  key={d}
                  className={`mandate-date-chip ${debitDate === d ? 'selected' : ''}`}
                  onClick={() => setDebitDate(d)}
                >
                  {d}<sup>th</sup>
                </button>
              ))}
            </div>
          </div>

          {/* Single QR code for ₹1 verification */}
          <div className="mandate-qr-single">
            <div
              className="mandate-qr-card mandate-qr-card--single"
              onClick={handleQRTap}
              title="Tap to simulate scan"
            >
              <QRCodeSVG value={verifyQR} size={160} level="M" includeMargin bgColor="#ffffff" fgColor="#1a1a2e" />
              <p className="mandate-qr-label">Mandate Setup</p>
              <p className="mandate-qr-sublabel">{formatPrice(emi || 0)} — Refundable</p>
            </div>
          </div>

          <p className="mandate-qr-hint">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3m4-3v7h-7"/></svg>
            Scan with any UPI app to complete mandate setup
          </p>

          <div className="mandate-summary-box">
            <div className="mandate-row"><span>Amount</span><span>{formatPrice(emi || 0)}/month</span></div>
            <div className="mandate-row"><span>Debit Date</span><span>{debitDate}th of every month</span></div>
            <div className="mandate-row"><span>Payee</span><span>{lenderName}</span></div>
            <div className="mandate-row"><span>Type</span><span>Recurring — Until loan closure</span></div>
          </div>

          <p className="mandate-legal">By proceeding, you authorise {lenderName} to debit {formatPrice(emi || 0)} monthly from your UPI ID as per NPCI UPI AutoPay guidelines.</p>
        </div>
      )}

      {step === 'waiting' && (
        <div className="overlay-form">
          <div className="collect-status-card">
            <div className="collect-pulse">
              <div className="collect-pulse-ring" />
              <svg width="28" height="28" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <p className="collect-status-title">QR Scanned</p>
            <p className="collect-amount-label">{formatPrice(emi || 0)}/month · {debitDate}th of every month</p>
          </div>

          <div className="collect-instructions">
            <p className="collect-instruction-title">Complete the payment in your UPI app</p>
          </div>

          <div className="collect-timer">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Request expires in {mins}:{secs}
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="overlay-form overlay-center">
          <div className="overlay-success-icon">
            <svg width="48" height="48" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>Auto-debit Activated!</h3>
          <p className="overlay-desc">Your EMI will be auto-debited on the {debitDate}th of every month.</p>
        </div>
      )}
    </BottomSheet>
  );
};

export default MandateOverlay;