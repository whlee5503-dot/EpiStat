import React from 'react';
import type { TwoByTwoTable } from '../lib/mantelHaenszel';
import './StratifiedInput.css';

interface StratifiedInputProps {
  strata: TwoByTwoTable[];
  onChange: (strata: TwoByTwoTable[]) => void;
  stratumLabels?: string[];
}

const EMPTY_TABLE: TwoByTwoTable = { a: 0, b: 0, c: 0, d: 0 };

const StratifiedInput: React.FC<StratifiedInputProps> = ({
  strata,
  onChange,
  stratumLabels,
}) => {
  const updateCell = (
    index: number,
    key: keyof TwoByTwoTable,
    raw: string
  ) => {
    const val = Math.max(0, Math.floor(parseFloat(raw) || 0));
    const next = strata.map((t, i) =>
      i === index ? { ...t, [key]: val } : t
    );
    onChange(next);
  };

  const addStratum = () => {
    onChange([...strata, { ...EMPTY_TABLE }]);
  };

  const removeStratum = (index: number) => {
    if (strata.length <= 2) return;
    onChange(strata.filter((_, i) => i !== index));
  };

  return (
    <div className="strat-input-wrapper">
      {strata.map((t, i) => {
        const { a, b, c, d } = t;
        const row1 = a + b;
        const row2 = c + d;
        const col1 = a + c;
        const col2 = b + d;
        const total = row1 + row2;
        const label = (stratumLabels && stratumLabels[i]) || ('Stratum ' + (i + 1));

        return (
          <div key={i} className="strat-block">
            <div className="strat-block-header">
              <span className="strat-block-title">{label}</span>
              {strata.length > 2 && (
                <button
                  className="strat-remove-btn"
                  onClick={() => removeStratum(i)}
                  aria-label={'Remove ' + label}
                  type="button"
                >
                  X
                </button>
              )}
            </div>

            <div className="strat-chitbl">
              <div className="strat-chitbl-corner" />
              <div className="strat-chitbl-hdr">Disease+</div>
              <div className="strat-chitbl-hdr">Disease-</div>
              <div className="strat-chitbl-hdr">N</div>

              <div className="strat-chitbl-rowlbl">Exposed+</div>
              <input
                type="number"
                className="strat-chitbl-cell"
                min={0}
                value={a}
                onChange={(e) => updateCell(i, 'a', e.target.value)}
                aria-label={label + ' a'}
              />
              <input
                type="number"
                className="strat-chitbl-cell"
                min={0}
                value={b}
                onChange={(e) => updateCell(i, 'b', e.target.value)}
                aria-label={label + ' b'}
              />
              <div className="strat-chitbl-total">{row1}</div>

              <div className="strat-chitbl-rowlbl">Exposed-</div>
              <input
                type="number"
                className="strat-chitbl-cell"
                min={0}
                value={c}
                onChange={(e) => updateCell(i, 'c', e.target.value)}
                aria-label={label + ' c'}
              />
              <input
                type="number"
                className="strat-chitbl-cell"
                min={0}
                value={d}
                onChange={(e) => updateCell(i, 'd', e.target.value)}
                aria-label={label + ' d'}
              />
              <div className="strat-chitbl-total">{row2}</div>

              <div className="strat-chitbl-hdr">N</div>
              <div className="strat-chitbl-total">{col1}</div>
              <div className="strat-chitbl-total">{col2}</div>
              <div className="strat-chitbl-grand">{total}</div>
            </div>
          </div>
        );
      })}

      <button className="strat-add-btn" onClick={addStratum} type="button">
        + Add Stratum
      </button>
    </div>
  );
};

export default StratifiedInput;
