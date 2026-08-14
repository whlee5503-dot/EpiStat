import { useState } from 'react';
import './SampleSizeCohortInput.css';
import type { SampleSizeCohortInput as InputType } from '../lib/sampleSizeCohort';

export type CohortEffectMode = 'oddsRatio' | 'riskRatio' | 'riskDifference' | 'exposedOutcome';

interface Props {
  value: InputType;
  mode: CohortEffectMode;
  onChange: (value: InputType, mode: CohortEffectMode) => void;
}

const MODE_LABELS: Record<CohortEffectMode, string> = {
  oddsRatio: 'Odds Ratio',
  riskRatio: 'Risk Ratio',
  riskDifference: 'Risk Diff. (%)',
  exposedOutcome: '% Exposed w/ Outcome',
};

function clearOtherModes(base: InputType, mode: CohortEffectMode, val: number): InputType {
  const next: InputType = {
    confidenceLevel: base.confidenceLevel,
    power: base.power,
    unexposedToExposedRatio: base.unexposedToExposedRatio,
    unexposedOutcome: base.unexposedOutcome,
  };
  next[mode] = val;
  return next;
}

export default function SampleSizeCohortInput({ value, mode, onChange }: Props) {
  const [text, setText] = useState<Record<CohortEffectMode, string>>({
    oddsRatio: String(value.oddsRatio ?? 2.1),
    riskRatio: String(value.riskRatio ?? 2),
    riskDifference: String((value.riskDifference ?? 0.05) * 100),
    exposedOutcome: String((value.exposedOutcome ?? 0.1) * 100),
  });

  const updateEffect = (m: CohortEffectMode, rawText: string) => {
    setText({ ...text, [m]: rawText });
    const num = parseFloat(rawText) || 0;
    const val = m === 'riskDifference' || m === 'exposedOutcome' ? num / 100 : num;
    onChange(clearOtherModes(value, m, val), m);
  };

  return (
    <div className="sscoh-input-wrapper">
      <div className="sscoh-field">
        <span className="sscoh-field-label">Two-sided confidence level, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={99.99}
          step={0.1}
          className="sscoh-number-input"
          value={value.confidenceLevel * 100}
          onChange={(e) =>
            onChange(
              { ...value, confidenceLevel: (parseFloat(e.target.value) || 0) / 100 },
              mode
            )
          }
        />
      </div>

      <div className="sscoh-field">
        <span className="sscoh-field-label">Power, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={99.99}
          step={0.1}
          className="sscoh-number-input"
          value={value.power * 100}
          onChange={(e) =>
            onChange({ ...value, power: (parseFloat(e.target.value) || 0) / 100 }, mode)
          }
        />
      </div>

      <div className="sscoh-field">
        <span className="sscoh-field-label">Ratio of unexposed to exposed (r)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0.1}
          step={0.1}
          className="sscoh-number-input"
          value={value.unexposedToExposedRatio}
          onChange={(e) =>
            onChange(
              { ...value, unexposedToExposedRatio: parseFloat(e.target.value) || 1 },
              mode
            )
          }
        />
      </div>

      <div className="sscoh-field">
        <span className="sscoh-field-label">Unexposed with outcome, %</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          className="sscoh-number-input"
          value={value.unexposedOutcome * 100}
          onChange={(e) =>
            onChange(
              { ...value, unexposedOutcome: (parseFloat(e.target.value) || 0) / 100 },
              mode
            )
          }
        />
      </div>

      <div className="sscoh-field">
        <span className="sscoh-field-label">Effect size, given as</span>
        <div className="sscoh-toggle">
          {(Object.keys(MODE_LABELS) as CohortEffectMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={'sscoh-toggle-btn' + (mode === m ? ' sscoh-toggle-btn-active' : '')}
              onClick={() => updateEffect(m, text[m])}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="decimal"
          step={0.1}
          className="sscoh-number-input"
          value={text[mode]}
          onChange={(e) => updateEffect(mode, e.target.value)}
        />
      </div>
    </div>
  );
}
