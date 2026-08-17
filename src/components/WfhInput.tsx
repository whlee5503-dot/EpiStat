import './WfhInput.css';
import type { Sex } from '../lib/bodySize';
import type { MeasurementType } from '../lib/hfa';
import { translations, type Lang } from '../i18n/translations';

export interface WfhFormState {
  sex: Sex;
  ageMonths: string;
  lengthOrHeightCm: string;
  measurementType: MeasurementType;
  weightKg: string;
}

interface WfhInputProps {
  value: WfhFormState;
  onChange: (value: WfhFormState) => void;
  lang: Lang;
}

export default function WfhInput({ value, onChange, lang }: WfhInputProps) {
  const t = translations[lang].wfh.input;
  const tWfh = translations[lang].wfh;

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
    expectedType === 'height' ? tWfh.measurementTypeHeight : tWfh.measurementTypeLength;
  const whoExpectsText =
    t.whoExpectsTemplate.replace('{expectedType}', expectedTypeLabel) +
    (mismatch ? t.correctionWillApply : '');

  return (
    <div className="wfh-input-wrapper">
      <div className="wfh-field">
        <span className="wfh-field-label">{t.sexLabel}</span>
        <div className="wfh-sex-toggle">
          <button
            type="button"
            className={
              'wfh-sex-btn' + (value.sex === 'M' ? ' wfh-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'M' })}
          >
            {t.boyLabel}
          </button>
          <button
            type="button"
            className={
              'wfh-sex-btn' + (value.sex === 'F' ? ' wfh-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, sex: 'F' })}
          >
            {t.girlLabel}
          </button>
        </div>
      </div>

      <div className="wfh-field">
        <span className="wfh-field-label">{t.ageLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={60}
          step={0.1}
          className="wfh-number-input"
          value={value.ageMonths}
          placeholder={t.agePlaceholder}
          onChange={(e) => onChange({ ...value, ageMonths: e.target.value })}
        />
        {ageError && (
          <span className="wfh-input-error">{t.ageError}</span>
        )}
      </div>

      <div className="wfh-field">
        <span className="wfh-field-label">{t.measuredAsLabel}</span>
        <div className="wfh-sex-toggle">
          <button
            type="button"
            className={
              'wfh-sex-btn' +
              (value.measurementType === 'length' ? ' wfh-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'length' })}
          >
            {t.lengthToggleLabel}
          </button>
          <button
            type="button"
            className={
              'wfh-sex-btn' +
              (value.measurementType === 'height' ? ' wfh-sex-btn-active' : '')
            }
            onClick={() => onChange({ ...value, measurementType: 'height' })}
          >
            {t.heightToggleLabel}
          </button>
        </div>
        <span className="wfh-hint">{whoExpectsText}</span>
      </div>

      <div className="wfh-field">
        <span className="wfh-field-label">
          {value.measurementType === 'length' ? t.lengthFieldLabel : t.heightFieldLabel}
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          className="wfh-number-input"
          value={value.lengthOrHeightCm}
          placeholder={t.cmValuePlaceholder}
          onChange={(e) =>
            onChange({ ...value, lengthOrHeightCm: e.target.value })
          }
        />
        {cmError && (
          <span className="wfh-input-error">{t.cmError}</span>
        )}
      </div>

      <div className="wfh-field">
        <span className="wfh-field-label">{t.weightLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          className="wfh-number-input"
          value={value.weightKg}
          placeholder={t.weightPlaceholder}
          onChange={(e) => onChange({ ...value, weightKg: e.target.value })}
        />
        {weightError && (
          <span className="wfh-input-error">{t.weightError}</span>
        )}
      </div>
    </div>
  );
}