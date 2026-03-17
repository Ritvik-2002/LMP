import { useState, useEffect } from 'react';
import BottomSheet from './BottomSheet';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

const DEBIT_DATES = [1, 5, 10, 15];

const UPI_APPS = [
  { name: 'GPay', color: '#4285F4' },
  { name: 'PhonePe', color: '#5F259F' },
  { name: 'Paytm', color: '#00BAF2' },
  { name: 'BHIM', color: '#00A86B' },
];

const MandateOverlay = ({ isOpen, onClose, onMandateSet, emi, lenderName }) => {
  const [step, setStep] = useState('setup'); // setup | waiting | done
  const [upiId, setUpiId] = useState('');
  const [debitDate, setDebitDate] = useState(5);
  const [countdown, setCountdown] = useState(180);
  const isUpiValid = upiId.includes('@') && upiId.length > 3;

  // Countdown during waiting
  useEffect(() => {
    if (step !== 'waiting') return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  // Simulate UPI app approval after 3s
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

  const handleSend = () => {
    setCountdown(180);
    setStep('waiting');
  };

  const handleClose = () => {
    setStep('setup');
    setUpiId('');
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
            <label>UPI ID for Auto-debit</label>
            <input
              type="text"
              placeholder="yourname@upi"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              className="overlay-input"
            />
            <span className="mandate-field-hint">A mandate request will be sent to this UPI ID</span>
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

          <div className="mandate-summary-box">
            <div className="mandate-row"><span>Amount</span><span>{formatPrice(emi || 0)}/month</span></div>
            <div className="mandate-row"><span>Debit Date</span><span>{debitDate}th of every month</span></div>
            <div className="mandate-row"><span>Payee</span><span>{lenderName}</span></div>
            <div className="mandate-row"><span>Type</span><span>Recurring — Until loan closure</span></div>
          </div>

          <p className="mandate-legal">By proceeding, you authorise {lenderName} to debit {formatPrice(emi || 0)} monthly from your UPI ID as per NPCI UPI AutoPay guidelines.</p>

          <button className="overlay-btn" disabled={!isUpiValid} onClick={handleSend}>
            Send Mandate Request
          </button>
        </div>
      )}

      {step === 'waiting' && (
        <div className="overlay-form">
          <div className="collect-status-card">
            <div className="collect-pulse">
              <div className="collect-pulse-ring" />
              <svg width="28" height="28" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <p className="collect-status-title">Mandate Request Sent</p>
            <p className="collect-upi-id">{upiId}</p>
            <p className="collect-amount-label">{formatPrice(emi || 0)}/month · {debitDate}th of every month</p>
          </div>

          <div className="collect-instructions">
            <p className="collect-instruction-title">Open your UPI app to approve</p>
            <div className="collect-app-list">
              {UPI_APPS.map(app => (
                <span key={app.name} className="collect-app-tag" style={{ borderColor: app.color + '44' }}>
                  <span className="upi-app-dot" style={{ background: app.color }} />{app.name}
                </span>
              ))}
            </div>
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
