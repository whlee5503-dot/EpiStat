import { useState, useMemo } from 'react';
import MatchCCInput from './MatchCCInput';
import { analyzeMatchCC } from '../lib/matchcc';
import type { MatchCCTable } from '../lib/matchcc';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css'; // shared layout classes: .strat-calc, .strat-layout, etc.
import './RxCAnalysis.css'; // reused here for .rxc-warning-card (few-discordant-pairs notice)

interface Props {
  lang: Lang;
}

const DEFAULT_TABLE: MatchCCTable = { w: 3, x: 7, y: 1, z: 9 };

function fmtNum(n: number, digits = 3): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  return n.toFixed(digits);
}

function fmtP(p: number): string {
  if (!isFinite(p) || isNaN(p)) return '—';
  if (p < 0.0001) return '< 0.0001';
  return p.toFixed(5);
}

function interp(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

const MatchCCAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const tc = t.matchcc;

  const [table, setTable] = useState<MatchCCTable>(DEFAULT_TABLE);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);

  const result = useMemo(() => {
    try {
      return analyzeMatchCC(table);
    } catch {
      return null;
    }
  }, [table]);

  const pDisplay = result
    ? result.midPExact.twoTailP < 0.0001
      ? '< 0.0001'
      : '= ' + fmtP(result.midPExact.twoTailP)
    : '';

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{tc.title}</h1>
        <p className="calc-subtitle">{tc.subtitle}</p>
      </div>

      <div className="strat-layout">
        <div className="strat-left">
          <MatchCCInput table={table} onChange={setTable} />

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
                  <span className="formula-name">{tc.formulaMOR}</span>
                  <span className="formula-expr">{tc.formulaMORExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{tc.formulaMcNemar}</span>
                  <span className="formula-expr">{tc.formulaMcNemarExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{tc.formulaCorrected}</span>
                  <span className="formula-expr">{tc.formulaCorrectedExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{tc.formulaTaylorCI}</span>
                  <span className="formula-expr">{tc.formulaTaylorCIExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{tc.formulaExactCI}</span>
                  <span className="formula-expr">{tc.formulaExactCIExpr}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="strat-right">
          {!result ? (
            <div className="strat-empty-state">
              <div className="strat-empty-text">{tc.emptyState}</div>
            </div>
          ) : (
            <>
              <div className="strat-stats-grid">
                <div className="strat-stat-card">
                  <div className="strat-stat-label">{tc.matchedORLabel}</div>
                  <div className="strat-stat-value">{fmtNum(result.mOR)}</div>
                  <div className="strat-stat-sub">
                    {interp(tc.discordantPairsSub, { n: result.discordantPairs })}
                  </div>
                </div>
                <div className="strat-stat-card">
                  <div className="strat-stat-label">{tc.mcNemarChiSqLabel}</div>
                  <div className="strat-stat-value">{fmtNum(result.mcNemar.chiSquare, 2)}</div>
                  <div className="strat-stat-sub">
                    {interp(tc.pEquals, { p: fmtP(result.mcNemar.pValue) })}
                  </div>
                </div>
              </div>

              {result.fewDiscordantPairs && (
                <div className="rxc-warning-card" style={{ borderColor: 'var(--color-primary)' }}>
                  <span className="rxc-warning-icon" style={{ background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)' }}>i</span>
                  <div className="rxc-warning-text">
                    {interp(tc.fewDiscordantWarning, { n: result.discordantPairs })}
                  </div>
                </div>
              )}

              <div className="strat-chart-card">
                <div className="strat-chart-header">
                  <h2 className="strat-chart-title">{tc.sigTestsTitle}</h2>
                </div>
                <table className="strat-table">
                  <thead>
                    <tr>
                      <th>{tc.testCol}</th>
                      <th>{tc.valueCol}</th>
                      <th>{tc.oneTailCol}</th>
                      <th>{tc.twoTailCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{tc.testMcNemar}</td>
                      <td>{fmtNum(result.mcNemar.chiSquare, 3)}</td>
                      <td>—</td>
                      <td>{fmtP(result.mcNemar.pValue)}</td>
                    </tr>
                    <tr>
                      <td>{tc.testMcNemarCorrected}</td>
                      <td>{fmtNum(result.mcNemar.correctedChiSquare, 3)}</td>
                      <td>—</td>
                      <td>{fmtP(result.mcNemar.correctedPValue)}</td>
                    </tr>
                    <tr>
                      <td>{tc.testFisher}</td>
                      <td>—</td>
                      <td>{fmtP(result.fisherExact.oneTailP)}</td>
                      <td>{fmtP(result.fisherExact.twoTailP)}</td>
                    </tr>
                    <tr>
                      <td>{tc.testMidP}</td>
                      <td>—</td>
                      <td>{fmtP(result.midPExact.oneTailP)}</td>
                      <td>{fmtP(result.midPExact.twoTailP)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="strat-chart-card">
                <div className="strat-chart-header">
                  <h2 className="strat-chart-title">{tc.ciTitle}</h2>
                </div>
                <table className="strat-table">
                  <thead>
                    <tr>
                      <th>{tc.methodCol}</th>
                      <th>{tc.ci95Col}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{tc.methodTaylor}</td>
                      <td>{fmtNum(result.taylorCI.lower)} - {fmtNum(result.taylorCI.upper)}</td>
                    </tr>
                    <tr>
                      <td>{tc.methodMidPCMLE}</td>
                      <td>{fmtNum(result.midPCI.lower)} - {fmtNum(result.midPCI.upper)}</td>
                    </tr>
                    <tr>
                      <td>{tc.methodFisherCMLE}</td>
                      <td>{fmtNum(result.fisherCI.lower)} - {fmtNum(result.fisherCI.upper)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="strat-interp-card">
                <div className="strat-summary">
                  {interp(tc.interpSummary, {
                    mor: fmtNum(result.mOR, 2),
                    lo: fmtNum(result.midPCI.lower, 2),
                    hi: fmtNum(result.midPCI.upper, 2),
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
                    <div className="strat-footnote">{tc.interpDetail1}</div>
                    <div className="strat-footnote">{tc.interpDetail2}</div>
                    <div className="strat-disclaimer">{t.common.disclaimer}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCCAnalysis;