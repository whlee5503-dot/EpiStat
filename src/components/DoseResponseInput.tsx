import React from 'react';
import type { DoseResponseTable, LevelCounts } from '../lib/doseResponse';
import './DoseResponseInput.css';

interface DoseResponseInputProps {
  table: DoseResponseTable;
  onChange: (table: DoseResponseTable) => void;
}

const MIN_LEVELS = 2;
const MIN_STRATA = 1;

const DoseResponseInput: React.FC<DoseResponseInputProps> = ({ table, onChange }) => {
  const { scores, strata } = table;
  const numLevels = scores.length;

  const updateScore = (levelIndex: number, raw: string) => {
    const val = parseFloat(raw);
    const nextScores = scores.map((s, i) => (i === levelIndex ? (isNaN(val) ? 0 : val) : s));
    onChange({ scores: nextScores, strata });
  };

  const updateCell = (
    stratumIndex: number,
    levelIndex: number,
    field: keyof LevelCounts,
    raw: string
  ) => {
    const val = Math.max(0, Math.floor(parseFloat(raw) || 0));
    const nextStrata = strata.map((stratum, si) =>
      si === stratumIndex
        ? stratum.map((lvl, li) => (li === levelIndex ? { ...lvl, [field]: val } : lvl))
        : stratum
    );
    onChange({ scores, strata: nextStrata });
  };

  const addLevel = () => {
    const nextScore = scores.length > 0 ? Math.max(...scores) + 1 : 0;
    const nextScores = [...scores, nextScore];
    const nextStrata = strata.map((stratum) => [...stratum, { cases: 0, controls: 0 }]);
    onChange({ scores: nextScores, strata: nextStrata });
  };

  const removeLevel = (levelIndex: number) => {
    if (numLevels <= MIN_LEVELS) return;
    const nextScores = scores.filter((_, i) => i !== levelIndex);
    const nextStrata = strata.map((stratum) => stratum.filter((_, i) => i !== levelIndex));
    onChange({ scores: nextScores, strata: nextStrata });
  };

  const addStratum = () => {
    const newStratum: LevelCounts[] = scores.map(() => ({ cases: 0, controls: 0 }));
    onChange({ scores, strata: [...strata, newStratum] });
  };

  const removeStratum = (stratumIndex: number) => {
    if (strata.length <= MIN_STRATA) return;
    onChange({ scores, strata: strata.filter((_, i) => i !== stratumIndex) });
  };

  return (
    <div className="dr-input-wrapper">
      <div className="dr-table-scroll">
        <div
          className="dr-grid"
          style={{ gridTemplateColumns: '100px repeat(' + numLevels + ', minmax(110px, 1fr))' }}
        >
          <div className="dr-corner" />
          {scores.map((score, li) => (
            <div key={'lvl-' + li} className="dr-levelhdr">
              <div className="dr-levelhdr-title">
                <span>{'Level ' + li}</span>
                {numLevels > MIN_LEVELS && (
                  <button
                    className="dr-remove-btn"
                    onClick={() => removeLevel(li)}
                    aria-label={'Remove level ' + li}
                    type="button"
                  >
                    X
                  </button>
                )}
              </div>
              <div className="dr-score-row">
                <span className="dr-score-label">Score</span>
                <input
                  type="number"
                  className="dr-score-input"
                  value={score}
                  onChange={(e) => updateScore(li, e.target.value)}
                  aria-label={'Score for level ' + li}
                />
              </div>
            </div>
          ))}

          {strata.map((stratum, si) => (
            <React.Fragment key={'stratum-' + si}>
              <div className="dr-rowlbl">
                <span>{'Stratum ' + (si + 1)}</span>
                {strata.length > MIN_STRATA && (
                  <button
                    className="dr-remove-btn"
                    onClick={() => removeStratum(si)}
                    aria-label={'Remove stratum ' + (si + 1)}
                    type="button"
                  >
                    X
                  </button>
                )}
              </div>
              {stratum.map((lvl, li) => (
                <div key={'cell-' + si + '-' + li} className="dr-cell">
                  <div className="dr-cell-field">
                    <label className="dr-cell-label">Cases</label>
                    <input
                      type="number"
                      className="dr-cell-input"
                      min={0}
                      value={lvl.cases}
                      onChange={(e) => updateCell(si, li, 'cases', e.target.value)}
                      aria-label={'Stratum ' + (si + 1) + ' level ' + li + ' cases'}
                    />
                  </div>
                  <div className="dr-cell-field">
                    <label className="dr-cell-label">Controls</label>
                    <input
                      type="number"
                      className="dr-cell-input"
                      min={0}
                      value={lvl.controls}
                      onChange={(e) => updateCell(si, li, 'controls', e.target.value)}
                      aria-label={'Stratum ' + (si + 1) + ' level ' + li + ' controls'}
                    />
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="dr-dim-controls">
        <button className="dr-add-btn" onClick={addStratum} type="button">
          + Add Stratum
        </button>
        <button className="dr-add-btn" onClick={addLevel} type="button">
          + Add Level
        </button>
      </div>

      <div className="dr-legend">
        Level 0 (leftmost) is treated as the baseline/unexposed group. Scores
        should increase with exposure (e.g. 0, 1, 2) but can be edited to use
        category midpoints or any ordered numeric sequence.
      </div>
    </div>
  );
};

export default DoseResponseInput;
