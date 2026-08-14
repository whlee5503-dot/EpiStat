import './WfaInput.css';
import type { Sex } from '../lib/bodySize';

export interface WfaFormState {
  sex: Sex;
  ageMonths: string;
  weightKg: string;
}

interface WfaInputProps {
  value: WfaFormState;
  onChange: (value: WfaFormState) => void;
}

export default function WfaInput({ value, onChange }: WfaInputProps) {
  const ageNum = parseFloat(value.ageMonths);
  const weightNum = parseFloat(value.weightKg);
  const ageError =
    value.ageMonths !== '' && (isNaN(ageNum) || ageNum < 0 || ageNum > 60);
  const weightError =
    value.weightKg !== '' && (isNaN(weightNum) || weightNum <= 0);

  return (
    <div className="wfa-input-wrapper">
      <div className="wfa-field">
        <span className="wfa-field-label">Sex</span>
        <div className="wfa-sex-toggle">
          <button
            type="button"
            className={
              'wfa-sex-btn' + (value.sex === 'M' ? ' wfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'M' })}
          >
            Boy
          </button>
          <button
            type="button"
            className={
              'wfa-sex-btn' + (value.sex === 'F' ? ' wfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'F' })}
          >
            Girl
          </button>
        </div>
      </div>

      <div className="wfa-field">
        <span className="wfa-field-label">Age (months)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={60}
          step={0.1}
          className="wfa-number-input"
          value={value.ageMonths}
          placeholder="0-60"
          onChange={(e) => onChange({ ...value, ageMonths: e.target.value })}
        />
        {ageError && (
          <span className="wfa-input-error">
            Enter an age between 0 and 60 months
          </span>
        )}
      </div>

      <div className="wfa-field">
        <span className="wfa-field-label">Weight (kg)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="wfa-number-input"
          value={value.weightKg}
          placeholder="e.g. 8.9"
          onChange={(e) => onChange({ ...value, weightKg: e.target.value })}
        />
        {weightError && (
          <span className="wfa-input-error">Enter a weight greater than 0</span>
        )}
      </div>
    </div>
  );
}
