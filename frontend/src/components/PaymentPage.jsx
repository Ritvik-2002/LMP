import { useState } from 'react';
import './PaymentPage.css';

// Format currency
const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const paymentMethods = [
  { id: 'emi', name: 'EMI', icon: '💳', description: 'Pay in easy monthly installments' },
  { id: 'card', name: 'Credit/Debit Card', icon: '💰', description: 'Visa, Mastercard, RuPay' },
  { id: 'upi', name: 'UPI', icon: '📱', description: 'Google Pay, PhonePe, Paytm' },
  { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'All major banks supported' },
  { id: 'wallet', name: 'Wallets', icon: '👛', description: 'Paytm, Amazon Pay, Mobikwik' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive' },
];

const emiPlans = [
  { months: 3, interest: '12%', emi: null },
  { months: 6, interest: '12%', emi: null },
  { months: 9, interest: '13%', emi: null },
  { months: 12, interest: '13%', emi: null },
  { months: 18, interest: '14%', emi: null },
  { months: 24, interest: '15%', emi: null },
];

function PaymentPage({ data, theme, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState('emi');
  const [selectedEmiPlan, setSelectedEmiPlan] = useState(null);

  const { device, loan_request, merchant } = data;
  const amount = loan_request.amount;
  const currency = loan_request.currency;

  // Calculate EMI
  const calculateEmi = (principal, months, interestRate) => {
    const monthlyRate = interestRate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const handlePayment = () => {
    alert(`Proceeding with ${selectedMethod.toUpperCase()} payment for ${device.model}`);
  };

  return (
    <div className="payment-container">
      {/* Header */}
      <header className="payment-header" style={{ background: theme.gradient }}>
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Checkout</h1>
      </header>

      {/* Order Summary */}
      <div className="order-summary">
        <div className="order-item">
          <div className="order-item-info">
            <h3>{device.model}</h3>
            <p>{device.brand} • {device.release_year}</p>
          </div>
          <div className="order-item-price">
            {formatCurrency(amount, currency)}
          </div>
        </div>
        <div className="order-divider"></div>
        <div className="order-total">
          <span>Total Amount</span>
          <span className="total-amount">{formatCurrency(amount, currency)}</span>
        </div>
      </div>

      {/* Loan Details Preview */}
      {selectedMethod === 'emi' && (
        <div className="loan-preview">
          <div className="loan-preview-header">
            <span>💳</span>
            <h3>Loan Details</h3>
          </div>
          <div className="loan-details-grid">
            <div className="loan-detail">
              <span className="loan-detail-label">Loan Amount</span>
              <span className="loan-detail-value">{formatCurrency(amount, currency)}</span>
            </div>
            <div className="loan-detail">
              <span className="loan-detail-label">Purpose</span>
              <span className="loan-detail-value">{loan_request.purpose.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="payment-section">
        <h2 className="section-title">Select Payment Method</h2>
        <div className="payment-methods">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <span className="payment-icon">{method.icon}</span>
              <div className="payment-info">
                <span className="payment-name">{method.name}</span>
                <span className="payment-desc">{method.description}</span>
              </div>
              <div className="payment-radio">
                {selectedMethod === method.id && <div className="radio-filled" style={{ background: theme.primary }}></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EMI Plans */}
      {selectedMethod === 'emi' && (
        <div className="emi-section">
          <h2 className="section-title">Select EMI Plan</h2>
          <div className="emi-plans">
            {emiPlans.map((plan) => {
              const emiAmount = calculateEmi(amount, plan.months, parseFloat(plan.interest));
              return (
                <div
                  key={plan.months}
                  className={`emi-plan ${selectedEmiPlan === plan.months ? 'selected' : ''}`}
                  onClick={() => setSelectedEmiPlan(plan.months)}
                  style={selectedEmiPlan === plan.months ? { borderColor: theme.primary } : {}}
                >
                  <div className="emi-duration">{plan.months} months</div>
                  <div className="emi-amount" style={selectedEmiPlan === plan.months ? { color: theme.primary } : {}}>
                    {formatCurrency(emiAmount, currency)}/mo
                  </div>
                  <div className="emi-interest">@ {plan.interest} p.a.</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pay Button */}
      <div className="payment-action">
        <button
          className="pay-button"
          onClick={handlePayment}
          style={{ background: theme.gradient }}
          disabled={selectedMethod === 'emi' && !selectedEmiPlan}
        >
          {selectedMethod === 'emi' && selectedEmiPlan
            ? `Pay ${formatCurrency(calculateEmi(amount, selectedEmiPlan, 13), currency)}/mo for ${selectedEmiPlan} months`
            : selectedMethod === 'emi'
            ? 'Select an EMI Plan'
            : `Pay ${formatCurrency(amount, currency)}`
          }
        </button>
      </div>

      {/* Secure Footer */}
      <div className="secure-footer">
        <span>🔒 100% Secure Payments</span>
        <span className="powered-by">Powered by {merchant.merchant_name}</span>
      </div>
    </div>
  );
}

export default PaymentPage;
