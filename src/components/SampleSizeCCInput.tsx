import { useState } from 'react';
import './SampleSizeCCInput.css';
import type { SampleSizeCCInput as InputType } from '../lib/sampleSizeCC';

export type ExposureMode = 'oddsRatio' | 'caseExposure';

interface Props {
  value: InputType;
  mode: ExposureMode;
  onChange: (value: InputType, mode: ExposureMode) => void;
}

export default function SampleSizeCCInput({ value, mode, onChange }: Props) {
  const [oddsRatioText, setOddsRatioText] = useState(String(value.oddsRatio ?? 2));
  const [caseExposureText, setCaseExposureText] = useState(
    String(((value.caseExposure ?? 0.5714) * 100).toFixed(2))
  );

  return (
    <div className="sscc-input-wrapper">
      <div className="sscc-field">
        <span className="sscc-field-label">Two-sided confidence level, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={99.99}
          step={0.1}
          className="sscc-number-input"
          value={value.confidenceLevel * 100}
          onChange={(e) =>
            onChange(
              { ...value, confidenceLevel: (parseFloat(e.target.value) || 0) / 100 },
              mode
            )
          }
        />
      </div>

      <div className="sscc-field">
        <span className="sscc-field-label">Power, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={99.99}
          step={0.1}
          className="sscc-number-input"
          value={value.power * 100}
          onChange={(e) =>
            onChange({ ...value, power: (parseFloat(e.target.value) || 0) / 100 }, mode)
          }
        />
      </div>

      <div className="sscc-field">
        <span className="sscc-field-label">Ratio of controls to cases (r)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0.1}
          step={0.1}
          className="sscc-number-input"
          value={value.controlsToCasesRatio}
          onChange={(e) =>
            onChange(
              { ...value, controlsToCasesRatio: parseFloat(e.target.value) || 1 },
              mode
            )
          }
        />
      </div>

      <div className="sscc-field">
        <span className="sscc-field-label">Controls exposed, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          className="sscc-number-input"
          value={value.controlExposure * 100}
          onChange={(e) =>
            onChange(
              { ...value, controlExposure: (parseFloat(e.target.value) || 0) / 100 },
              mode
            )
          }
        />
      </div>

      <div className="sscc-field">
        <span className="sscc-field-label">Effect size, given as</span>
        <div className="sscc-toggle">
          <button
            type="button"
            className={'sscc-toggle-btn' + (mode === 'oddsRatio' ? ' sscc-toggle-btn-active' : '')}
            onClick={() =>
              onChange(
                { ...value, oddsRatio: parseFloat(oddsRatioText) || 2, caseExposure: undefined },
                'oddsRatio'
              )
            }
          >
            Odds Ratio
          </button>
          <button
            type="button"
            className={'sscc-toggle-btn' + (mode === 'caseExposure' ? ' sscc-toggle-btn-active' : '')}
            onClick={() =>
              onChange(
                {
                  ...value,
                  caseExposure: parseFloat(caseExposureText) / 100 || 0.5,
                  oddsRatio: undefined,
                },
                'caseExposure'
              )
            }
          >
            % Cases Exposed
          </button>
        </div>

        {mode === 'oddsRatio' ? (
          <input
            type="number"
            inputMode="decimal"
            min={0.01}
            step={0.1}
            className="sscc-number-input"
            value={oddsRatioText}
            onChange={(e) => {
              setOddsRatioText(e.target.value);
              onChange({ ...value, oddsRatio: parseFloat(e.target.value) || 0, caseExposure: undefined }, 'oddsRatio');
            }}
          />
        ) : (
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.1}
            className="sscc-number-input"
            value={caseExposureText}
            onChange={(e) => {
              setCaseExposureText(e.target.value);
              onChange(
                { ...value, caseExposure: (parseFloat(e.target.value) || 0) / 100, oddsRatio: undefined },
                'caseExposure'
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
