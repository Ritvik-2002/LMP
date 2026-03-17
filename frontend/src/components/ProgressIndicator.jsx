// macOS-style progress indicator — capsule dots with labels
const STAGES = [
  { label: 'Browse' },
  { label: 'Details' },
  { label: 'Eligibility' },
  { label: 'KYC' },
  { label: 'Payment' },
  { label: 'Done' },
];

const ProgressIndicator = ({ current = 0 }) => (
  <div className="progress-indicator">
    {STAGES.map((stage, i) => (
      <div
        key={stage.label}
        className={`progress-pill ${i < current ? 'completed' : ''} ${i === current ? 'active' : ''}`}
      >
        <span className="progress-dot" />
        <span className="progress-label">{stage.label}</span>
      </div>
    ))}
  </div>
);

export default ProgressIndicator;
