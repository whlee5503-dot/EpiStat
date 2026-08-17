import { useState, useMemo } from 'react';
import SMRInput from './SMRInput';
import { analyzeSMR } from '../lib/smr';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css'; // shared layout classes: .strat-calc, .strat-layout, etc.

interface Props {
  lang: Lang;
}

function fmtNum(n: number, digits = 3): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  return n.toFixed(digits);
}

function fmtP(p: number): string {
  if (!isFinite(p) || isNaN(p)) return '—';
  if (p < 0.0001) return '< 0.0001';
  return p.toFixed(4);
}

function fmtCI(lower: number | undefined, upper: number | undefined): string {
  if (lower === undefined || upper === undefined) return '—';
  if (!isFinite(lower) || !isFinite(upper)) return '—';
  return fmtNum(lower) + ' - ' + fmtNum(upper);
}

function interp(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

const SMRAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const ts = t.smr;

  const [observed, setObserved] = useState<number>(4);
  const [expected, setExpected] = useState<number>(3.3);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);

  const result = useMemo(() => {
    try {
      return analyzeSMR(observed, expected);
    } catch {
      return null;
    }
  }, [observed, expected]);

  const isValid = expected > 0;

  const pDisplay = result
    ? result.midPPValue < 0.0001
      ? '< 0.0001'
      : '= ' + fmtP(result.midPPValue)
    : '';

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{ts.title}</h1>
        <p className="calc-subtitle">{ts.subtitle}</p>
      </div>

      <div className="strat-layout">
        <div className="strat-left">
          <SMRInput
            observed={observed}
            expected={expected}
            onChangeObserved={setObserved}
            onChangeExpected={setExpected}
            lang={lang}
          />

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
                  <span className="formula-name">{ts.formulaSmr}</span>
                  <span className="formula-expr">{ts.formulaSmrExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaMidP}</span>
                  <span className="formula-expr">{ts.formulaMidPExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaMidPCI}</span>
                  <span className="formula-expr">{ts.formulaMidPCIExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaByar}</span>
                  <span className="formula-expr">{ts.formulaByarExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaRG}</span>
                  <span className="formula-expr">{ts.formulaRGExpr}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="strat-right">
          {!isValid || !result ? (
            <div className="strat-empty-state">
              <div className="strat-empty-text">{ts.emptyState}</div>
            </div>
          ) : (
            <>
              <div className="strat-stats-grid">
                <div className="strat-stat-card">
                  <div className="strat-stat-label">{ts.smrLabel}</div>
                  <div className="strat-stat-value">{fmtNum(result.smr)}</div>
                  <div className="strat-stat-sub">
                    {interp(ts.obsExpSub, { obs: result.observed, exp: fmtNum(result.expected, 2) })}
                  </div>
                </div>
                <div className="strat-stat-card">
                  <div className="strat-stat-label">{ts.midPPValueLabel}</div>
                  <div className="strat-stat-value">{fmtP(result.midPPValue)}</div>
                  <div className="strat-stat-sub">
                    {result.midPPValue < 0.05 ? ts.significant : ts.notSignificant}
                  </div>
                </div>
              </div>

              <div className="strat-ci-card">
                <span className="strat-ci-label">{ts.midPCILabel}</span>
                <span className="strat-ci-value">
                  {fmtNum(result.midPCI_lower)} - {fmtNum(result.midPCI_upper)}
                </span>
                <span className="strat-ci-hint">
                  {result.midPCI_lower <= 1 && result.midPCI_upper >= 1 ? ts.includes1 : ts.excludes1}
                </span>
              </div>

              <div className="strat-chart-card">
                <div className="strat-chart-header">
                  <h2 className="strat-chart-title">{ts.allMethodsTitle}</h2>
                </div>
                <table className="strat-table">
                  <thead>
                    <tr>
                      <th>{ts.methodCol}</th>
                      <th>{ts.pValueCol}</th>
                      <th>{ts.ci95Col}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{ts.methodMidP}</td>
                      <td>{fmtP(result.midPPValue)}</td>
                      <td>{fmtCI(result.midPCI_lower, result.midPCI_upper)}</td>
                    </tr>
                    <tr>
                      <td>{ts.methodFisher}</td>
                      <td>{fmtP(result.fisherPValue)}</td>
                      <td>{fmtCI(result.fisherCI_lower, result.fisherCI_upper)}</td>
                    </tr>
                    <tr>
                      <td>{ts.methodByar}</td>
                      <td>{fmtP(result.byarPValue)}</td>
                      <td>{fmtCI(result.byarCI_lower, result.byarCI_upper)}</td>
                    </tr>
                    <tr>
                      <td>{ts.methodNormal}</td>
                      <td>{fmtP(result.normalApproxPValue)}</td>
                      <td>{fmtCI(result.normalApproxCI_lower, result.normalApproxCI_upper)}</td>
                    </tr>
                    <tr>
                      <td>{ts.methodRG}</td>
                      <td>—</td>
                      <td>{fmtCI(result.rothmanGreenlandCI_lower, result.rothmanGreenlandCI_upper)}</td>
                    </tr>
                    <tr>
                      <td>{ts.methodUryWiggins}</td>
                      <td>—</td>
                      <td>
                        {result.uryWigginsCI
                          ? fmtCI(result.uryWigginsCI.lower, result.uryWigginsCI.upper)
                          : ts.naUryWiggins}
                      </td>
                    </tr>
                    <tr>
                      <td>{ts.methodVandenbroucke}</td>
                      <td>—</td>
                      <td>
                        {result.vandenbrouckeCI
                          ? fmtCI(result.vandenbrouckeCI.lower, result.vandenbrouckeCI.upper)
                          : ts.naVandenbroucke}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                  {ts.ciOnlyFootnote}
                </div>
              </div>

              <div className="strat-interp-card">
                <div className="strat-summary">
                  {interp(ts.interpSummary, {
                    obs: result.observed,
                    exp: fmtNum(result.expected, 2),
                    smr: fmtNum(result.smr, 2),
                    lo: fmtNum(result.midPCI_lower, 2),
                    hi: fmtNum(result.midPCI_upper, 2),
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
                    <div className="strat-footnote">{ts.interpDetail1}</div>
                    <div className="strat-footnote">{ts.interpDetail2}</div>
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

export default SMRAnalysis;