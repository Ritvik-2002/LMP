import { useState, useEffect, useRef } from 'react';
import './PaymentPage.css';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const JuspayLogo = ({ size = 24 }) => (
  <img
    src="https://cdn.theorg.com/ccf55d93-b311-46ad-b820-2c25615e51a2_medium.jpg"
    alt="Juspay"
    style={{ width: size, height: size, borderRadius: 4, objectFit: 'contain' }}
  />
);

const STEPS = ['details', 'consent', 'eligibility', 'offers', 'kyc', 'final-offers', 'downpayment', 'repayment', 'kfs', 'success'];

const LENDERS = [
  { id: 'fibe', name: 'Fibe', logo: 'F', logoColor: '#6C5CE7', rates: [14, 14.5, 15], maxTenure: 24, noCost: [3, 6] },
  { id: 'tvs', name: 'TVS Credit', logo: 'T', logoColor: '#E74C3C', rates: [13, 13.5, 14], maxTenure: 24 },
  { id: 'dmi', name: 'DMI Finance', logo: 'D', logoColor: '#2980B9', rates: [12.5, 13, 13.5], maxTenure: 18 },
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

function PaymentPage({ data, theme, onBack, onOrderComplete }) {
  const saved = useRef(loadSession()).current;

  const [step, setStep] = useState(saved?.step || 'details');
  const [form, setForm] = useState(saved?.form || { name: '', mobile: '', email: '', employment: '', salary: '' });
  const [consent, setConsent] = useState(saved?.consent || { bureau: false, tnc: false, lenderShare: false });
  const [repaymentMethod, setRepaymentMethod] = useState(saved?.repaymentMethod || '');
  const [cashOtp, setCashOtp] = useState(['', '', '', '']);
  const [cashOtpSent, setCashOtpSent] = useState(false);
  const [cashOtpVerified, setCashOtpVerified] = useState(false);
  const [cashOtpCode, setCashOtpCode] = useState('');
  const cashOtpRefs = useRef([]);
  const [kyc, setKyc] = useState(saved?.kyc || { pan: '', dob: '', aadhaar: '' });
  const [kycSubStep, setKycSubStep] = useState(saved?.kycSubStep || 'aadhaar');
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
      selectedOffer, selectedTenure, downpaymentMethod, upiId, repaymentMethod,
      orderId: orderIdRef.current,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [step, form, consent, kyc, kycSubStep, aadhaarVerified, aadhaarData, selectedOffer, selectedTenure, downpaymentMethod, upiId, repaymentMethod]);

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
      if (nextStep === 'success') {
        clearSession();
        if (onOrderComplete) onOrderComplete();
      }
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

  const handleCashOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...cashOtp];
    newOtp[index] = value;
    setCashOtp(newOtp);
    if (value && index < 3) cashOtpRefs.current[index + 1]?.focus();
  };

  const handleCashOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !cashOtp[index] && index > 0) cashOtpRefs.current[index - 1]?.focus();
  };

  const handleSendCashOtp = () => {
    // Generate a 4-digit code and "send" to agent
    const code = '1111';
    setCashOtpCode(code);
    setCashOtpSent(true);
  };

  const handleVerifyCashOtp = () => {
    const entered = cashOtp.join('');
    if (entered === cashOtpCode) {
      setCashOtpVerified(true);
    }
  };

  const isCashOtpComplete = cashOtp.every(d => d !== '');

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

  const isDetailsValid = form.name.trim().length >= 2 && /^[6-9]\d{9}$/.test(form.mobile) && form.employment && form.salary;
  const isConsentValid = consent.bureau && consent.tnc && consent.lenderShare;
  const fetchedPan = `BXYPK${form.mobile.slice(-4) || '0000'}R`;
  const isAadhaarValid = /^\d{12}$/.test(kyc.aadhaar);
  const isAadhaarOtpComplete = aadhaarOtp.every(d => d !== '');
  const isKycValid = aadhaarVerified;
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
          <span className="checkout-merchant">
            <JuspayLogo size={18} />
            Powered by Juspay
          </span>
        </div>
        <div className="checkout-secure">
          <svg width="18" height="18" fill="none" stroke="#2B6CB0" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
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
            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <div className="employment-options">
                {['Salaried', 'Self-Employed', 'Business', 'Freelancer'].map(type => (
                  <button key={type} className={`employment-chip ${form.employment === type ? 'selected' : ''}`} onClick={() => setForm({ ...form, employment: type })}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Income</label>
              <div className="form-input-prefix">
                <span className="input-prefix">₹</span>
                <input className="form-input" type="text" inputMode="numeric" placeholder="e.g. 50000" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value.replace(/\D/g, '') })} />
              </div>
              <span className="form-hint">Approximate monthly take-home salary</span>
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
              <div className="consent-icon">🏦</div>
              <h3>Lender Data Sharing</h3>
              <p>Your personal information (name, contact, income, KYC documents) will be shared with our lending partners — Fibe, TVS Credit, and DMI Finance — to evaluate and process your loan application.</p>
              <div className="consent-lender-logos">
                {LENDERS.map(l => (
                  <span key={l.id} className="consent-lender-tag">{l.logo} {l.name}</span>
                ))}
              </div>
              <label className="consent-checkbox">
                <input type="checkbox" checked={consent.lenderShare} onChange={e => setConsent({ ...consent, lenderShare: e.target.checked })} />
                <span className="checkmark"></span>
                <span>I consent to sharing my data with the above lending partners for loan processing</span>
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
                    <span className="lender-logo" style={{ background: lender.logoColor }}>{lender.logo}</span>
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
                <p className="step-desc">Aadhaar oKYC for instant verification</p>
              </div>
            </div>
            <div className="kyc-selected-lender">
              <span className="lender-logo-sm" style={{ background: selectedLender?.logoColor }}>{selectedLender?.logo}</span>
              <span className="kyc-lender-name">{selectedLender?.name}</span>
              <span className="kyc-tenure">{selectedTenure} months @ {selectedRate === 0 ? 'No Cost' : `${selectedRate}%`}</span>
            </div>

            {/* Auto-fetched PAN */}
            <div className="kyc-pan-verified">
              <span className="pan-check">✓</span>
              <span>PAN fetched via mobile: <strong>{fetchedPan}</strong></span>
            </div>

            {/* Sub-step: Aadhaar Number */}
            {kycSubStep === 'aadhaar' && (
              <div className="kyc-substep">
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
                <span className="lender-logo-sm" style={{ background: selectedLender?.logoColor }}>{selectedLender?.logo}</span>
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
              {[
                { id: 'upi', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
                { id: 'card', name: 'Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
                { id: 'cash', name: 'Cash at Store', icon: '💵', desc: 'Pay cash to store agent' },
              ].map(m => (
                <div key={m.id} className={`dp-method ${downpaymentMethod === m.id ? 'selected' : ''}`} onClick={() => { setDownpaymentMethod(m.id); setCashOtpSent(false); setCashOtpVerified(false); setCashOtp(['','','','']); }}>
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
            {downpaymentMethod === 'cash' && (
              <div className="cash-dp-section">
                {!cashOtpSent && (
                  <div className="cash-instructions">
                    <div className="cash-step-card">
                      <span className="cash-step-num">1</span>
                      <div>
                        <strong>Hand over {formatCurrency(downpaymentAmount)} cash</strong>
                        <p>Give the exact amount to the store agent at the counter</p>
                      </div>
                    </div>
                    <div className="cash-step-card">
                      <span className="cash-step-num">2</span>
                      <div>
                        <strong>Agent confirms collection</strong>
                        <p>The agent will enter a verification OTP to confirm cash received</p>
                      </div>
                    </div>
                    <button className="checkout-btn" onClick={handleSendCashOtp}>
                      Generate Agent OTP
                    </button>
                  </div>
                )}
                {cashOtpSent && !cashOtpVerified && (
                  <div className="cash-otp-section">
                    <div className="cash-otp-display">
                      <div className="cash-otp-badge">OTP Sent to Agent</div>
                      <p className="cash-otp-hint">A 4-digit verification code has been sent to the store agent's device. Ask the agent to enter it below to confirm cash collection.</p>
                    </div>
                    <div className="cash-otp-divider">
                      <span>Agent enters OTP below</span>
                    </div>
                    <div className="otp-inputs">
                      {cashOtp.map((digit, i) => (
                        <input key={i} ref={el => cashOtpRefs.current[i] = el} className="otp-input" type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleCashOtpChange(i, e.target.value)} onKeyDown={e => handleCashOtpKeyDown(i, e)} />
                      ))}
                    </div>
                    {isCashOtpComplete && cashOtp.join('') !== cashOtpCode && (
                      <p className="cash-otp-error">Incorrect code. Please check and try again.</p>
                    )}
                    <button className="checkout-btn" disabled={!isCashOtpComplete} onClick={handleVerifyCashOtp}>
                      Confirm Cash Received
                    </button>
                  </div>
                )}
                {cashOtpVerified && (
                  <div className="cash-verified">
                    <div className="cash-verified-icon">
                      <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h4>Cash Collected Successfully</h4>
                    <p>{formatCurrency(downpaymentAmount)} received and confirmed by agent</p>
                  </div>
                )}
              </div>
            )}
            <button
              className="checkout-btn"
              style={{ display: downpaymentMethod === 'cash' && !cashOtpVerified ? 'none' : undefined }}
              disabled={
                (downpaymentMethod === 'upi' && !upiId.includes('@')) ||
                (downpaymentMethod === 'cash' && !cashOtpVerified)
              }
              onClick={goNext}
            >
              {downpaymentMethod === 'cash' ? 'Continue' : `Pay ${formatCurrency(downpaymentAmount)}`}
            </button>
          </div>
        )}

        {/* Step 8: Repayment Setup */}
        {step === 'repayment' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number">5</span>
              <div>
                <h2 className="step-title">Repayment Setup</h2>
                <p className="step-desc">Set up auto-debit for monthly EMI payments</p>
              </div>
            </div>
            <div className="repayment-summary">
              <div className="repayment-summary-row">
                <span>EMI Amount</span>
                <span className="repayment-emi">{formatCurrency(emiAmount)}/month</span>
              </div>
              <div className="repayment-summary-row">
                <span>Tenure</span>
                <span>{selectedTenure} months</span>
              </div>
              <div className="repayment-summary-row">
                <span>Lender</span>
                <span>{selectedLender?.name}</span>
              </div>
            </div>

            <h3 className="repayment-section-title">Choose Mandate Type</h3>
            <div className="repayment-methods">
              <div className={`repayment-method ${repaymentMethod === 'upi-autopay' ? 'selected' : ''}`} onClick={() => setRepaymentMethod('upi-autopay')}>
                <div className="repayment-method-icon">📱</div>
                <div className="repayment-method-info">
                  <span className="repayment-method-name">UPI AutoPay</span>
                  <span className="repayment-method-desc">Auto-debit from your UPI-linked bank account. Supports Google Pay, PhonePe, Paytm, BHIM.</span>
                </div>
                <div className="lender-radio">{repaymentMethod === 'upi-autopay' && <div className="radio-dot"></div>}</div>
              </div>
              <div className={`repayment-method ${repaymentMethod === 'enach' ? 'selected' : ''}`} onClick={() => setRepaymentMethod('enach')}>
                <div className="repayment-method-icon">🏦</div>
                <div className="repayment-method-info">
                  <span className="repayment-method-name">eNACH</span>
                  <span className="repayment-method-desc">Electronic NACH mandate registered with your bank. Auto-debits on a fixed date each month.</span>
                </div>
                <div className="lender-radio">{repaymentMethod === 'enach' && <div className="radio-dot"></div>}</div>
              </div>
              <div className={`repayment-method ${repaymentMethod === 'debit-card' ? 'selected' : ''}`} onClick={() => setRepaymentMethod('debit-card')}>
                <div className="repayment-method-icon">💳</div>
                <div className="repayment-method-info">
                  <span className="repayment-method-name">Debit Card Standing Instruction</span>
                  <span className="repayment-method-desc">Set up recurring payment via Visa/Mastercard/RuPay debit card mandate.</span>
                </div>
                <div className="lender-radio">{repaymentMethod === 'debit-card' && <div className="radio-dot"></div>}</div>
              </div>
            </div>

            {repaymentMethod && (
              <div className="repayment-details-box">
                {repaymentMethod === 'upi-autopay' && (
                  <>
                    <h4>UPI AutoPay Setup</h4>
                    <p>A mandate request will be sent to your UPI app. Approve the auto-debit of <strong>{formatCurrency(emiAmount)}</strong> on the 5th of every month.</p>
                    <div className="repayment-info-row">
                      <span>Max Amount</span><span>{formatCurrency(emiAmount)}</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Frequency</span><span>Monthly</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Debit Date</span><span>5th of every month</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Valid Until</span><span>{selectedTenure} months from activation</span>
                    </div>
                  </>
                )}
                {repaymentMethod === 'enach' && (
                  <>
                    <h4>eNACH Mandate Registration</h4>
                    <p>You will be redirected to your bank's net banking portal to authorize the eNACH mandate for <strong>{formatCurrency(emiAmount)}</strong> monthly.</p>
                    <div className="repayment-info-row">
                      <span>UMRN</span><span>Auto-generated</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Max Amount</span><span>{formatCurrency(emiAmount)}</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Frequency</span><span>Monthly</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Debit Date</span><span>5th of every month</span>
                    </div>
                  </>
                )}
                {repaymentMethod === 'debit-card' && (
                  <>
                    <h4>Debit Card Standing Instruction</h4>
                    <p>A standing instruction of <strong>{formatCurrency(emiAmount)}</strong> will be set up on your debit card for monthly auto-debit.</p>
                    <div className="repayment-info-row">
                      <span>Card Networks</span><span>Visa / Mastercard / RuPay</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Max Amount</span><span>{formatCurrency(emiAmount)}</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Frequency</span><span>Monthly</span>
                    </div>
                    <div className="repayment-info-row">
                      <span>Debit Date</span><span>5th of every month</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="kyc-info-box">
              <svg width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
              <span>Mandate setup is required by RBI guidelines for EMI-based lending. You can cancel anytime after loan closure.</span>
            </div>

            <button className="checkout-btn" disabled={!repaymentMethod} onClick={goNext}>
              Setup Mandate & Continue
            </button>
          </div>
        )}

        {/* Step 9: KFS + OTP */}
        {step === 'kfs' && (
          <div className="checkout-step">
            <div className="step-header">
              <span className="step-number">6</span>
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
          <span className="footer-secured"><JuspayLogo size={14} /> Secured by Juspay</span>
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
