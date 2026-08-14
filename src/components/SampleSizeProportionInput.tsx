import './SampleSizeProportionInput.css';
import type { SampleSizeProportionInput as InputType } from '../lib/sampleSizeProportion';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
}

export default function SampleSizeProportionInput({ value, onChange }: Props) {
  return (
    <div className="ssp-input-wrapper">
      <div className="ssp-field">
        <span className="ssp-field-label">Population size (N)</span>
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
        <span className="ssp-hint">
          Very large values behave like an infinite population
        </span>
      </div>

      <div className="ssp-field">
        <span className="ssp-field-label">Anticipated frequency, % (p)</span>
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
        <span className="ssp-hint">Use 50% if unsure — it gives the largest sample size</span>
      </div>

      <div className="ssp-field">
        <span className="ssp-field-label">Absolute precision, +/- % (d)</span>
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
        <span className="ssp-hint">Desired half-width of the confidence interval</span>
      </div>

      <div className="ssp-field">
        <span className="ssp-field-label">Design effect (DEFF)</span>
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
        <span className="ssp-hint">1.0 for simple random sampling; higher for cluster surveys</span>
      </div>
    </div>
  );
}
