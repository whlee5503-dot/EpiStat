import { useState, useMemo } from 'react';
import SampleSizeCohortInput from './SampleSizeCohortInput';
import type { CohortEffectMode } from './SampleSizeCohortInput';
import { calculateSampleSizeCohort } from '../lib/sampleSizeCohort';
import type { SampleSizeCohortInput as InputType } from '../lib/sampleSizeCohort';
import { translations, type Lang } from '../i18n/translations';

const DEFAULT_INPUT: InputType = {
  confidenceLevel: 0.95,
  power: 0.80,
  unexposedToExposedRatio: 1,
  unexposedOutcome: 0.05,
  riskRatio: 2,
};

function fmtPct(x: number, digits = 2): string {
  if (!isFinite(x) || isNaN(x)) return '-';
  return (x * 100).toFixed(digits) + '%';
}

function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

interface Props {
  lang: Lang;
}

const SampleSizeCohortAnalysis: React.FC<Props> = ({ lang }) => {
  const T = translations[lang].samplesizepower.ssCohort;
  const [input, setInput] = useState<InputType>(DEFAULT_INPUT);
  const [mode, setMode] = useState<CohortEffectMode>('riskRatio');
  const [showFormula, setShowFormula] = useState(false);

  const handleChange = (next: InputType, nextMode: CohortEffectMode) => {
    setInput(next);
    setMode(nextMode);
  };

  const result = useMemo(() => {
    try {
      return calculateSampleSizeCohort(input);
    } catch {
      return null;
    }
  }, [input]);

  return (
    <>
      <h2 className="strat-chart-title" style={{ marginBottom: 'var(--space-3)' }}>
        {T.heading}
      </h2>

      <div className="rxc-top">
        <SampleSizeCohortInput value={input} mode={mode} onChange={handleChange} />

        <div className="formula-box">
          <button
            className="ds-formula-toggle"
            onClick={() => setShowFormula((s) => !s)}
            type="button"
          >
            <span className="formula-box-title">{translations[lang].common.formula}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {showFormula ? translations[lang].common.showLess : translations[lang].common.showMore}
            </span>
          </button>
          {showFormula && (
            <div className="formula-list" style={{ marginTop: 'var(--space-3)' }}>
              <div className="formula-row">
                <span className="formula-name">{T.formulaKelsey}</span>
                <span className="formula-expr">{T.formulaKelseyExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{T.formulaFleiss}</span>
                <span className="formula-expr">{T.formulaFleissExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{T.formulaFleissCC}</span>
                <span className="formula-expr">{T.formulaFleissCCExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{T.formulaSource}</span>
                <span className="formula-expr">{T.formulaSourceExpr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rxc-results">
        {!result ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{T.emptyState}</div>
          </div>
        ) : (
          <>
            <div className="strat-stats-grid">
              <div className="strat-stat-card">
                <div className="strat-stat-label">{T.exposedOutcomeLabel}</div>
                <div className="strat-stat-value">{fmtPct(result.p1)}</div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{T.riskRatioLabel}</div>
                <div className="strat-stat-value">{result.riskRatio.toFixed(2)}</div>
              </div>
            </div>

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{T.requiredSampleSizeTitle}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th>{T.methodCol}</th>
                    <th>{T.exposedCol}</th>
                    <th>{T.unexposedCol}</th>
                    <th>{T.totalCol}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{T.methodKelsey}</td>
                    <td>{result.exposedKelsey}</td>
                    <td>{result.unexposedKelsey}</td>
                    <td>{result.exposedKelsey + result.unexposedKelsey}</td>
                  </tr>
                  <tr>
                    <td>{T.methodFleiss}</td>
                    <td>{result.exposedFleiss}</td>
                    <td>{result.unexposedFleiss}</td>
                    <td>{result.exposedFleiss + result.unexposedFleiss}</td>
                  </tr>
                  <tr>
                    <td>{T.methodFleissCC}</td>
                    <td>{result.exposedFleissCC}</td>
                    <td>{result.unexposedFleissCC}</td>
                    <td>{result.exposedFleissCC + result.unexposedFleissCC}</td>
                  </tr>
                </tbody>
              </table>
              <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                {t(T.footnote, {
                  or: result.oddsRatio.toFixed(3),
                  rd: fmtPct(result.riskDifference),
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SampleSizeCohortAnalysis;