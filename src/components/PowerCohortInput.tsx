import './PowerCohortInput.css';
import type { PowerCohortInput as InputType } from '../lib/powerCohort';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
  exposedLabel: string;
  unexposedLabel: string;
  outcomeLabel: string;
}

export default function PowerCohortInput({
  value,
  onChange,
  exposedLabel,
  unexposedLabel,
  outcomeLabel,
}: Props) {
  return (
    <div className="pcoh-input-wrapper">
      <div className="pcoh-field">
        <span className="pcoh-field-label">Two-sided confidence level, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={99.99}
          step={0.1}
          className="pcoh-number-input"
          value={value.confidenceLevel * 100}
          onChange={(e) =>
            onChange({ ...value, confidenceLevel: (parseFloat(e.target.value) || 0) / 100 })
          }
        />
      </div>

      <div className="pcoh-field">
        <span className="pcoh-field-label">Number {exposedLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          className="pcoh-number-input"
          value={value.exposed}
          onChange={(e) => onChange({ ...value, exposed: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="pcoh-field">
        <span className="pcoh-field-label">Number {unexposedLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          className="pcoh-number-input"
          value={value.unexposed}
          onChange={(e) => onChange({ ...value, unexposed: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="pcoh-field">
        <span className="pcoh-field-label">{outcomeLabel}, {exposedLabel}, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          className="pcoh-number-input"
          value={value.exposedOutcome * 100}
          onChange={(e) =>
            onChange({ ...value, exposedOutcome: (parseFloat(e.target.value) || 0) / 100 })
          }
        />
      </div>

      <div className="pcoh-field">
        <span className="pcoh-field-label">{outcomeLabel}, {unexposedLabel}, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          className="pcoh-number-input"
          value={value.unexposedOutcome * 100}
          onChange={(e) =>
            onChange({ ...value, unexposedOutcome: (parseFloat(e.target.value) || 0) / 100 })
          }
        />
      </div>
    </div>
  );
}
