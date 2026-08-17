import './PowerCCInput.css';
import type { PowerCCInput as InputType } from '../lib/powerCC';
import { translations, type Lang } from '../i18n/translations';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
  lang: Lang;
}

export default function PowerCCInput({ value, onChange, lang }: Props) {
  const t = translations[lang].samplesizepower.powerCC.input;

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
        <span className="pcc-field-label">{t.casesLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          className="pcc-number-input"
          value={value.cases}
          onChange={(e) => onChange({ ...value, cases: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="pcc-field">
        <span className="pcc-field-label">{t.controlsLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          className="pcc-number-input"
          value={value.controls}
          onChange={(e) => onChange({ ...value, controls: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="pcc-field">
        <span className="pcc-field-label">{t.caseExposureLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          className="pcc-number-input"
          value={value.caseExposure * 100}
          onChange={(e) =>
            onChange({ ...value, caseExposure: (parseFloat(e.target.value) || 0) / 100 })
          }
        />
      </div>

      <div className="pcc-field">
        <span className="pcc-field-label">{t.controlExposureLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          className="pcc-number-input"
          value={value.controlExposure * 100}
          onChange={(e) =>
            onChange({ ...value, controlExposure: (parseFloat(e.target.value) || 0) / 100 })
          }
        />
      </div>
    </div>
  );
}