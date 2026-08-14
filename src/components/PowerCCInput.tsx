import './PowerCCInput.css';
import type { PowerCCInput as InputType } from '../lib/powerCC';

interface Props {
  value: InputType;
  onChange: (value: InputType) => void;
}

export default function PowerCCInput({ value, onChange }: Props) {
  return (
    <div className="pcc-input-wrapper">
      <div className="pcc-field">
        <span className="pcc-field-label">Two-sided confidence level, %</span>
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
        <span className="pcc-field-label">Number of cases</span>
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
        <span className="pcc-field-label">Number of controls</span>
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
        <span className="pcc-field-label">Cases exposed, %</span>
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
        <span className="pcc-field-label">Controls exposed, %</span>
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
