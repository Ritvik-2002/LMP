import { useState, useEffect, useRef } from 'react';
import './PaymentPage.css';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const STEPS = ['details', 'consent', 'eligibility', 'offers', 'kyc', 'final-offers', 'downpayment', 'kfs', 'success'];

const LENDERS = [
  { id: 'hdfc', name: 'HDFC Bank', logo: '🏦', rates: [12, 12.5, 13], maxTenure: 24 },
  { id: 'icici', name: 'ICICI Bank', logo: '🏛️', rates: [11.5, 12, 12.5], maxTenure: 18 },
  { id: 'bajaj', name: 'Bajaj Finance', logo: '💳', rates: [13, 13.5, 14], maxTenure: 24, noCost: [3, 6] },
];

const calculateEmi = (principal, months, rate) => {
  const r = rate / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
};

// Session persistence helpers
const STORAGE_KEY = 'checkout_session';

const loadSession = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const clearSession = () => sessionStorage.removeItem(STORAGE_KEY);

function PaymentPage({ data, theme, onBack }) {
  const saved = useRef(loadSession()).current;

  const [step, setStep] = useState(saved?.step || 'details');
  const [form, setForm] = useState(saved?.form || { name: '', mobile: '', email: '' });
  const [consent, setConsent] = useState(saved?.consent || { bureau: false, tnc: false });
  const [kyc, setKyc] = useState(saved?.kyc || { pan: '', dob: '', aadhaar: '' });
  const [kycSubStep, setKycSubStep] = useState(saved?.kycSubStep || 'pan');
  const [aadhaarOtp, setAadhaarOtp] = useState(['', '', '', '', '', '']);
  const [aadhaarVerified, setAadhaarVerified] = useState(saved?.aadhaarVerified || false);
  const [aadhaarData, setAadhaarData] = useState(saved?.aadhaarData || null);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const aadhaarOtpRefs = useRef([]);
  const [selectedOffer, setSelectedOffer] = useState(saved?.selectedOffer || null);
  const [selectedTenure, setSelectedTenure] = useState(saved?.selectedTenure || null);
  const [downpaymentMethod, setDownpaymentMethod] = useState(saved?.downpaymentMethod || 'upi');
  const [upiId, setUpiId] = useState(saved?.upiId || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [kfsAccepted, setKfsAccepted] = useState(false);
  const [eligibilityProgress, setEligibilityProgress] = useState(0);
  const otpRefs = useRef([]);
  const orderIdRef = useRef(saved?.orderId || `ORD${Date.now().toString().slice(-8)}`);

  // Persist checkout state on every change
  useEffect(() => {
    // Don't persist eligibility (animated) or success (done)
    if (step === 'eligibility') return;
    const session = {
      step, form, consent, kyc, kycSubStep, aadhaarVerified, aadhaarData,
      selectedOffer, selectedTenure, downpaymentMethod, upiId,
      orderId: orderIdRef.current,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [step, form, consent, kyc, kycSubStep, aadhaarVerified, aadhaarData, selectedOffer, selectedTenure, downpaymentMethod, upiId]);

  // Clear session on success or when going back to shopping
  const handleBack = () => {
    clearSession();
    sessionStorage.removeItem('checkout_active');
    onBack();
  };

  const product = data.product_id;
  const amount = data.loan_request?.amount || 129999;
  const productName = data.product_name || 'Samsung Galaxy S26';
  const merchant = data.merchant?.merchant_name || 'Croma';
  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  // Eligibility check animation
  useEffect(() => {
    if (step !== 'eligibility') return;
    setEligibilityProgress(0);
    const interval = setInterval(() => {
      setEligibilityProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => setStep('offers'), 500); return 100; }
        return prev + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [step]);

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      const nextStep = STEPS[idx + 1];
      if (nextStep === 'success') clearSession();
      setStep(nextStep);
    }
  };

  const goBack = () => {
    if (step === 'details') { handleBack(); return; }
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
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

  const handleAadhaarOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...aadhaarOtp];
    newOtp[index] = value;
    setAadhaarOtp(newOtp);
    if (value && index < 5) aadhaarOtpRefs.current[index + 1]?.focus();
  };

  const handleAadhaarOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !aadhaarOtp[index] && index > 0) aadhaarOtpRefs.current[index - 1]?.focus();
  };

  const handleSendAadhaarOtp = () => {
    setKycSubStep('aadhaar-otp');
  };

  const downloadReceipt = () => {
    const orderId = orderIdRef.current;
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt - #${orderId}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,sans-serif;background:#f5f5f5;padding:24px}
.receipt{max-width:480px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden}
.receipt-header{background:#1a1a2e;color:#fff;padding:24px;text-align:center}
.receipt-header h1{font-size:18px;margin-bottom:4px}
.receipt-header p{font-size:12px;opacity:0.7}
.receipt-badge{display:inline-block;background:#16a34a;color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;margin:20px 0 8px}
.receipt-body{padding:24px}
.receipt-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
.receipt-row:last-child{border-bottom:none}
.receipt-row span:first-child{color:#888}
.receipt-row span:last-child{font-weight:600;color:#1a1a2e}
.receipt-total{background:#f8f9fa;margin:12px -24px 0;padding:14px 24px;font-weight:700}
.receipt-total span:last-child{color:#12DAA8}
.receipt-footer{text-align:center;padding:16px 24px 24px;font-size:11px;color:#999}
.receipt-footer p{margin-bottom:4px}
@media print{body{background:#fff;padding:0}.receipt{box-shadow:none;border-radius:0}}
</style></head><body>
<div class="receipt">
<div class="receipt-header">
<h1>${merchant}</h1>
<p>Powered by Juspay</p>
</div>
<div class="receipt-body">
<div style="text-align:center"><span class="receipt-badge">Payment Successful</span></div>
<div class="receipt-row"><span>Order ID</span><span>#${orderId}</span></div>
<div class="receipt-row"><span>Date</span><span>${date}, ${time}</span></div>
<div class="receipt-row"><span>Customer</span><span>${form.name}</span></div>
<div class="receipt-row"><span>Mobile</span><span>+91 ${form.mobile}</span></div>
<div class="receipt-row"><span>Product</span><span>${productName}</span></div>
<div class="receipt-row"><span>Product Price</span><span>${formatCurrency(amount)}</span></div>
<div class="receipt-row"><span>Lender</span><span>${selectedLender?.name || '-'}</span></div>
<div class="receipt-row"><span>Loan Amount</span><span>${formatCurrency(loanAmount)}</span></div>
<div class="receipt-row"><span>Down Payment</span><span>${formatCurrency(downpaymentAmount)}</span></div>
<div class="receipt-row"><span>EMI</span><span>${formatCurrency(emiAmount)}/mo x ${selectedTenure} months</span></div>
<div class="receipt-row"><span>Interest Rate</span><span>${selectedRate === 0 ? 'No Cost EMI' : selectedRate + '% p.a.'}</span></div>
<div class="receipt-row receipt-total"><span>Total Payable</span><span>${formatCurrency(totalPayable + downpaymentAmount)}</span></div>
</div>
<div class="receipt-footer">
<p>This is a computer-generated receipt.</p>
<p>For queries, contact ${merchant} support.</p>
<p>PCI DSS Compliant | RBI Regulated</p>
</div>
</div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVerifyAadhaarOtp = () => {
    setAadhaarLoading(true);
    // Simulate UIDAI verification
    setTimeout(() => {
      setAadhaarData({
        name: form.name || 'Prakhar Prakash',
        dob: kyc.dob || '1995-06-15',
        gender: 'Male',
        address: '42, MG Road, Koramangala, Bengaluru, Karnataka - 560034',
        maskedAadhaar: `XXXX XXXX ${kyc.aadhaar.slice(-4)}`,
        photo: null,
      });
      setAadhaarVerified(true);
      setAadhaarLoading(false);
      setKycSubStep('aadhaar-verified');
    }, 2000);
  };

  const isDetailsValid = form.name.trim().length >= 2 && /^[6-9]\d{9}$/.test(form.mobile);
  const isConsentValid = consent.bureau && consent.tnc;
  const isPanValid = /^[A-Z]{5}\d{4}[A-Z]$/.test(kyc.pan.toUpperCase()) && kyc.dob;
  const isAadhaarValid = /^\d{12}$/.test(kyc.aadhaar);
  const isAadhaarOtpComplete = aadhaarOtp.every(d => d !== '');
  const isKycValid = isPanValid && aadhaarVerified;
  const isOtpComplete = otp.every(d => d !== '');
  const downpaymentAmount = selectedOffer ? Math.round(amount * 0.1) : 0;
  const loanAmount = amount - downpaymentAmount;

  const selectedLender = selectedOffer ? LENDERS.find(l => l.id === selectedOffer) : null;
  const selectedRate = selectedLender && selectedTenure
    ? (selectedLender.noCost?.includes(selectedTenure) ? 0 : selectedLender.rates[Math.min(Math.floor(selectedTenure / 12), selectedLender.rates.length - 1)])
    : 0;
  const emiAmount = selectedTenure ? calculateEmi(loanAmount, selectedTenure, selectedRate) : 0;
  const totalPayable = selectedTenure ? emiAmount * selectedTenure : 0;
  const totalInterest = totalPayable - loanAmount;

  return (
    <div className="checkout-container">
      {/* Header */}
      <header className="checkout-header">
        <button className="checkout-back" onClick={goBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
        </button>
        <div className="checkout-header-info">
          <h1 className="checkout-title">{step === 'success' ? 'Payment Successful' : 'Checkout'}</h1>
          <span className="checkout-merchant">Powered by Juspay</span>
        </div>
        <div className="checkout-secure">🔒</div>
      </header>

      {/* Progress */}
      {step !== 'success' && (
        <div className="checkout-progress">
          <div className="checkout-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* Order strip */}
      {step !== 'success' && (
        <div className="order-strip">
          <span className="order-strip-name">{productName}</span>
          <span className="order-strip-amount">{formatCurrency(amount)}</span>
        </div>
      )}

      <div className="checkout-body">
        {/* Step 1: User Details */}
        {step === 'details' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <div>
                <h2 className="step-title">Your Details</h2>
                <p className="step-desc">We need a few details to check loan eligibility</p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div className="form-input-prefix">
                <span className="input-prefix">+91</span>
                <input className="form-input" type="tel" placeholder="10 digit mobile number" maxLength={10} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="optional">(optional)</span></label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <button className="checkout-btn" disabled={!isDetailsValid} onClick={goNext}>Continue</button>
          </div>
        )}

        {/* Step 2: Consent */}
        {step === 'consent' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number">2</span>
              <div>
                <h2 className="step-title">Consent & Authorization</h2>
                <p className="step-desc">Required to check your loan eligibility</p>
              </div>
            </div>
            <div className="consent-card">
              <div className="consent-icon">📋</div>
              <h3>Credit Bureau Check</h3>
              <p>We will perform a credit bureau inquiry to determine your eligibility for EMI/loan options. This is a <strong>hard pull</strong> and may temporarily affect your credit score.</p>
              <label className="consent-checkbox">
                <input type="checkbox" checked={consent.bureau} onChange={e => setConsent({ ...consent, bureau: e.target.checked })} />
                <span className="checkmark"></span>
                <span>I authorize {merchant} and its lending partners to access my credit report from CIBIL/Experian/CRIF</span>
              </label>
            </div>
            <div className="consent-card">
              <div className="consent-icon">📄</div>
              <h3>Terms & Conditions</h3>
              <p>By proceeding, you agree to the data collection, processing, and sharing of your personal information with our lending partners for the purpose of loan evaluation.</p>
              <label className="consent-checkbox">
                <input type="checkbox" checked={consent.tnc} onChange={e => setConsent({ ...consent, tnc: e.target.checked })} />
                <span className="checkmark"></span>
                <span>I agree to the <a href="#" onClick={e => e.preventDefault()}>Terms & Conditions</a> and <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a></span>
              </label>
            </div>
            <button className="checkout-btn" disabled={!isConsentValid} onClick={goNext}>Check Eligibility</button>
          </div>
        )}

        {/* Step 3: Eligibility Check */}
        {step === 'eligibility' && (
          <div className="checkout-step eligibility-step">
            <div className="eligibility-animation">
              <div className="eligibility-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e8e8e8" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${eligibilityProgress * 2.83} 283`} transform="rotate(-90 50 50)" />
                </svg>
                <span className="eligibility-percent">{eligibilityProgress}%</span>
              </div>
              <h2 className="eligibility-title">Checking Eligibility</h2>
              <div className="eligibility-checks">
                <div className={`eligibility-check ${eligibilityProgress > 15 ? 'done' : ''}`}>
                  <span className="check-icon">{eligibilityProgress > 15 ? '✓' : '...'}</span> Verifying identity
                </div>
                <div className={`eligibility-check ${eligibilityProgress > 40 ? 'done' : ''}`}>
                  <span className="check-icon">{eligibilityProgress > 40 ? '✓' : '...'}</span> Checking credit score
                </div>
                <div className={`eligibility-check ${eligibilityProgress > 65 ? 'done' : ''}`}>
                  <span className="check-icon">{eligibilityProgress > 65 ? '✓' : '...'}</span> Fetching loan offers
                </div>
                <div className={`eligibility-check ${eligibilityProgress > 85 ? 'done' : ''}`}>
                  <span className="check-icon">{eligibilityProgress > 85 ? '✓' : '...'}</span> Preparing best rates
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Soft Offers */}
        {step === 'offers' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number success-badge">✓</span>
              <div>
                <h2 className="step-title">You're Pre-Approved!</h2>
                <p className="step-desc">Select a lender for your EMI plan</p>
              </div>
            </div>
            <div className="approval-banner">
              <span>🎉</span>
              <div>
                <strong>Congratulations {form.name.split(' ')[0]}!</strong>
                <p>You are eligible for up to {formatCurrency(amount)} in credit</p>
              </div>
            </div>
            <div className="lender-list">
              {LENDERS.map(lender => (
                <div key={lender.id} className={`lender-card ${selectedOffer === lender.id ? 'selected' : ''}`} onClick={() => { setSelectedOffer(lender.id); setSelectedTenure(null); }}>
                  <div className="lender-top">
                    <span className="lender-logo">{lender.logo}</span>
                    <div className="lender-info">
                      <span className="lender-name">{lender.name}</span>
                      <span className="lender-rate">From {lender.rates[0]}% p.a.</span>
                    </div>
                    <div className="lender-radio">{selectedOffer === lender.id && <div className="radio-dot"></div>}</div>
                  </div>
                  {selectedOffer === lender.id && (
                    <div className="tenure-options">
                      <p className="tenure-label">Select tenure:</p>
                      <div className="tenure-grid">
                        {[3, 6, 9, 12, 18, 24].filter(t => t <= lender.maxTenure).map(t => {
                          const rate = lender.noCost?.includes(t) ? 0 : lender.rates[Math.min(Math.floor(t / 12), lender.rates.length - 1)];
                          const emi = calculateEmi(loanAmount, t, rate);
                          return (
                            <div key={t} className={`tenure-chip ${selectedTenure === t ? 'selected' : ''}`} onClick={e => { e.stopPropagation(); setSelectedTenure(t); }}>
                              <span className="tenure-months">{t}mo</span>
                              <span className="tenure-emi">{formatCurrency(emi)}/mo</span>
                              {lender.noCost?.includes(t) && <span className="no-cost-tag">No Cost</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="checkout-btn" disabled={!selectedOffer || !selectedTenure} onClick={goNext}>Continue to KYC</button>
          </div>
        )}

        {/* Step 5: KYC */}
        {step === 'kyc' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number">3</span>
              <div>
                <h2 className="step-title">KYC Verification</h2>
                <p className="step-desc">PAN + Aadhaar oKYC for instant verification</p>
              </div>
            </div>
            <div className="kyc-selected-lender">
              <span>{selectedLender?.logo}</span>
              <span className="kyc-lender-name">{selectedLender?.name}</span>
              <span className="kyc-tenure">{selectedTenure} months @ {selectedRate === 0 ? 'No Cost' : `${selectedRate}%`}</span>
            </div>

            {/* KYC Progress Tabs */}
            <div className="kyc-tabs">
              <div className={`kyc-tab ${kycSubStep === 'pan' ? 'active' : isPanValid ? 'done' : ''}`}>
                <span className="kyc-tab-num">{isPanValid ? '✓' : '1'}</span>
                <span>PAN</span>
              </div>
              <div className="kyc-tab-line"></div>
              <div className={`kyc-tab ${kycSubStep.startsWith('aadhaar') ? 'active' : aadhaarVerified ? 'done' : ''}`}>
                <span className="kyc-tab-num">{aadhaarVerified ? '✓' : '2'}</span>
                <span>Aadhaar oKYC</span>
              </div>
            </div>

            {/* Sub-step: PAN */}
            {kycSubStep === 'pan' && (
              <div className="kyc-substep">
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input className="form-input" type="text" placeholder="ABCDE1234F" maxLength={10} value={kyc.pan} onChange={e => setKyc({ ...kyc, pan: e.target.value.toUpperCase() })} style={{ textTransform: 'uppercase' }} />
                  <span className="form-hint">10-character alphanumeric PAN</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={kyc.dob} onChange={e => setKyc({ ...kyc, dob: e.target.value })} />
                </div>
                <div className="kyc-info-box">
                  <svg width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                  <span>PAN verified instantly via NSDL</span>
                </div>
                <button className="checkout-btn" disabled={!isPanValid} onClick={() => setKycSubStep('aadhaar')}>
                  Verify PAN & Continue
                </button>
              </div>
            )}

            {/* Sub-step: Aadhaar Number */}
            {kycSubStep === 'aadhaar' && (
              <div className="kyc-substep">
                <div className="kyc-pan-verified">
                  <span className="pan-check">✓</span>
                  <span>PAN verified: <strong>{kyc.pan.toUpperCase()}</strong></span>
                </div>
                <div className="aadhaar-header">
                  <div className="aadhaar-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="var(--primary)" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--primary-dark)">A</text></svg>
                  </div>
                  <div>
                    <h3 className="aadhaar-title">Aadhaar Offline KYC</h3>
                    <p className="aadhaar-desc">UIDAI will send an OTP to your Aadhaar-linked mobile number for verification</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number</label>
                  <input className="form-input" type="text" placeholder="1234 5678 9012" maxLength={14}
                    value={kyc.aadhaar.replace(/(\d{4})(?=\d)/g, '$1 ')}
                    onChange={e => setKyc({ ...kyc, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  />
                  <span className="form-hint">12-digit Aadhaar number</span>
                </div>
                <div className="kyc-info-box">
                  <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M5.07 19h13.86c1.1 0 1.78-1.2 1.22-2.14L13.22 4.28a1.38 1.38 0 00-2.44 0L3.85 16.86c-.56.94.12 2.14 1.22 2.14z"/></svg>
                  <span>An OTP will be sent to your Aadhaar-linked mobile. This is a UIDAI-initiated process, not stored by us.</span>
                </div>
                <button className="checkout-btn" disabled={!isAadhaarValid} onClick={handleSendAadhaarOtp}>
                  Send OTP via UIDAI
                </button>
              </div>
            )}

            {/* Sub-step: Aadhaar OTP */}
            {kycSubStep === 'aadhaar-otp' && (
              <div className="kyc-substep">
                <div className="kyc-pan-verified">
                  <span className="pan-check">✓</span>
                  <span>PAN verified: <strong>{kyc.pan.toUpperCase()}</strong></span>
                </div>
                <div className="aadhaar-otp-section">
                  <div className="aadhaar-otp-icon">
                    <svg width="40" height="40" fill="none" stroke="var(--primary)" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  </div>
                  <h3 className="aadhaar-otp-title">Enter UIDAI OTP</h3>
                  <p className="aadhaar-otp-desc">
                    OTP sent to Aadhaar-linked mobile ending in ****{kyc.aadhaar.slice(-4) || '0000'}
                  </p>
                  <div className="otp-inputs">
                    {aadhaarOtp.map((digit, i) => (
                      <input key={i} ref={el => aadhaarOtpRefs.current[i] = el} className="otp-input" type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleAadhaarOtpChange(i, e.target.value)} onKeyDown={e => handleAadhaarOtpKeyDown(i, e)} />
                    ))}
                  </div>
                  <div className="aadhaar-otp-actions">
                    <button className="otp-resend" onClick={() => {}}>Resend OTP</button>
                    <span className="otp-timer">Valid for 10 min</span>
                  </div>
                </div>
                <button className="checkout-btn" disabled={!isAadhaarOtpComplete || aadhaarLoading} onClick={handleVerifyAadhaarOtp}>
                  {aadhaarLoading ? 'Verifying with UIDAI...' : 'Verify Aadhaar'}
                </button>
              </div>
            )}

            {/* Sub-step: Aadhaar Verified */}
            {kycSubStep === 'aadhaar-verified' && aadhaarData && (
              <div className="kyc-substep">
                <div className="kyc-pan-verified">
                  <span className="pan-check">✓</span>
                  <span>PAN verified: <strong>{kyc.pan.toUpperCase()}</strong></span>
                </div>
                <div className="aadhaar-verified-card">
                  <div className="aadhaar-verified-header">
                    <span className="aadhaar-verified-badge">✓ Aadhaar oKYC Complete</span>
                  </div>
                  <div className="aadhaar-verified-details">
                    <div className="aadhaar-detail-row">
                      <span className="aadhaar-detail-label">Name</span>
                      <span className="aadhaar-detail-value">{aadhaarData.name}</span>
                    </div>
                    <div className="aadhaar-detail-row">
                      <span className="aadhaar-detail-label">Date of Birth</span>
                      <span className="aadhaar-detail-value">{aadhaarData.dob}</span>
                    </div>
                    <div className="aadhaar-detail-row">
                      <span className="aadhaar-detail-label">Gender</span>
                      <span className="aadhaar-detail-value">{aadhaarData.gender}</span>
                    </div>
                    <div className="aadhaar-detail-row">
                      <span className="aadhaar-detail-label">Address</span>
                      <span className="aadhaar-detail-value">{aadhaarData.address}</span>
                    </div>
                    <div className="aadhaar-detail-row">
                      <span className="aadhaar-detail-label">Aadhaar</span>
                      <span className="aadhaar-detail-value">{aadhaarData.maskedAadhaar}</span>
                    </div>
                  </div>
                </div>
                <div className="kyc-info-box" style={{ background: '#f0fdf4', color: '#166534' }}>
                  <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>KYC verification complete. Your identity has been verified via UIDAI.</span>
                </div>
                <button className="checkout-btn" onClick={goNext}>Continue to Loan Offer</button>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Final Offers */}
        {step === 'final-offers' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number success-badge">✓</span>
              <div>
                <h2 className="step-title">Your Loan Offer</h2>
                <p className="step-desc">KYC verified successfully</p>
              </div>
            </div>
            <div className="final-offer-card">
              <div className="final-offer-header">
                <span>{selectedLender?.logo}</span>
                <span className="final-lender-name">{selectedLender?.name}</span>
                <span className="final-verified">✓ Verified</span>
              </div>
              <div className="final-offer-grid">
                <div className="final-offer-item">
                  <span className="fo-label">Loan Amount</span>
                  <span className="fo-value">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="final-offer-item">
                  <span className="fo-label">Tenure</span>
                  <span className="fo-value">{selectedTenure} months</span>
                </div>
                <div className="final-offer-item">
                  <span className="fo-label">Interest Rate</span>
                  <span className="fo-value">{selectedRate === 0 ? 'No Cost EMI' : `${selectedRate}% p.a.`}</span>
                </div>
                <div className="final-offer-item">
                  <span className="fo-label">Monthly EMI</span>
                  <span className="fo-value fo-highlight">{formatCurrency(emiAmount)}</span>
                </div>
                <div className="final-offer-item">
                  <span className="fo-label">Total Payable</span>
                  <span className="fo-value">{formatCurrency(totalPayable + downpaymentAmount)}</span>
                </div>
                <div className="final-offer-item">
                  <span className="fo-label">Total Interest</span>
                  <span className="fo-value">{selectedRate === 0 ? formatCurrency(0) : formatCurrency(totalInterest)}</span>
                </div>
              </div>
              <div className="final-offer-dp">
                <span>Down Payment (10%)</span>
                <span className="fo-dp-amount">{formatCurrency(downpaymentAmount)}</span>
              </div>
            </div>
            <button className="checkout-btn" onClick={goNext}>Pay Down Payment</button>
          </div>
        )}

        {/* Step 7: Down Payment */}
        {step === 'downpayment' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number">4</span>
              <div>
                <h2 className="step-title">Down Payment</h2>
                <p className="step-desc">Pay {formatCurrency(downpaymentAmount)} to proceed</p>
              </div>
            </div>
            <div className="dp-amount-box">
              <span className="dp-amount">{formatCurrency(downpaymentAmount)}</span>
              <span className="dp-label">Due now</span>
            </div>
            <div className="dp-methods">
              {[{ id: 'upi', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' }, { id: 'card', name: 'Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' }].map(m => (
                <div key={m.id} className={`dp-method ${downpaymentMethod === m.id ? 'selected' : ''}`} onClick={() => setDownpaymentMethod(m.id)}>
                  <span className="dp-method-icon">{m.icon}</span>
                  <div className="dp-method-info">
                    <span className="dp-method-name">{m.name}</span>
                    <span className="dp-method-desc">{m.desc}</span>
                  </div>
                  <div className="lender-radio">{downpaymentMethod === m.id && <div className="radio-dot"></div>}</div>
                </div>
              ))}
            </div>
            {downpaymentMethod === 'upi' && (
              <div className="form-group">
                <label className="form-label">UPI ID</label>
                <input className="form-input" type="text" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
              </div>
            )}
            <button className="checkout-btn" disabled={downpaymentMethod === 'upi' && !upiId.includes('@')} onClick={goNext}>
              Pay {formatCurrency(downpaymentAmount)}
            </button>
          </div>
        )}

        {/* Step 8: KFS + OTP */}
        {step === 'kfs' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number">5</span>
              <div>
                <h2 className="step-title">Key Fact Statement</h2>
                <p className="step-desc">Review and confirm with OTP</p>
              </div>
            </div>
            <div className="kfs-card">
              <h3 className="kfs-title">Key Fact Statement (KFS)</h3>
              <p className="kfs-subtitle">As mandated by RBI</p>
              <div className="kfs-table">
                <div className="kfs-row"><span>Borrower</span><span>{form.name}</span></div>
                <div className="kfs-row"><span>Lender</span><span>{selectedLender?.name}</span></div>
                <div className="kfs-row"><span>Product</span><span>{productName}</span></div>
                <div className="kfs-row"><span>Loan Amount</span><span>{formatCurrency(loanAmount)}</span></div>
                <div className="kfs-row"><span>Down Payment</span><span>{formatCurrency(downpaymentAmount)}</span></div>
                <div className="kfs-row"><span>Tenure</span><span>{selectedTenure} months</span></div>
                <div className="kfs-row"><span>Interest Rate</span><span>{selectedRate === 0 ? '0% (No Cost)' : `${selectedRate}% p.a.`}</span></div>
                <div className="kfs-row"><span>Monthly EMI</span><span className="kfs-highlight">{formatCurrency(emiAmount)}</span></div>
                <div className="kfs-row"><span>Total Interest</span><span>{formatCurrency(selectedRate === 0 ? 0 : totalInterest)}</span></div>
                <div className="kfs-row kfs-total"><span>Total Amount Payable</span><span>{formatCurrency(totalPayable + downpaymentAmount)}</span></div>
                <div className="kfs-row"><span>Processing Fee</span><span>{formatCurrency(0)}</span></div>
                <div className="kfs-row"><span>APR</span><span>{selectedRate === 0 ? '0%' : `${(selectedRate + 0.5).toFixed(1)}%`}</span></div>
              </div>
              <label className="consent-checkbox kfs-consent">
                <input type="checkbox" checked={kfsAccepted} onChange={e => setKfsAccepted(e.target.checked)} />
                <span className="checkmark"></span>
                <span>I have read and agree to the Key Fact Statement and loan agreement terms</span>
              </label>
            </div>
            {kfsAccepted && (
              <div className="otp-section">
                <p className="otp-label">Enter OTP sent to +91 {form.mobile.slice(0, 2)}****{form.mobile.slice(-2)}</p>
                <div className="otp-inputs">
                  {otp.map((digit, i) => (
                    <input key={i} ref={el => otpRefs.current[i] = el} className="otp-input" type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} />
                  ))}
                </div>
                <button className="otp-resend" onClick={() => {}}>Resend OTP</button>
              </div>
            )}
            <button className="checkout-btn" disabled={!kfsAccepted || !isOtpComplete} onClick={goNext}>Confirm & Disburse</button>
          </div>
        )}

        {/* Step 9: Success */}
        {step === 'success' && (
          <div className="checkout-step success-step">
            <div className="success-animation">
              <div className="success-circle">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <h2 className="success-title">Purchase Successful!</h2>
            <p className="success-subtitle">Your loan has been approved and disbursed</p>
            <div className="success-details">
              <div className="success-row"><span>Product</span><span>{productName}</span></div>
              <div className="success-row"><span>Lender</span><span>{selectedLender?.name}</span></div>
              <div className="success-row"><span>Loan Amount</span><span>{formatCurrency(loanAmount)}</span></div>
              <div className="success-row"><span>EMI</span><span>{formatCurrency(emiAmount)}/mo x {selectedTenure} months</span></div>
              <div className="success-row"><span>Down Payment</span><span>{formatCurrency(downpaymentAmount)} (Paid)</span></div>
              <div className="success-row success-total"><span>Order ID</span><span>#{orderIdRef.current}</span></div>
            </div>
            <div className="success-actions">
              <button className="checkout-btn" onClick={handleBack}>Back to Shopping</button>
              <button className="checkout-btn-secondary" onClick={downloadReceipt}>Download Receipt</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {step !== 'success' && (
        <div className="checkout-footer">
          <span>🔒 Secured by Juspay</span>
          <span>•</span>
          <span>PCI DSS Compliant</span>
          <span>•</span>
          <span>RBI Regulated</span>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
