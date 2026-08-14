import { useState, useMemo } from 'react';
import SampleSizeCCInput from './SampleSizeCCInput';
import type { ExposureMode } from './SampleSizeCCInput';
import { calculateSampleSizeCC } from '../lib/sampleSizeCC';
import type { SampleSizeCCInput as InputType } from '../lib/sampleSizeCC';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';

interface Props {
  lang: Lang;
}

const DEFAULT_INPUT: InputType = {
  confidenceLevel: 0.95,
  power: 0.80,
  controlsToCasesRatio: 1,
  controlExposure: 0.40,
  oddsRatio: 2,
};

function fmtPct(x: number, digits = 2): string {
  if (!isFinite(x) || isNaN(x)) return '-';
  return (x * 100).toFixed(digits) + '%';
}

const SampleSizeCCAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const ts = t.samplesizepower.ssCC;

  const [input, setInput] = useState<InputType>(DEFAULT_INPUT);
  const [mode, setMode] = useState<ExposureMode>('oddsRatio');
  const [showFormula, setShowFormula] = useState(false);

  const handleChange = (next: InputType, nextMode: ExposureMode) => {
    setInput(next);
    setMode(nextMode);
  };

  const result = useMemo(() => {
    try {
      return calculateSampleSizeCC(input);
    } catch {
      return null;
    }
  }, [input]);

  return (
    <>
      <h2 className="strat-chart-title" style={{ marginBottom: 'var(--space-3)' }}>
        {ts.heading}
      </h2>

      <div className="rxc-top">
        <SampleSizeCCInput value={input} mode={mode} onChange={handleChange} />

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
                <span className="formula-name">{ts.formulaKelsey}</span>
                <span className="formula-expr">{ts.formulaKelseyExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{ts.formulaFleiss}</span>
                <span className="formula-expr">{ts.formulaFleissExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{ts.formulaFleissCC}</span>
                <span className="formula-expr">{ts.formulaFleissCCExpr}</span>
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
        {!result ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{ts.emptyState}</div>
          </div>
        ) : (
          <>
            <div className="strat-stats-grid">
              <div className="strat-stat-card">
                <div className="strat-stat-label">{ts.caseExposureLabel}</div>
                <div className="strat-stat-value">{fmtPct(result.p1)}</div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{ts.oddsRatioLabel}</div>
                <div className="strat-stat-value">{result.oddsRatio.toFixed(2)}</div>
              </div>
            </div>

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{ts.requiredSampleSizeTitle}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th>{ts.methodCol}</th>
                    <th>{ts.casesCol}</th>
                    <th>{ts.controlsCol}</th>
                    <th>{ts.totalCol}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{ts.methodKelsey}</td>
                    <td>{result.casesKelsey}</td>
                    <td>{result.controlsKelsey}</td>
                    <td>{result.casesKelsey + result.controlsKelsey}</td>
                  </tr>
                  <tr>
                    <td>{ts.methodFleiss}</td>
                    <td>{result.casesFleiss}</td>
                    <td>{result.controlsFleiss}</td>
                    <td>{result.casesFleiss + result.controlsFleiss}</td>
                  </tr>
                  <tr>
                    <td>{ts.methodFleissCC}</td>
                    <td>{result.casesFleissCC}</td>
                    <td>{result.controlsFleissCC}</td>
                    <td>{result.casesFleissCC + result.controlsFleissCC}</td>
                  </tr>
                </tbody>
              </table>
              <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                {ts.footnote}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SampleSizeCCAnalysis;