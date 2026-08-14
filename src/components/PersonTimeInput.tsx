import './PersonTimeInput.css';
import type { PersonTimeStratum } from '../lib/personTime';

interface PersonTimeInputProps {
  strata: PersonTimeStratum[];
  onChange: (strata: PersonTimeStratum[]) => void;
}

const DEFAULT_STRATUM: PersonTimeStratum = {
  casesExposed: 0,
  personTimeExposed: 0,
  casesUnexposed: 0,
  personTimeUnexposed: 0,
};

export default function PersonTimeInput({ strata, onChange }: PersonTimeInputProps) {
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
              <th colSpan={2}>Exposed</th>
              <th colSpan={2}>Unexposed</th>
              <th></th>
            </tr>
            <tr>
              <th></th>
              <th>Cases</th>
              <th>Person-time</th>
              <th>Cases</th>
              <th>Person-time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {strata.map((s, i) => (
              <tr key={i}>
                <td className="pt-rowlbl">
                  {strata.length > 1 ? 'Stratum ' + (i + 1) : 'Data'}
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
        + Add Stratum
      </button>

      <div className="pt-legend">
        Person-time can be in any consistent unit (e.g. person-years,
        person-weeks). With a single stratum, results show the crude
        incidence rate ratio/difference only. Add strata to see
        directly-adjusted and Mantel-Haenszel-adjusted estimates.
      </div>
    </div>
  );
}
