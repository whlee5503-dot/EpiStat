import './BmiInput.css';
import type { Sex } from '../lib/bodySize';
import type { MeasurementType } from '../lib/hfa';
import { translations, type Lang } from '../i18n/translations';

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
  lang: Lang;
}

export default function BmiInput({ value, onChange, lang }: BmiInputProps) {
  const t = translations[lang].bmi.input;
  const tBmi = translations[lang].bmi;

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

  const expectedTypeLabel =
    expectedType === 'height' ? tBmi.measurementTypeHeight : tBmi.measurementTypeLength;
  const whoExpectsText =
    t.whoExpectsTemplate.replace('{expectedType}', expectedTypeLabel) +
    (mismatch ? t.correctionWillApply : '');

  return (
    <div className="bmi-input-wrapper">
      <div className="bmi-field">
        <span className="bmi-field-label">{t.sexLabel}</span>
        <div className="bmi-sex-toggle">
          <button
            type="button"
            className={
              'bmi-sex-btn' + (value.sex === 'M' ? ' bmi-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'M' })}
          >
            {t.boyLabel}
          </button>
          <button
            type="button"
            className={
              'bmi-sex-btn' + (value.sex === 'F' ? ' bmi-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'F' })}
          >
            {t.girlLabel}
          </button>
        </div>
      </div>

      <div className="bmi-field">
        <span className="bmi-field-label">{t.ageLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={60}
          step={0.1}
          className="bmi-number-input"
          value={value.ageMonths}
          placeholder={t.agePlaceholder}
          onChange={(e) => onChange({ ...value, ageMonths: e.target.value })}
        />
        {ageError && (
          <span className="bmi-input-error">{t.ageError}</span>
        )}
      </div>

      <div className="bmi-field">
        <span className="bmi-field-label">{t.measuredAsLabel}</span>
        <div className="bmi-sex-toggle">
          <button
            type="button"
            className={
              'bmi-sex-btn' +
              (value.measurementType === 'length' ? ' bmi-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'length' })}
          >
            {t.lengthToggleLabel}
          </button>
          <button
            type="button"
            className={
              'bmi-sex-btn' +
              (value.measurementType === 'height' ? ' bmi-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'height' })}
          >
            {t.heightToggleLabel}
          </button>
        </div>
        <span className="bmi-hint">{whoExpectsText}</span>
      </div>

      <div className="bmi-field">
        <span className="bmi-field-label">
          {value.measurementType === 'length' ? t.lengthFieldLabel : t.heightFieldLabel}
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          className="bmi-number-input"
          value={value.lengthOrHeightCm}
          placeholder={t.cmValuePlaceholder}
          onChange={(e) =>
            onChange({ ...value, lengthOrHeightCm: e.target.value })
          }
        />
        {cmError && (
          <span className="bmi-input-error">{t.cmError}</span>
        )}
      </div>

      <div className="bmi-field">
        <span className="bmi-field-label">{t.weightLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="bmi-number-input"
          value={value.weightKg}
          placeholder={t.weightPlaceholder}
          onChange={(e) => onChange({ ...value, weightKg: e.target.value })}
        />
        {weightError && (
          <span className="bmi-input-error">{t.weightError}</span>
        )}
      </div>
    </div>
  );
}