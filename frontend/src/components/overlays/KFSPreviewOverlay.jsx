import { useState, useRef } from 'react';
import BottomSheet from './BottomSheet';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

const KFSPreviewOverlay = ({ isOpen, onClose, onAccepted, loanData }) => {
  const [accepted, setAccepted] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('review'); // review | confirming | done
  const otpRefs = useRef([]);

  const isOtpComplete = otp.every(d => d !== '');

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleConfirm = () => {
    setStep('confirming');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => {
        onAccepted?.();
      }, 1500);
    }, 2000);
  };

  const handleClose = () => {
    setAccepted(false);
    setOtp(['', '', '', '', '', '']);
    setStep('review');
    onClose?.();
  };

  const data = loanData || {};

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Key Fact Statement">
      {step === 'review' && (
        <div className="overlay-form">
          <div className="kfs-overlay-card">
            <h4 className="kfs-overlay-title">Key Fact Statement (KFS)</h4>
            <p className="kfs-overlay-subtitle">As mandated by RBI</p>
            <div className="kfs-overlay-table">
              <div className="kfs-overlay-row"><span>Lender</span><span>{data.lender || '-'}</span></div>
              <div className="kfs-overlay-row"><span>Loan Amount</span><span>{formatPrice(data.loanAmount || 0)}</span></div>
              <div className="kfs-overlay-row"><span>Down Payment</span><span>{formatPrice(data.downpayment || 0)}</span></div>
              <div className="kfs-overlay-row"><span>Tenure</span><span>{data.tenure || 0} months</span></div>
              <div className="kfs-overlay-row"><span>Interest Rate</span><span>{data.rate === 0 ? '0% (No Cost)' : `${data.rate}% p.a.`}</span></div>
              <div className="kfs-overlay-row"><span>Monthly EMI</span><span className="kfs-highlight">{formatPrice(data.emi || 0)}</span></div>
              <div className="kfs-overlay-row"><span>Total Payable</span><span>{formatPrice(data.totalPayable || 0)}</span></div>
              <div className="kfs-overlay-row"><span>Processing Fee</span><span>{formatPrice(0)}</span></div>
            </div>
          </div>

          <label className="overlay-checkbox">
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
            <span>I have read and agree to the Key Fact Statement and loan agreement terms</span>
          </label>

          {accepted && (
            <div className="overlay-otp-section">
              <p className="overlay-otp-label">Enter OTP to confirm</p>
              <div className="overlay-otp-inputs">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    className="overlay-otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>
            </div>
          )}

          <button className="overlay-btn" disabled={!accepted || !isOtpComplete} onClick={handleConfirm}>
            Confirm & Disburse Loan
          </button>
        </div>
      )}

      {step === 'confirming' && (
        <div className="overlay-form overlay-center">
          <div className="overlay-spinner"></div>
          <p>Processing loan disbursement...</p>
        </div>
      )}

      {step === 'done' && (
        <div className="overlay-form overlay-center">
          <div className="overlay-success-icon">
            <svg width="48" height="48" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>Loan Approved!</h3>
          <p className="overlay-desc">Your loan has been disbursed successfully.</p>
        </div>
      )}
    </BottomSheet>
  );
};

export default KFSPreviewOverlay;
