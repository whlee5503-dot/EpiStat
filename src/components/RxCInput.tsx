import React from 'react';
import './RxCInput.css';

interface RxCInputProps {
  table: number[][];
  onChange: (table: number[][]) => void;
}

const MIN_DIM = 2;

const RxCInput: React.FC<RxCInputProps> = ({ table, onChange }) => {
  const rows = table.length;
  const cols = table[0]?.length ?? 0;

  const updateCell = (i: number, j: number, raw: string) => {
    const val = Math.max(0, Math.floor(parseFloat(raw) || 0));
    const next = table.map((row, ri) =>
      ri === i ? row.map((v, ci) => (ci === j ? val : v)) : row
    );
    onChange(next);
  };

  const addRow = () => {
    onChange([...table, new Array(cols).fill(0)]);
  };

  const removeRow = (i: number) => {
    if (rows <= MIN_DIM) return;
    onChange(table.filter((_, ri) => ri !== i));
  };

  const addCol = () => {
    onChange(table.map((row) => [...row, 0]));
  };

  const removeCol = (j: number) => {
    if (cols <= MIN_DIM) return;
    onChange(table.map((row) => row.filter((_, ci) => ci !== j)));
  };

  const rowTotals = table.map((row) => row.reduce((a, b) => a + b, 0));
  const colTotals: number[] = new Array(cols).fill(0);
  table.forEach((row) => row.forEach((v, j) => (colTotals[j] += v)));
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  return (
    <div className="rxc-input-wrapper">
      <div className="rxc-table-scroll">
        <div
          className="rxc-grid"
          style={{ gridTemplateColumns: '58px repeat(' + cols + ', minmax(56px, 1fr)) 46px' }}
        >
          <div className="rxc-corner" />
          {Array.from({ length: cols }).map((_, j) => (
            <div key={'ch-' + j} className="rxc-colhdr">
              <span>{'C' + (j + 1)}</span>
              {cols > MIN_DIM && (
                <button
                  className="rxc-remove-btn"
                  onClick={() => removeCol(j)}
                  aria-label={'Remove column ' + (j + 1)}
                  type="button"
                >
                  X
                </button>
              )}
            </div>
          ))}
          <div className="rxc-colhdr rxc-colhdr-total">N</div>

          {table.map((row, i) => (
            <React.Fragment key={'row-' + i}>
              <div className="rxc-rowlbl">
                <span>{'R' + (i + 1)}</span>
                {rows > MIN_DIM && (
                  <button
                    className="rxc-remove-btn"
                    onClick={() => removeRow(i)}
                    aria-label={'Remove row ' + (i + 1)}
                    type="button"
                  >
                    X
                  </button>
                )}
              </div>
              {row.map((v, j) => (
                <input
                  key={'cell-' + i + '-' + j}
                  type="number"
                  className="rxc-cell"
                  min={0}
                  value={v}
                  onChange={(e) => updateCell(i, j, e.target.value)}
                  aria-label={'R' + (i + 1) + ' C' + (j + 1)}
                />
              ))}
              <div className="rxc-total">{rowTotals[i]}</div>
            </React.Fragment>
          ))}

          <div className="rxc-colhdr rxc-colhdr-total">N</div>
          {colTotals.map((ct, j) => (
            <div key={'ct-' + j} className="rxc-total">
              {ct}
            </div>
          ))}
          <div className="rxc-grand">{grandTotal}</div>
        </div>
      </div>

      <div className="rxc-dim-controls">
        <button className="rxc-add-btn" onClick={addRow} type="button">
          + Add Row
        </button>
        <button className="rxc-add-btn" onClick={addCol} type="button">
          + Add Column
        </button>
      </div>
    </div>
  );
};

export default RxCInput;
