import './SampleSizeMeanInput.css';
import type { SampleSizeMeanInput as InputType } from '../lib/sampleSizeMean';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
}

export default function SampleSizeMeanInput({ value, onChange }: Props) {
  return (
    <div className="ssm-input-wrapper">
      <div className="ssm-field">
        <span className="ssm-field-label">Two-sided confidence level, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={99.99}
          step={0.1}
          className="ssm-number-input"
          value={value.confidenceLevel * 100}
          onChange={(e) =>
            onChange({ ...value, confidenceLevel: (parseFloat(e.target.value) || 0) / 100 })
          }
        />
      </div>

      <div className="ssm-field">
        <span className="ssm-field-label">Power, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={99.99}
          step={0.1}
          className="ssm-number-input"
          value={value.power * 100}
          onChange={(e) =>
            onChange({ ...value, power: (parseFloat(e.target.value) || 0) / 100 })
          }
        />
      </div>

      <div className="ssm-field">
        <span className="ssm-field-label">Ratio of Group 2 to Group 1 (kappa)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0.1}
          step={0.1}
          className="ssm-number-input"
          value={value.ratio}
          onChange={(e) => onChange({ ...value, ratio: parseFloat(e.target.value) || 1 })}
        />
      </div>

      <div className="ssm-field">
        <span className="ssm-field-label">Standard deviation, Group 1</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="ssm-number-input"
          value={value.sd1}
          onChange={(e) => onChange({ ...value, sd1: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="ssm-field">
        <span className="ssm-field-label">Standard deviation, Group 2</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="ssm-number-input"
          value={value.sd2}
          onChange={(e) => onChange({ ...value, sd2: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="ssm-field">
        <span className="ssm-field-label">Mean difference to detect</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="ssm-number-input"
          value={value.meanDifference}
          onChange={(e) =>
            onChange({ ...value, meanDifference: parseFloat(e.target.value) || 0 })
          }
        />
        <span className="ssm-hint">
          Enter the smallest difference between group means that would be
          scientifically or clinically meaningful to detect
        </span>
      </div>
    </div>
  );
}
