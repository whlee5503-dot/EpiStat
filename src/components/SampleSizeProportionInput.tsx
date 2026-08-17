import './SampleSizeProportionInput.css';
import type { SampleSizeProportionInput as InputType } from '../lib/sampleSizeProportion';
import { translations, type Lang } from '../i18n/translations';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
  lang: Lang;
}

export default function SampleSizeProportionInput({ value, onChange, lang }: Props) {
  const t = translations[lang].samplesizepower.ssProportion.input;

  return (
    <div className="ssp-input-wrapper">
      <div className="ssp-field">
        <span className="ssp-field-label">{t.populationLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={2}
          className="ssp-number-input"
          value={value.populationSize}
          onChange={(e) =>
            onChange({ ...value, populationSize: parseFloat(e.target.value) || 0 })
          }
        />
        <span className="ssp-hint">{t.populationHint}</span>
      </div>

      <div className="ssp-field">
        <span className="ssp-field-label">{t.frequencyLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          className="ssp-number-input"
          value={value.anticipatedFrequency * 100}
          onChange={(e) =>
            onChange({
              ...value,
              anticipatedFrequency: (parseFloat(e.target.value) || 0) / 100,
            })
          }
        />
        <span className="ssp-hint">{t.frequencyHint}</span>
      </div>

      <div className="ssp-field">
        <span className="ssp-field-label">{t.precisionLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={50}
          step={0.1}
          className="ssp-number-input"
          value={value.absolutePrecision * 100}
          onChange={(e) =>
            onChange({
              ...value,
              absolutePrecision: (parseFloat(e.target.value) || 0) / 100,
            })
          }
        />
        <span className="ssp-hint">{t.precisionHint}</span>
      </div>

      <div className="ssp-field">
        <span className="ssp-field-label">{t.deffLabel}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0.1}
          step={0.1}
          className="ssp-number-input"
          value={value.designEffect}
          onChange={(e) =>
            onChange({ ...value, designEffect: parseFloat(e.target.value) || 1 })
          }
        />
        <span className="ssp-hint">{t.deffHint}</span>
      </div>
    </div>
  );
}