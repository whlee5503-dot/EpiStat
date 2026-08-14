import { useState, useMemo } from 'react';
import DoseResponseInput from './DoseResponseInput';
import { analyzeDoseResponse } from '../lib/doseResponse';
import type { DoseResponseTable } from '../lib/doseResponse';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css'; // shared layout classes
import './RxCAnalysis.css'; // reused for .rxc-warning-card pattern (not used here, kept for future)

interface Props {
  lang: Lang;
}

const DEFAULT_TABLE: DoseResponseTable = {
  scores: [0, 1, 2],
  strata: [
    [{ cases: 1, controls: 131 }, { cases: 1, controls: 104 }, { cases: 4, controls: 51 }],
    [{ cases: 0, controls: 188 }, { cases: 6, controls: 152 }, { cases: 15, controls: 83 }],
    [{ cases: 3, controls: 161 }, { cases: 12, controls: 130 }, { cases: 22, controls: 65 }],
    [{ cases: 11, controls: 169 }, { cases: 21, controls: 134 }, { cases: 39, controls: 68 }],
    [{ cases: 23, controls: 157 }, { cases: 42, controls: 97 }, { cases: 34, controls: 52 }],
  ],
};

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

const DoseResponseAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const td = t.doseresponse;

  const [table, setTable] = useState<DoseResponseTable>(DEFAULT_TABLE);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);

  const result = useMemo(() => {
    try {
      return analyzeDoseResponse(table);
    } catch {
      return null;
    }
  }, [table]);

  const pDisplay = result
    ? result.trendTest.pValue < 0.0001
      ? '< 0.0001'
      : '= ' + fmtP(result.trendTest.pValue)
    : '';

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{td.title}</h1>
        <p className="calc-subtitle">{td.subtitle}</p>
      </div>

      <div className="rxc-top">
        <DoseResponseInput table={table} onChange={setTable} />

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
                <span className="formula-name">{td.formulaTs}</span>
                <span className="formula-expr">{td.formulaTsExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{td.formulaEs}</span>
                <span className="formula-expr">{td.formulaEsExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{td.formulaVs}</span>
                <span className="formula-expr">{td.formulaVsExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{td.formulaChiSq}</span>
                <span className="formula-expr">{td.formulaChiSqExpr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rxc-results">
        {!result ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{td.emptyState}</div>
          </div>
        ) : (
          <>
            <div className="strat-stats-grid">
              <div className="strat-stat-card">
                <div className="strat-stat-label">{td.trendChiSqLabel}</div>
                <div className="strat-stat-value">{fmtNum(result.trendTest.chiSquare, 2)}</div>
                <div className="strat-stat-sub">{td.dfEquals1}</div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{td.pValueLabel}</div>
                <div className="strat-stat-value">{fmtP(result.trendTest.pValue)}</div>
                <div className="strat-stat-sub">
                  {result.trendTest.pValue < 0.05 ? td.sigTrend : td.notSigTrend}
                </div>
              </div>
            </div>

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{td.orTitle}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th>{td.scoreCol}</th>
                    <th>{td.mhORCol}</th>
                    <th>{td.mhCICol}</th>
                    <th>{td.crudeORCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.levelComparisons.map((lc, i) => (
                    <tr key={'lc-' + i}>
                      <td>{lc.score}</td>
                      <td>{fmtNum(lc.mhResult.orMH, 3)}</td>
                      <td>
                        {fmtNum(lc.mhResult.orMH_CI_lower, 2)} - {fmtNum(lc.mhResult.orMH_CI_upper, 2)}
                      </td>
                      <td>{fmtNum(lc.crudeOR, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                {td.orFootnote}
              </div>
            </div>

            <div className="strat-interp-card">
              <div className="strat-summary">
                {interp(result.trendTest.pValue < 0.05 ? td.interpSigTrue : td.interpSigFalse, {
                  chiSq: fmtNum(result.trendTest.chiSquare, 2),
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
                  <div className="strat-footnote">{td.interpDetail1}</div>
                  <div className="strat-footnote">{td.interpDetail2}</div>
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

export default DoseResponseAnalysis;