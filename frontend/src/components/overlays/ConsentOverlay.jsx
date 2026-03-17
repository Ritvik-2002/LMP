import { useState } from 'react';
import BottomSheet from './BottomSheet';

const CONSENTS = [
  {
    id: 'bureau',
    title: 'Credit Bureau Authorization',
    body: 'I authorize Fibe, TVS Credit, and DMI Finance to access my credit report from credit bureaus (CIBIL, Equifax, Experian, CRIF High Mark) for the purpose of evaluating my loan application. This may result in a hard enquiry on my credit record.',
  },
  {
    id: 'lenderShare',
    title: 'Data Sharing with Lending Partners',
    body: 'I consent to the sharing of my personal, financial, and KYC information with Fibe (EarlySalary), TVS Credit Services, and DMI Finance for processing my loan application, underwriting, and disbursement.',
  },
  {
    id: 'aadhaarKyc',
    title: 'Aadhaar-Based KYC Consent',
    body: 'I voluntarily consent to use my Aadhaar number for e-KYC verification as per the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016. I understand this is optional and I can alternatively submit physical KYC documents.',
  },
  {
    id: 'tnc',
    title: 'Terms & Conditions',
    body: 'I have read, understood, and agree to the Terms & Conditions of this platform and the applicable loan agreement terms of the selected lending partner. I acknowledge that the loan is subject to credit assessment and lender approval.',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    body: 'I have read and agree to the Privacy Policy governing the collection, storage, processing, and use of my personal data. I understand my data will be retained as required by applicable laws including RBI guidelines.',
  },
  {
    id: 'communication',
    title: 'Communication Consent',
    body: 'I consent to receive calls, SMS, WhatsApp messages, and emails from this platform and its lending partners regarding my loan application status, repayment reminders, and offers. I can opt out at any time.',
  },
];

const ConsentOverlay = ({ isOpen, onClose, onConsented, lenders }) => {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState(null);

  const allChecked = CONSENTS.every(c => checked[c.id]);

  const toggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    if (allChecked) {
      setChecked({});
    } else {
      const all = {};
      CONSENTS.forEach(c => { all[c.id] = true; });
      setChecked(all);
    }
  };

  const handleAccept = () => {
    if (!allChecked) return;
    onConsented?.(Object.keys(checked).filter(k => checked[k]));
  };

  const handleClose = () => {
    setChecked({});
    setExpanded(null);
    onClose?.();
  };

  const lenderNames = lenders?.join(', ') || 'Fibe, TVS Credit, DMI Finance';

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Consent & Authorization">
      <div className="consent-overlay">
        <div className="consent-intro">
          <svg width="20" height="20" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p>Your loan application will be processed by <strong>{lenderNames}</strong>. Please review and accept each consent below to proceed.</p>
        </div>

        <button className="consent-select-all" onClick={toggleAll}>
          <div className={`consent-checkbox ${allChecked ? 'checked' : ''}`}>
            {allChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span>{allChecked ? 'Deselect All' : 'Accept All Consents'}</span>
        </button>

        <div className="consent-list">
          {CONSENTS.map(consent => (
            <div key={consent.id} className={`consent-item ${checked[consent.id] ? 'checked' : ''}`}>
              <div className="consent-item-header" onClick={() => setExpanded(expanded === consent.id ? null : consent.id)}>
                <button
                  className={`consent-checkbox ${checked[consent.id] ? 'checked' : ''}`}
                  onClick={e => { e.stopPropagation(); toggle(consent.id); }}
                >
                  {checked[consent.id] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                <span className="consent-title">{consent.title}</span>
                <svg
                  className={`consent-chevron ${expanded === consent.id ? 'open' : ''}`}
                  width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              {expanded === consent.id && (
                <p className="consent-body">{consent.body}</p>
              )}
            </div>
          ))}
        </div>

        <div className="consent-footer">
          <p className="consent-legal">By tapping "I Accept All", you provide legally valid digital consent under the Information Technology Act, 2000.</p>
          <button
            className={`overlay-btn ${allChecked ? '' : 'disabled'}`}
            disabled={!allChecked}
            onClick={handleAccept}
          >
            I Accept All ({CONSENTS.filter(c => checked[c.id]).length}/{CONSENTS.length})
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default ConsentOverlay;
