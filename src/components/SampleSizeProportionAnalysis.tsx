import { useState, useMemo } from 'react';
import SampleSizeProportionInput from './SampleSizeProportionInput';
import { calculateSampleSizeProportion } from '../lib/sampleSizeProportion';
import type { SampleSizeProportionInput as InputType } from '../lib/sampleSizeProportion';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';

interface Props {
  lang: Lang;
}

const DEFAULT_INPUT: InputType = {
  populationSize: 1_000_000,
  anticipatedFrequency: 0.5,
  absolutePrecision: 0.05,
  designEffect: 1.0,
};

function interp(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

const SampleSizeProportionAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const ts = t.samplesizepower.ssProportion;

  const [input, setInput] = useState<InputType>(DEFAULT_INPUT);
  const [showFormula, setShowFormula] = useState(false);

  const results = useMemo(() => {
    try {
      return calculateSampleSizeProportion(input);
    } catch {
      return null;
    }
  }, [input]);

  const result95 = results?.find((r) => r.label === '95%');

  return (
    <>
      <h2 className="strat-chart-title" style={{ marginBottom: 'var(--space-3)' }}>
        {ts.heading}
      </h2>

      <div className="rxc-top">
        <SampleSizeProportionInput value={input} onChange={setInput} />

        <div className="formula-box">
          <button
            className="ds-formula-toggle"
            onClick={() => setShowFormula((s) => !s)}
            type="button"
          >
            <span className="formula-box-title">{t.common.formula}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {showFormula ? t.common.showLess : t.common.showMore}
            </span>
          </button>
          {showFormula && (
            <div className="formula-list" style={{ marginTop: 'var(--space-3)' }}>
              <div className="formula-row">
                <span className="formula-name">{ts.formulaN}</span>
                <span className="formula-expr">{ts.formulaNExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{ts.formulaSource}</span>
                <span className="formula-expr">{ts.formulaSourceExpr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rxc-results">
        {!results ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{ts.emptyState}</div>
          </div>
        ) : (
          <>
            {result95 && (
              <div className="strat-stats-grid">
                <div className="strat-stat-card" style={{ gridColumn: '1 / -1' }}>
                  <div className="strat-stat-label">{ts.sampleSizeLabel}</div>
                  <div className="strat-stat-value">{result95.sampleSize}</div>
                  <div className="strat-stat-sub">
                    {interp(ts.precisionSub, {
                      precision: (input.absolutePrecision * 100).toFixed(1),
                      freq: (input.anticipatedFrequency * 100).toFixed(1),
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{ts.byConfidenceTitle}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th>{ts.confidenceLevelCol}</th>
                    <th>{ts.sampleSizeCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.label}>
                      <td>{r.label}</td>
                      <td>{r.sampleSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                {ts.roundingNote}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SampleSizeProportionAnalysis;