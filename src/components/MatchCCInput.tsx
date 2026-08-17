import React from 'react';
import type { MatchCCTable } from '../lib/matchcc';
import './MatchCCInput.css';
import { translations, type Lang } from '../i18n/translations';

interface MatchCCInputProps {
  table: MatchCCTable;
  onChange: (table: MatchCCTable) => void;
  lang: Lang;
}

const MatchCCInput: React.FC<MatchCCInputProps> = ({ table, onChange, lang }) => {
  const t = translations[lang].matchcc.input;
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
        <div className="mcc-hdr">{t.controlExposedHdr}</div>
        <div className="mcc-hdr">{t.controlNotExposedHdr}</div>
        <div className="mcc-hdr">N</div>

        <div className="mcc-rowlbl">{t.caseExposedRowLabel}</div>
        <input
          type="number"
          className="mcc-cell"
          min={0}
          value={w}
          onChange={(e) => updateCell('w', e.target.value)}
          aria-label={t.ariaW}
        />
        <input
          type="number"
          className="mcc-cell mcc-cell-discordant"
          min={0}
          value={x}
          onChange={(e) => updateCell('x', e.target.value)}
          aria-label={t.ariaX}
        />
        <div className="mcc-total">{row1}</div>

        <div className="mcc-rowlbl">{t.caseNotExposedRowLabel}</div>
        <input
          type="number"
          className="mcc-cell mcc-cell-discordant"
          min={0}
          value={y}
          onChange={(e) => updateCell('y', e.target.value)}
          aria-label={t.ariaY}
        />
        <input
          type="number"
          className="mcc-cell"
          min={0}
          value={z}
          onChange={(e) => updateCell('z', e.target.value)}
          aria-label={t.ariaZ}
        />
        <div className="mcc-total">{row2}</div>

        <div className="mcc-hdr">N</div>
        <div className="mcc-total">{col1}</div>
        <div className="mcc-total">{col2}</div>
        <div className="mcc-grand">{total}</div>
      </div>

      <div className="mcc-legend">
        <span className="mcc-legend-swatch mcc-legend-swatch-discordant" />
        <span>{t.legendText}</span>
      </div>
    </div>
  );
};

export default MatchCCInput;