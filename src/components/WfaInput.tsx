import './WfaInput.css';
import type { Sex } from '../lib/bodySize';
import { translations, type Lang } from '../i18n/translations';

export interface WfaFormState {
  sex: Sex;
  ageMonths: string;
  weightKg: string;
}

interface WfaInputProps {
  value: WfaFormState;
  onChange: (value: WfaFormState) => void;
  lang: Lang;
}

export default function WfaInput({ value, onChange, lang }: WfaInputProps) {
  const t = translations[lang].wfa.input;

  const ageNum = parseFloat(value.ageMonths);
  const weightNum = parseFloat(value.weightKg);
  const ageError =
    value.ageMonths !== '' && (isNaN(ageNum) || ageNum < 0 || ageNum > 60);
  const weightError =
    value.weightKg !== '' && (isNaN(weightNum) || weightNum <= 0);

  return (
    <div className="wfa-input-wrapper">
      <div className="wfa-field">
        <span className="wfa-field-label">{t.sexLabel}</span>
        <div className="wfa-sex-toggle">
          <button
            type="button"
            className={
              'wfa-sex-btn' + (value.sex === 'M' ? ' wfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'M' })}
          >
            {t.boyLabel}
          </button>
          <button
            type="button"
            className={
              'wfa-sex-btn' + (value.sex === 'F' ? ' wfa-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'F' })}
          >
            {t.girlLabel}
          </button>
        </div>
      </div>

      <div className="wfa-field">
        <span className="wfa-field-label">{t.ageLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={60}
          step={0.1}
          className="wfa-number-input"
          value={value.ageMonths}
          placeholder={t.agePlaceholder}
          onChange={(e) => onChange({ ...value, ageMonths: e.target.value })}
        />
        {ageError && (
          <span className="wfa-input-error">{t.ageError}</span>
        )}
      </div>

      <div className="wfa-field">
        <span className="wfa-field-label">{t.weightLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="wfa-number-input"
          value={value.weightKg}
          placeholder={t.weightPlaceholder}
          onChange={(e) => onChange({ ...value, weightKg: e.target.value })}
        />
        {weightError && (
          <span className="wfa-input-error">{t.weightError}</span>
        )}
      </div>
    </div>
  );
}