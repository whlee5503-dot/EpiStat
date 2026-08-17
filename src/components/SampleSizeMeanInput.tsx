import './SampleSizeMeanInput.css';
import type { SampleSizeMeanInput as InputType } from '../lib/sampleSizeMean';
import { translations, type Lang } from '../i18n/translations';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
  lang: Lang;
}

export default function SampleSizeMeanInput({ value, onChange, lang }: Props) {
  const t = translations[lang].samplesizepower.ssMean.input;

  return (
    <div className="ssm-input-wrapper">
      <div className="ssm-field">
        <span className="ssm-field-label">{t.confidenceLabel}</span>
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
        <span className="ssm-field-label">{t.powerLabel}</span>
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
        <span className="ssm-field-label">{t.ratioLabel}</span>
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
        <span className="ssm-field-label">{t.sd1Label}</span>
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
        <span className="ssm-field-label">{t.sd2Label}</span>
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
        <span className="ssm-field-label">{t.meanDiffLabel}</span>
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
        <span className="ssm-hint">{t.meanDiffHint}</span>
      </div>
    </div>
  );
}