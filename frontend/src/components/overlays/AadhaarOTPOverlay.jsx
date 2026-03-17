import { useState, useRef } from 'react';
import BottomSheet from './BottomSheet';

const AadhaarOTPOverlay = ({ isOpen, onClose, onVerified }) => {
  const [aadhaar, setAadhaar] = useState('');
  const [step, setStep] = useState('enter'); // enter | otp | verifying | verified
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const isAadhaarValid = /^\d{12}$/.test(aadhaar);

  const handleSendOtp = () => {
    setStep('otp');
  };

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

  const isOtpComplete = otp.every(d => d !== '');

  const handleVerify = () => {
    setLoading(true);
    setStep('verifying');
    // Simulate UIDAI verification
    setTimeout(() => {
      setStep('verified');
      setLoading(false);
      setTimeout(() => {
        onVerified?.({ aadhaar });
      }, 1000);
    }, 2000);
  };

  const handleClose = () => {
    setAadhaar('');
    setOtp(['', '', '', '', '', '']);
    setStep('enter');
    setLoading(false);
    onClose?.();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Aadhaar KYC Verification">
      {step === 'enter' && (
        <div className="overlay-form">
          <div className="overlay-icon-row">
            <div className="overlay-icon-circle">
              <svg width="24" height="24" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h4m-4 4h10"/><circle cx="17" cy="8" r="1.5"/></svg>
            </div>
            <p className="overlay-desc">Enter your 12-digit Aadhaar number. An OTP will be sent to your Aadhaar-linked mobile for verification.</p>
          </div>
          <div className="overlay-field">
            <label>Aadhaar Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012"
              maxLength={14}
              value={aadhaar.replace(/(\d{4})(?=\d)/g, '$1 ')}
              onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="overlay-input"
            />
          </div>
          <button className="overlay-btn" disabled={!isAadhaarValid} onClick={handleSendOtp}>
            Send OTP via UIDAI
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="overlay-form">
          <div className="overlay-icon-row">
            <svg width="36" height="36" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2.5"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            <div>
              <h4>Enter UIDAI OTP</h4>
              <p className="overlay-desc">Sent to Aadhaar-linked mobile ending in ****{aadhaar.slice(-4)}</p>
            </div>
          </div>
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
          <button className="overlay-btn" disabled={!isOtpComplete} onClick={handleVerify}>
            Verify Aadhaar
          </button>
        </div>
      )}

      {step === 'verifying' && (
        <div className="overlay-form overlay-center">
          <div className="overlay-spinner"></div>
          <p>Verifying with UIDAI...</p>
        </div>
      )}

      {step === 'verified' && (
        <div className="overlay-form overlay-center">
          <div className="overlay-success-icon">
            <svg width="48" height="48" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>Aadhaar Verified!</h3>
          <p className="overlay-desc">Your identity has been verified successfully.</p>
        </div>
      )}
    </BottomSheet>
  );
};

export default AadhaarOTPOverlay;
