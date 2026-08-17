import './HfaInput.css';
import type { Sex } from '../lib/bodySize';
import type { MeasurementType } from '../lib/hfa';
import { translations, type Lang } from '../i18n/translations';

export interface HfaFormState {
  sex: Sex;
  ageMonths: string;
  measuredValue: string;
  measurementType: MeasurementType;
}

interface HfaInputProps {
  value: HfaFormState;
  onChange: (value: HfaFormState) => void;
  lang: Lang;
}

export default function HfaInput({ value, onChange, lang }: HfaInputProps) {
  const t = translations[lang].hfa.input;
  const tHfa = translations[lang].hfa;

  const ageNum = parseFloat(value.ageMonths);
  const valueNum = parseFloat(value.measuredValue);
  const ageError =
    value.ageMonths !== '' && (isNaN(ageNum) || ageNum < 0 || ageNum > 60);
  const valueError =
    value.measuredValue !== '' && (isNaN(valueNum) || valueNum <= 0);

  const expectedType: MeasurementType =
    !isNaN(ageNum) && ageNum >= 24 ? 'height' : 'length';
  const mismatch = value.measurementType !== expectedType;

  const expectedTypeLabel =
    expectedType === 'height'
      ? tHfa.measurementTypeHeight
      : tHfa.measurementTypeLength;
  const whoExpectsText =
    t.whoExpectsTemplate.replace('{expectedType}', expectedTypeLabel) +
    (mismatch ? t.correctionWillApply : '');

  return (
    <div className="hfa-input-wrapper">
      <div className="hfa-field">
        <span className="hfa-field-label">{t.sexLabel}</span>
        <div className="hfa-sex-toggle">
          <button
            type="button"
            className={
              'hfa-sex-btn' + (value.sex === 'M' ? ' hfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'M' })}
          >
            {t.boyLabel}
          </button>
          <button
            type="button"
            className={
              'hfa-sex-btn' + (value.sex === 'F' ? ' hfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'F' })}
          >
            {t.girlLabel}
          </button>
        </div>
      </div>

      <div className="hfa-field">
        <span className="hfa-field-label">{t.ageLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={60}
          step={0.1}
          className="hfa-number-input"
          value={value.ageMonths}
          placeholder={t.agePlaceholder}
          onChange={(e) => onChange({ ...value, ageMonths: e.target.value })}
        />
        {ageError && (
          <span className="hfa-input-error">{t.ageError}</span>
        )}
      </div>

      <div className="hfa-field">
        <span className="hfa-field-label">{t.measuredAsLabel}</span>
        <div className="hfa-sex-toggle">
          <button
            type="button"
            className={
              'hfa-sex-btn' +
              (value.measurementType === 'length' ? ' hfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'length' })}
          >
            {t.lengthToggleLabel}
          </button>
          <button
            type="button"
            className={
              'hfa-sex-btn' +
              (value.measurementType === 'height' ? ' hfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'height' })}
          >
            {t.heightToggleLabel}
          </button>
        </div>
        <span className="hfa-hint">{whoExpectsText}</span>
      </div>

      <div className="hfa-field">
        <span className="hfa-field-label">
          {value.measurementType === 'length'
            ? t.lengthFieldLabel
            : t.heightFieldLabel}
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          className="hfa-number-input"
          value={value.measuredValue}
          placeholder={t.valuePlaceholder}
          onChange={(e) =>
            onChange({ ...value, measuredValue: e.target.value })
          }
        />
        {valueError && (
          <span className="hfa-input-error">{t.valueError}</span>
        )}
      </div>
    </div>
  );
}