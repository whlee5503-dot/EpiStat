import { useState, useMemo } from 'react';
import RxCInput from './RxCInput';
import { analyzeRxC } from '../lib/rxc';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css'; // shared layout classes: .strat-calc, .strat-stats-grid, etc.
import './RxCAnalysis.css'; // RxC-specific layout and additions

interface Props {
  lang: Lang;
}

const DEFAULT_TABLE: number[][] = [
  [983, 383, 2892],
  [679, 416, 2625],
  [134, 84, 570],
];

function fmtNum(n: number, digits = 3): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  return n.toFixed(digits);
}

function fmtP(p: number): string {
  if (!isFinite(p) || isNaN(p)) return '—';
  if (p < 0.0001) return '< 0.0001';
  return p.toFixed(4);
}

function interp(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

const RxCAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const tr = t.rxc;

  const [table, setTable] = useState<number[][]>(DEFAULT_TABLE);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);

  const result = useMemo(() => {
    try {
      return analyzeRxC(table);
    } catch {
      return null;
    }
  }, [table]);

  const grandTotal = table.reduce(
    (sum, row) => sum + row.reduce((a, b) => a + b, 0),
    0
  );
  const isValid = grandTotal > 0;

  const pDisplay = result
    ? result.pValue < 0.0001
      ? '< 0.0001'
      : '= ' + fmtP(result.pValue)
    : '';

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{tr.title}</h1>
        <p className="calc-subtitle">{tr.subtitle}</p>
      </div>

      <div className="rxc-top">
        <RxCInput table={table} onChange={setTable} lang={lang} />

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
                <span className="formula-name">{tr.formulaExpected}</span>
                <span className="formula-expr">{tr.formulaExpectedExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tr.formulaChiSq}</span>
                <span className="formula-expr">{tr.formulaChiSqExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tr.formulaDf}</span>
                <span className="formula-expr">{tr.formulaDfExpr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rxc-results">
        {!isValid || !result ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{tr.emptyState}</div>
          </div>
        ) : (
          <>
            <div className="strat-stats-grid">
              <div className="strat-stat-card">
                <div className="strat-stat-label">{tr.chiSquareLabel}</div>
                <div className="strat-stat-value">{fmtNum(result.chiSquare, 3)}</div>
                <div className="strat-stat-sub">{interp(tr.dfPrefix, { df: result.df })}</div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{tr.pValueLabel}</div>
                <div className="strat-stat-value">{fmtP(result.pValue)}</div>
                <div className="strat-stat-sub">
                  {result.pValue < 0.05 ? tr.significant : tr.notSignificant}
                </div>
              </div>
            </div>

            {result.lowExpectedWarning && (
              <div className="rxc-warning-card">
                <span className="rxc-warning-icon">!</span>
                <div className="rxc-warning-text">
                  {interp(tr.lowExpectedWarning, { min: fmtNum(result.minExpected, 2) })}
                </div>
              </div>
            )}

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{tr.observedVsExpected}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th></th>
                    {result.observed[0].map((_, j) => (
                      <th key={'oh-' + j}>{'C' + (j + 1)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.observed.map((row, i) => (
                    <tr key={'or-' + i}>
                      <td>{'R' + (i + 1)}</td>
                      {row.map((v, j) => (
                        <td key={'oc-' + i + '-' + j}>
                          {v} <span style={{ color: 'var(--text-muted)' }}>
                            ({fmtNum(result.expected[i][j], 1)})
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                {tr.valuesShownNote}
              </div>
            </div>

            <div className="strat-interp-card">
              <div className="strat-summary">
                {interp(result.pValue < 0.05 ? tr.interpSigTrue : tr.interpSigFalse, {
                  chiSq: fmtNum(result.chiSquare, 2),
                  df: result.df,
                  pDisplay,
                })}
              </div>
              <button
                className="strat-toggle-btn"
                onClick={() => setShowInterp((s) => !s)}
                type="button"
              >
                {showInterp ? t.common.showLess : t.common.showMore}
              </button>
              {showInterp && (
                <div className="strat-interp-detail">
                  <div className="strat-footnote">{tr.interpDetail}</div>
                  <div className="strat-disclaimer">{t.common.disclaimer}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RxCAnalysis;