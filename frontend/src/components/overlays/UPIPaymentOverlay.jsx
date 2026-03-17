import { useState, useRef, useEffect } from 'react';
import BottomSheet from './BottomSheet';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

const UPI_APPS = [
  { name: 'GPay', color: '#4285F4' },
  { name: 'PhonePe', color: '#5F259F' },
  { name: 'Paytm', color: '#00BAF2' },
  { name: 'BHIM', color: '#00A86B' },
];

// ─── Cash flow ───────────────────────────────────────────────────────────────

const CashFlow = ({ amount, productName, onDone }) => {
  const [step, setStep] = useState('agent'); // agent | otp | verified
  const [agentId, setAgentId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const refs = useRef([]);

  const isComplete = otp.every(d => d !== '');

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 3) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleVerify = () => {
    setStep('verified');
    setTimeout(() => onDone?.(), 1500);
  };

  return (
    <>
      {step === 'agent' && (
        <>
          <div className="overlay-payment-summary">
            <span className="overlay-pay-amount">{formatPrice(amount || 0)}</span>
            <span className="overlay-pay-label">Down payment for {productName || 'your product'}</span>
          </div>

          <div className="cash-step-card">
            <span className="cash-step-num">1</span>
            <div>
              <strong>Hand over {formatPrice(amount || 0)} cash</strong>
              <p>Give the cash amount to the store agent</p>
            </div>
          </div>

          <div className="cash-step-card">
            <span className="cash-step-num">2</span>
            <div>
              <strong>Agent confirms receipt</strong>
              <p>Enter the Agent ID to generate a verification OTP for the agent</p>
            </div>
          </div>

          <div className="overlay-field">
            <label>Agent ID</label>
            <input
              type="text"
              placeholder="e.g. AGT-4821"
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
              className="overlay-input"
            />
            <span className="mandate-field-hint">Ask the store agent for their ID</span>
          </div>

          <button className="overlay-btn" disabled={agentId.trim().length < 3} onClick={() => setStep('otp')}>
            Generate Agent OTP
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="cash-otp-display">
            <div className="cash-otp-badge">OTP Sent to Agent · {agentId}</div>
            <p className="cash-otp-hint">
              A 4-digit verification code has been sent to agent <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{agentId}</strong>'s device.
              Ask them to enter it below to confirm cash collection.
            </p>
          </div>

          <div className="cash-otp-divider">
            <span>Agent enters OTP below</span>
          </div>

          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <button className="overlay-btn" disabled={!isComplete} onClick={handleVerify}>
            Confirm Cash Receipt
          </button>
        </>
      )}

      {step === 'verified' && (
        <div className="overlay-form overlay-center">
          <div className="overlay-success-icon">
            <svg width="48" height="48" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>Payment Confirmed!</h3>
          <p className="overlay-desc">{formatPrice(amount || 0)} received and confirmed by agent {agentId}</p>
        </div>
      )}
    </>
  );
};

// ─── UPI collect flow ─────────────────────────────────────────────────────────

const UpiFlow = ({ amount, productName, onDone }) => {
  const [step, setStep] = useState('enter'); // enter | collecting | done
  const [upiId, setUpiId] = useState('');
  const [countdown, setCountdown] = useState(180);
  const isValid = upiId.includes('@') && upiId.length > 3;

  useEffect(() => {
    if (step !== 'collecting') return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  useEffect(() => {
    if (step !== 'collecting') return;
    const t = setTimeout(() => setStep('done'), 3000);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step === 'done') {
      const t = setTimeout(() => onDone?.(), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <>
      {step === 'enter' && (
        <>
          <div className="overlay-payment-summary">
            <span className="overlay-pay-amount">{formatPrice(amount || 0)}</span>
            <span className="overlay-pay-label">Down payment for {productName || 'your product'}</span>
          </div>

          <div className="overlay-field">
            <label>Your UPI ID</label>
            <input
              type="text"
              placeholder="yourname@okicici"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              className="overlay-input"
            />
            <span className="mandate-field-hint">A collect request will be sent to this UPI ID</span>
          </div>

          <div className="upi-apps-row">
            {UPI_APPS.map(app => (
              <button
                key={app.name}
                className="upi-app-chip"
                onClick={() => setUpiId(prev => prev.split('@')[0] + '@' + app.name.toLowerCase())}
              >
                <span className="upi-app-dot" style={{ background: app.color }} />
                {app.name}
              </button>
            ))}
          </div>

          <button className="overlay-btn" disabled={!isValid} onClick={() => { setCountdown(180); setStep('collecting'); }}>
            Send Collect Request
          </button>
        </>
      )}

      {step === 'collecting' && (
        <>
          <div className="collect-status-card">
            <div className="collect-pulse">
              <div className="collect-pulse-ring" />
              <svg width="28" height="28" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <p className="collect-status-title">Collect Request Sent</p>
            <p className="collect-upi-id">{upiId}</p>
            <p className="collect-amount-label">{formatPrice(amount || 0)}</p>
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
        </>
      )}

      {step === 'done' && (
        <div className="overlay-form overlay-center">
          <div className="overlay-success-icon">
            <svg width="48" height="48" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>Payment Successful!</h3>
          <p className="overlay-desc">{formatPrice(amount || 0)} received from {upiId}</p>
        </div>
      )}
    </>
  );
};

// ─── Main overlay ─────────────────────────────────────────────────────────────

const UPIPaymentOverlay = ({ isOpen, onClose, onPaymentDone, amount, productName }) => {
  const [method, setMethod] = useState(null); // null | 'cash' | 'upi'

  const handleClose = () => {
    setMethod(null);
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Down Payment">
      <div className="overlay-form">
        {!method && (
          <>
            <div className="overlay-payment-summary">
              <span className="overlay-pay-amount">{formatPrice(amount || 0)}</span>
              <span className="overlay-pay-label">Down payment for {productName || 'your product'}</span>
            </div>

            <p className="dp-method-label">Choose payment method</p>

            <div className="dp-method-grid">
              <button className="dp-method-card" onClick={() => setMethod('cash')}>
                <span className="dp-method-icon">💵</span>
                <span className="dp-method-name">Cash at Store</span>
                <span className="dp-method-desc">Pay cash to store agent</span>
              </button>
              <button className="dp-method-card" onClick={() => setMethod('upi')}>
                <span className="dp-method-icon">📲</span>
                <span className="dp-method-name">UPI</span>
                <span className="dp-method-desc">Collect request to your UPI app</span>
              </button>
            </div>
          </>
        )}

        {method === 'cash' && (
          <CashFlow amount={amount} productName={productName} onDone={() => { setMethod(null); onPaymentDone?.(); }} />
        )}
        {method === 'upi' && (
          <UpiFlow amount={amount} productName={productName} onDone={() => { setMethod(null); onPaymentDone?.(); }} />
        )}

        {method && (
          <button className="mandate-back-btn" onClick={() => setMethod(null)}>
            ← Change method
          </button>
        )}
      </div>
    </BottomSheet>
  );
};

export default UPIPaymentOverlay;
