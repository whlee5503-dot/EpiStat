import './HfaInput.css';
import type { Sex } from '../lib/bodySize';
import type { MeasurementType } from '../lib/hfa';

export interface HfaFormState {
  sex: Sex;
  ageMonths: string;
  measuredValue: string;
  measurementType: MeasurementType;
}

interface HfaInputProps {
  value: HfaFormState;
  onChange: (value: HfaFormState) => void;
}

export default function HfaInput({ value, onChange }: HfaInputProps) {
  const ageNum = parseFloat(value.ageMonths);
  const valueNum = parseFloat(value.measuredValue);
  const ageError =
    value.ageMonths !== '' && (isNaN(ageNum) || ageNum < 0 || ageNum > 60);
  const valueError =
    value.measuredValue !== '' && (isNaN(valueNum) || valueNum <= 0);

  const expectedType: MeasurementType =
    !isNaN(ageNum) && ageNum >= 24 ? 'height' : 'length';
  const mismatch = value.measurementType !== expectedType;

  return (
    <div className="hfa-input-wrapper">
      <div className="hfa-field">
        <span className="hfa-field-label">Sex</span>
        <div className="hfa-sex-toggle">
          <button
            type="button"
            className={
              'hfa-sex-btn' + (value.sex === 'M' ? ' hfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'M' })}
          >
            Boy
          </button>
          <button
            type="button"
            className={
              'hfa-sex-btn' + (value.sex === 'F' ? ' hfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'F' })}
          >
            Girl
          </button>
        </div>
      </div>

      <div className="hfa-field">
        <span className="hfa-field-label">Age (months)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={60}
          step={0.1}
          className="hfa-number-input"
          value={value.ageMonths}
          placeholder="0-60"
          onChange={(e) => onChange({ ...value, ageMonths: e.target.value })}
        />
        {ageError && (
          <span className="hfa-input-error">
            Enter an age between 0 and 60 months
          </span>
        )}
      </div>

      <div className="hfa-field">
        <span className="hfa-field-label">Measured as</span>
        <div className="hfa-sex-toggle">
          <button
            type="button"
            className={
              'hfa-sex-btn' +
              (value.measurementType === 'length' ? ' hfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'length' })}
          >
            Length (lying)
          </button>
          <button
            type="button"
            className={
              'hfa-sex-btn' +
              (value.measurementType === 'height' ? ' hfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'height' })}
          >
            Height (standing)
          </button>
        </div>
        <span className="hfa-hint">
          WHO expects {expectedType} for this age
          {mismatch ? ' - a 0.7cm correction will be applied' : ''}
        </span>
      </div>

      <div className="hfa-field">
        <span className="hfa-field-label">
          {value.measurementType === 'length' ? 'Length' : 'Height'} (cm)
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          className="hfa-number-input"
          value={value.measuredValue}
          placeholder="e.g. 75.7"
          onChange={(e) =>
            onChange({ ...value, measuredValue: e.target.value })
          }
        />
        {valueError && (
          <span className="hfa-input-error">
            Enter a measurement greater than 0
          </span>
        )}
      </div>
    </div>
  );
}
