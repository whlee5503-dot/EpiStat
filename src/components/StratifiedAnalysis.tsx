import React, { useState, useMemo } from 'react';
import StratifiedInput from './StratifiedInput';
import {
  analyzeSingleTable,
  mantelHaenszel,
  breslowDayTestRR,
  fisherExact2x2,
  midPExact2x2,
} from '../lib/mantelHaenszel';
import type { TwoByTwoTable } from '../lib/mantelHaenszel';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css';

interface Props {
  lang: Lang;
}

const DEFAULT_STRATA: TwoByTwoTable[] = [
  { a: 66, b: 36, c: 28, d: 32 },
  { a: 40, b: 20, c: 15, d: 25 },
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

function sumStrata(strata: TwoByTwoTable[]): TwoByTwoTable {
  return strata.reduce(
    (acc, t) => ({ a: acc.a + t.a, b: acc.b + t.b, c: acc.c + t.c, d: acc.d + t.d }),
    { a: 0, b: 0, c: 0, d: 0 }
  );
}

// Replaces {key} placeholders in a translation string with provided values.
function interp(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

const StratifiedAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const ts = t.stratified;

  const [strata, setStrata] = useState<TwoByTwoTable[]>(DEFAULT_STRATA);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);
  const [bdMetric, setBdMetric] = useState<'OR' | 'RR'>('OR');
  const [showExactTests, setShowExactTests] = useState(false);

  const perStratumResults = useMemo(
    () => strata.map((t) => analyzeSingleTable(t)),
    [strata]
  );

  const mhResult = useMemo(() => {
    try {
      return mantelHaenszel(strata);
    } catch {
      return null;
    }
  }, [strata]);

  const breslowDayRRResult = useMemo(() => {
    try {
      return breslowDayTestRR(strata);
    } catch {
      return null;
    }
  }, [strata]);

  const crudeTable = useMemo(() => sumStrata(strata), [strata]);

  const exactTestResult = useMemo(() => {
    try {
      return {
        fisher: fisherExact2x2(crudeTable),
        midP: midPExact2x2(crudeTable),
      };
    } catch {
      return null;
    }
  }, [crudeTable]);

  const isValid = strata.every((t) => t.a + t.b + t.c + t.d > 0);

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{ts.title}</h1>
        <p className="calc-subtitle">{ts.subtitle}</p>
      </div>

      <div className="strat-layout">
        <div className="strat-left">
          <StratifiedInput strata={strata} onChange={setStrata} />

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
                  <span className="formula-name">{ts.formulaOrMh}</span>
                  <span className="formula-expr">{ts.formulaOrMhExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaRrMh}</span>
                  <span className="formula-expr">{ts.formulaRrMhExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaChiSq}</span>
                  <span className="formula-expr">{ts.formulaChiSqExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaBdOr}</span>
                  <span className="formula-expr">{ts.formulaBdOrExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaBdRr}</span>
                  <span className="formula-expr">{ts.formulaBdRrExpr}</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">{ts.formulaExact}</span>
                  <span className="formula-expr">{ts.formulaExactExpr}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="strat-right">
          {!isValid || !mhResult ? (
            <div className="strat-empty-state">
              <div className="strat-empty-text">{ts.emptyState}</div>
            </div>
          ) : (
            <>
              <div className="strat-stats-grid">
                <div className="strat-stat-card">
                  <div className="strat-stat-label">{ts.mhOR}</div>
                  <div className="strat-stat-value">{fmtNum(mhResult.orMH)}</div>
                  <div className="strat-stat-sub">
                    {interp(ts.ci95, {
                      lo: fmtNum(mhResult.orMH_CI_lower),
                      hi: fmtNum(mhResult.orMH_CI_upper),
                    })}
                  </div>
                </div>
                <div className="strat-stat-card">
                  <div className="strat-stat-label">{ts.mhRR}</div>
                  <div className="strat-stat-value">{fmtNum(mhResult.rrMH)}</div>
                  <div className="strat-stat-sub">
                    {interp(ts.ci95, {
                      lo: fmtNum(mhResult.rrMH_CI_lower),
                      hi: fmtNum(mhResult.rrMH_CI_upper),
                    })}
                  </div>
                </div>
              </div>

              <div className="strat-ci-card">
                <span className="strat-ci-label">{ts.mhSummaryChiSq}</span>
                <span className="strat-ci-value">{fmtNum(mhResult.chiSquareMH, 2)}</span>
                <span className="strat-ci-hint">{interp(ts.pEquals, { p: fmtP(mhResult.pValueMH) })}</span>
              </div>

              <div className="strat-chart-card">
                <div className="strat-chart-header">
                  <h2 className="strat-chart-title">{ts.breslowDayTitle}</h2>
                  <div className="strat-toggle-group" style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className={'strat-toggle-btn' + (bdMetric === 'OR' ? ' strat-toggle-btn-active' : '')}
                      onClick={() => setBdMetric('OR')}
                    >
                      OR
                    </button>
                    <button
                      type="button"
                      className={'strat-toggle-btn' + (bdMetric === 'RR' ? ' strat-toggle-btn-active' : '')}
                      onClick={() => setBdMetric('RR')}
                    >
                      RR
                    </button>
                  </div>
                </div>
                {bdMetric === 'OR' ? (
                  <>
                    <div className="strat-bd-row">
                      <span>Chi-sq = {fmtNum(mhResult.breslowDayOR.chiSquare, 4)}</span>
                      <span>df = {mhResult.breslowDayOR.df}</span>
                      <span>{interp(ts.pEquals, { p: fmtP(mhResult.breslowDayOR.pValue) })}</span>
                    </div>
                    <div className="strat-bd-note">
                      {mhResult.breslowDayOR.pValue > 0.05 ? ts.bdOrNoInteraction : ts.bdOrInteraction}
                    </div>
                  </>
                ) : breslowDayRRResult ? (
                  <>
                    <div className="strat-bd-row">
                      <span>Chi-sq = {fmtNum(breslowDayRRResult.chiSquare, 4)}</span>
                      <span>df = {breslowDayRRResult.df}</span>
                      <span>{interp(ts.pEquals, { p: fmtP(breslowDayRRResult.pValue) })}</span>
                    </div>
                    <div className="strat-bd-note">
                      {breslowDayRRResult.pValue > 0.05 ? ts.bdRrNoInteraction : ts.bdRrInteraction}
                    </div>
                  </>
                ) : (
                  <div className="strat-bd-note">{ts.bdRrUnavailable}</div>
                )}
              </div>

              <div className="strat-chart-card">
                <div className="strat-chart-header">
                  <h2 className="strat-chart-title">{ts.perStratumTitle}</h2>
                </div>
                <table className="strat-table">
                  <thead>
                    <tr>
                      <th>{ts.stratumCol}</th>
                      <th>{ts.orCol}</th>
                      <th>{ts.rrCol}</th>
                      <th>{ts.chiSqCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perStratumResults.map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{fmtNum(r.oddsRatio, 3)}</td>
                        <td>{fmtNum(r.riskRatio, 3)}</td>
                        <td>{fmtNum(r.chiSquareUncorrected, 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="strat-chart-card">
                <div className="strat-chart-header">
                  <h2 className="strat-chart-title">{ts.exactTestsTitle}</h2>
                </div>
                {!exactTestResult ? (
                  <div className="strat-bd-note">{ts.exactTestsUnavailable}</div>
                ) : (
                  <>
                    <div className="strat-bd-row">
                      <span>{interp(ts.fisherExactP, { p: fmtP(exactTestResult.fisher.pValue) })}</span>
                      <span>{interp(ts.midPExactP, { p: fmtP(exactTestResult.midP.pValue) })}</span>
                    </div>
                    <div className="strat-bd-note">
                      {interp(ts.exactTestsNote, {
                        a: crudeTable.a,
                        b: crudeTable.b,
                        c: crudeTable.c,
                        d: crudeTable.d,
                      })}
                    </div>
                    <button
                      className="strat-toggle-btn"
                      onClick={() => setShowExactTests((s) => !s)}
                      type="button"
                    >
                      {showExactTests ? t.common.showLess : ts.perStratumExactBtn}
                    </button>
                    {showExactTests && (
                      <table className="strat-table" style={{ marginTop: 'var(--space-2)' }}>
                        <thead>
                          <tr>
                            <th>{ts.stratumCol}</th>
                            <th>{ts.fisherExactPCol}</th>
                            <th>{ts.midPExactPCol}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {strata.map((t, i) => (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{fmtP(fisherExact2x2(t).pValue)}</td>
                              <td>{fmtP(midPExact2x2(t).pValue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>

              <div className="strat-interp-card">
                <div className="strat-summary">
                  {interp(ts.interpSummary, {
                    or: fmtNum(mhResult.orMH, 2),
                    lo: fmtNum(mhResult.orMH_CI_lower, 2),
                    hi: fmtNum(mhResult.orMH_CI_upper, 2),
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
                    <div className="strat-footnote">{ts.interpDetail}</div>
                    <div className="strat-footnote">
                      {interp(ts.waldNote, { value: fmtNum(mhResult.waldOR.chiSquare, 4) })}
                    </div>
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

export default StratifiedAnalysis;