const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

const LENDER_COLORS = {
  fibe: '#6C5CE7',
  tvs: '#E74C3C',
  dmi: '#2980B9',
};

const OfferCard = ({ offerData, onSelect }) => {
  if (!offerData || !offerData.lenders) return null;

  return (
    <div className="rich-offer-cards">
      <div className="offer-header-info">
        <span className="offer-loan-label">Loan Amount</span>
        <span className="offer-loan-amount">{formatPrice(offerData.loanAmount)}</span>
        <span className="offer-dp-info">Down payment: {formatPrice(offerData.downpayment)}</span>
      </div>
      {offerData.lenders.map((lender) => (
        <div key={lender.id} className="offer-lender-card">
          <div className="offer-lender-top">
            <span className="offer-lender-logo" style={{ background: LENDER_COLORS[lender.id] || '#666' }}>
              {lender.name.charAt(0)}
            </span>
            <div className="offer-lender-info">
              <span className="offer-lender-name">{lender.name}</span>
              <span className="offer-lender-rate">From {lender.rate}% p.a.</span>
            </div>
          </div>
          <div className="offer-tenure-grid">
            {lender.tenures.map((t) => (
              <button
                key={t.months}
                className="offer-tenure-chip"
                onClick={() => onSelect?.({ lenderId: lender.id, lenderName: lender.name, tenure: t.months, emi: t.emi, rate: t.rate })}
              >
                <span className="otc-months">{t.months}mo</span>
                <span className="otc-emi">{formatPrice(t.emi)}/mo</span>
                {t.noCost && <span className="otc-nocost">No Cost</span>}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfferCard;
