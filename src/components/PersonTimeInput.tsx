import './PersonTimeInput.css';
import type { PersonTimeStratum } from '../lib/personTime';
import { translations, type Lang } from '../i18n/translations';

interface PersonTimeInputProps {
  strata: PersonTimeStratum[];
  onChange: (strata: PersonTimeStratum[]) => void;
  lang: Lang;
}

const DEFAULT_STRATUM: PersonTimeStratum = {
  casesExposed: 0,
  personTimeExposed: 0,
  casesUnexposed: 0,
  personTimeUnexposed: 0,
};

export default function PersonTimeInput({ strata, onChange, lang }: PersonTimeInputProps) {
  const t = translations[lang].persontime.input;

  const updateStratum = (
    index: number,
    field: keyof PersonTimeStratum,
    value: number
  ) => {
    const next = strata.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange(next);
  };

  const addStratum = () => {
    onChange([...strata, { ...DEFAULT_STRATUM }]);
  };

  const removeStratum = (index: number) => {
    if (strata.length <= 1) return;
    onChange(strata.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-input-wrapper">
      <div className="pt-table-scroll">
        <table className="pt-table">
          <thead>
            <tr>
              <th></th>
              <th colSpan={2}>{t.exposedHdr}</th>
              <th colSpan={2}>{t.unexposedHdr}</th>
              <th></th>
            </tr>
            <tr>
              <th></th>
              <th>{t.casesHdr}</th>
              <th>{t.personTimeHdr}</th>
              <th>{t.casesHdr}</th>
              <th>{t.personTimeHdr}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {strata.map((s, i) => (
              <tr key={i}>
                <td className="pt-rowlbl">
                  {strata.length > 1
                    ? t.stratumLabelTemplate.replace('{n}', String(i + 1))
                    : t.dataLabel}
                </td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="pt-cell-input"
                    value={s.casesExposed}
                    onChange={(e) =>
                      updateStratum(i, 'casesExposed', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="pt-cell-input"
                    value={s.personTimeExposed}
                    onChange={(e) =>
                      updateStratum(i, 'personTimeExposed', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="pt-cell-input"
                    value={s.casesUnexposed}
                    onChange={(e) =>
                      updateStratum(i, 'casesUnexposed', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="pt-cell-input"
                    value={s.personTimeUnexposed}
                    onChange={(e) =>
                      updateStratum(i, 'personTimeUnexposed', parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  {strata.length > 1 && (
                    <button
                      type="button"
                      className="pt-remove-btn"
                      onClick={() => removeStratum(i)}
                    >
                      x
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="pt-add-btn" onClick={addStratum}>
        {t.addStratumLabel}
      </button>

      <div className="pt-legend">{t.legendText}</div>
    </div>
  );
}