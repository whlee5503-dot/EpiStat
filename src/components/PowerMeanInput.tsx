import './PowerCCInput.css';
import type { PowerMeanInput as InputType } from '../lib/powerMean';
import { translations, type Lang } from '../i18n/translations';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
  lang: Lang;
}

export default function PowerMeanInput({ value, onChange, lang }: Props) {
  const t = translations[lang].samplesizepower.powerMean.input;

  return (
    <div className="pcc-input-wrapper">
      <div className="pcc-field">
        <span className="pcc-field-label">{t.confidenceLabel}</span>
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
        <span className="pcc-field-label">{t.meanDiffLabel}</span>
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
        <span className="pcc-field-label">{t.n1Label}</span>
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
        <span className="pcc-field-label">{t.s1Label}</span>
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
        <span className="pcc-field-label">{t.n2Label}</span>
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
        <span className="pcc-field-label">{t.s2Label}</span>
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