import './BmiInput.css';
import type { Sex } from '../lib/bodySize';
import type { MeasurementType } from '../lib/hfa';

export interface BmiFormState {
  sex: Sex;
  ageMonths: string;
  lengthOrHeightCm: string;
  measurementType: MeasurementType;
  weightKg: string;
}

interface BmiInputProps {
  value: BmiFormState;
  onChange: (value: BmiFormState) => void;
}

export default function BmiInput({ value, onChange }: BmiInputProps) {
  const ageNum = parseFloat(value.ageMonths);
  const cmNum = parseFloat(value.lengthOrHeightCm);
  const weightNum = parseFloat(value.weightKg);

  const ageError =
    value.ageMonths !== '' && (isNaN(ageNum) || ageNum < 0 || ageNum > 60);
  const cmError =
    value.lengthOrHeightCm !== '' && (isNaN(cmNum) || cmNum <= 0);
  const weightError =
    value.weightKg !== '' && (isNaN(weightNum) || weightNum <= 0);

  const expectedType: MeasurementType =
    !isNaN(ageNum) && ageNum >= 24 ? 'height' : 'length';
  const mismatch = value.measurementType !== expectedType;

  return (
    <div className="bmi-input-wrapper">
      <div className="bmi-field">
        <span className="bmi-field-label">Sex</span>
        <div className="bmi-sex-toggle">
          <button
            type="button"
            className={
              'bmi-sex-btn' + (value.sex === 'M' ? ' bmi-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'M' })}
          >
            Boy
          </button>
          <button
            type="button"
            className={
              'bmi-sex-btn' + (value.sex === 'F' ? ' bmi-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'F' })}
          >
            Girl
          </button>
        </div>
      </div>

      <div className="bmi-field">
        <span className="bmi-field-label">Age (months)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={60}
          step={0.1}
          className="bmi-number-input"
          value={value.ageMonths}
          placeholder="0-60"
          onChange={(e) => onChange({ ...value, ageMonths: e.target.value })}
        />
        {ageError && (
          <span className="bmi-input-error">
            Enter an age between 0 and 60 months
          </span>
        )}
      </div>

      <div className="bmi-field">
        <span className="bmi-field-label">Measured as</span>
        <div className="bmi-sex-toggle">
          <button
            type="button"
            className={
              'bmi-sex-btn' +
              (value.measurementType === 'length' ? ' bmi-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'length' })}
          >
            Length (lying)
          </button>
          <button
            type="button"
            className={
              'bmi-sex-btn' +
              (value.measurementType === 'height' ? ' bmi-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'height' })}
          >
            Height (standing)
          </button>
        </div>
        <span className="bmi-hint">
          WHO expects {expectedType} for this age
          {mismatch ? ' - a 0.7cm correction will be applied before computing BMI' : ''}
        </span>
      </div>

      <div className="bmi-field">
        <span className="bmi-field-label">
          {value.measurementType === 'length' ? 'Length' : 'Height'} (cm)
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          className="bmi-number-input"
          value={value.lengthOrHeightCm}
          placeholder="e.g. 75.0"
          onChange={(e) =>
            onChange({ ...value, lengthOrHeightCm: e.target.value })
          }
        />
        {cmError && (
          <span className="bmi-input-error">
            Enter a length/height greater than 0
          </span>
        )}
      </div>

      <div className="bmi-field">
        <span className="bmi-field-label">Weight (kg)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="bmi-number-input"
          value={value.weightKg}
          placeholder="e.g. 9.5"
          onChange={(e) => onChange({ ...value, weightKg: e.target.value })}
        />
        {weightError && (
          <span className="bmi-input-error">
            Enter a weight greater than 0
          </span>
        )}
      </div>
    </div>
  );
}
