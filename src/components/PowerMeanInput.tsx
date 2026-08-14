import './PowerCCInput.css';
import type { PowerMeanInput as InputType } from '../lib/powerMean';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
}

export default function PowerMeanInput({ value, onChange }: Props) {
  return (
    <div className="pcc-input-wrapper">
      <div className="pcc-field">
        <span className="pcc-field-label">Two-sided confidence level, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={99.99}
          step={0.1}
          className="pcc-number-input"
          value={value.confidenceLevel * 100}
          onChange={(e) =>
            onChange({ ...value, confidenceLevel: (parseFloat(e.target.value) || 0) / 100 })
          }
        />
      </div>

      <div className="pcc-field">
        <span className="pcc-field-label">Mean difference (Group 1 - Group 2)</span>
        <input
          type="number"
          inputMode="decimal"
          step={0.01}
          className="pcc-number-input"
          value={value.meanDifference}
          onChange={(e) => onChange({ ...value, meanDifference: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="pcc-field">
        <span className="pcc-field-label">Group 1: sample size (n1)</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          className="pcc-number-input"
          value={value.n1}
          onChange={(e) => onChange({ ...value, n1: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="pcc-field">
        <span className="pcc-field-label">Group 1: standard deviation (s1)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="pcc-number-input"
          value={value.s1}
          onChange={(e) => onChange({ ...value, s1: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="pcc-field">
        <span className="pcc-field-label">Group 2: sample size (n2)</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          className="pcc-number-input"
          value={value.n2}
          onChange={(e) => onChange({ ...value, n2: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="pcc-field">
        <span className="pcc-field-label">Group 2: standard deviation (s2)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="pcc-number-input"
          value={value.s2}
          onChange={(e) => onChange({ ...value, s2: parseFloat(e.target.value) || 0 })}
        />
      </div>
    </div>
  );
}
