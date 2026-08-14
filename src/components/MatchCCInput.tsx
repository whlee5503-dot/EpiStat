import React from 'react';
import type { MatchCCTable } from '../lib/matchcc';
import './MatchCCInput.css';

interface MatchCCInputProps {
  table: MatchCCTable;
  onChange: (table: MatchCCTable) => void;
}

const MatchCCInput: React.FC<MatchCCInputProps> = ({ table, onChange }) => {
  const { w, x, y, z } = table;

  const updateCell = (key: keyof MatchCCTable, raw: string) => {
    const val = Math.max(0, Math.floor(parseFloat(raw) || 0));
    onChange({ ...table, [key]: val });
  };

  const row1 = w + x;
  const row2 = y + z;
  const col1 = w + y;
  const col2 = x + z;
  const total = row1 + row2;

  return (
    <div className="mcc-input-wrapper">
      <div className="mcc-chitbl">
        <div className="mcc-corner" />
        <div className="mcc-hdr">Control Exposed</div>
        <div className="mcc-hdr">Control Not Exposed</div>
        <div className="mcc-hdr">N</div>

        <div className="mcc-rowlbl">Case Exposed</div>
        <input
          type="number"
          className="mcc-cell"
          min={0}
          value={w}
          onChange={(e) => updateCell('w', e.target.value)}
          aria-label="W: case exposed, control exposed"
        />
        <input
          type="number"
          className="mcc-cell mcc-cell-discordant"
          min={0}
          value={x}
          onChange={(e) => updateCell('x', e.target.value)}
          aria-label="X: case exposed, control not exposed"
        />
        <div className="mcc-total">{row1}</div>

        <div className="mcc-rowlbl">Case Not Exposed</div>
        <input
          type="number"
          className="mcc-cell mcc-cell-discordant"
          min={0}
          value={y}
          onChange={(e) => updateCell('y', e.target.value)}
          aria-label="Y: case not exposed, control exposed"
        />
        <input
          type="number"
          className="mcc-cell"
          min={0}
          value={z}
          onChange={(e) => updateCell('z', e.target.value)}
          aria-label="Z: case not exposed, control not exposed"
        />
        <div className="mcc-total">{row2}</div>

        <div className="mcc-hdr">N</div>
        <div className="mcc-total">{col1}</div>
        <div className="mcc-total">{col2}</div>
        <div className="mcc-grand">{total}</div>
      </div>

      <div className="mcc-legend">
        <span className="mcc-legend-swatch mcc-legend-swatch-discordant" />
        <span>
          Highlighted cells (X, Y) are the discordant pairs used in all
          calculations. W and Z (concordant pairs) are shown for reference only.
        </span>
      </div>
    </div>
  );
};

export default MatchCCInput;
