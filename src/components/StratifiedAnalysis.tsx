import React, { useState, useMemo } from 'react';
import StratifiedInput from './StratifiedInput';
import { analyzeSingleTable, mantelHaenszel } from '../lib/mantelHaenszel';
import type { TwoByTwoTable } from '../lib/mantelHaenszel';
import './StratifiedAnalysis.css';

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

const StratifiedAnalysis: React.FC = () => {
  const [strata, setStrata] = useState<TwoByTwoTable[]>(DEFAULT_STRATA);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);

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

  const isValid = strata.every((t) => t.a + t.b + t.c + t.d > 0);

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">Stratified Analysis</h1>
        <p className="calc-subtitle">
          Mantel-Haenszel adjusted odds ratio and risk ratio across 2 or more strata
        </p>
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
              <span className="formula-box-title">Formula</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {showFormula ? 'Show less' : 'Show more'}
              </span>
            </button>
            {showFormula && (
              <div className="formula-list" style={{ marginTop: 'var(--space-3)' }}>
                <div className="formula-row">
                  <span className="formula-name">OR_MH</span>
                  <span className="formula-expr">= Sum(aidi/ni) / Sum(bici/ni)</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">RR_MH</span>
                  <span className="formula-expr">= Sum(ai*n2i/ni) / Sum(ci*n1i/ni)</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">Chi-sq MH</span>
                  <span className="formula-expr">= (Sum ai - Sum Ei)^2 / Sum Vi</span>
                </div>
                <div className="formula-row">
                  <span className="formula-name">Breslow-Day</span>
                  <span className="formula-expr">= Sum(ai - Ai)^2 / Var(Ai), Tarone-corrected</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="strat-right">
          {!isValid || !mhResult ? (
            <div className="strat-empty-state">
              <div className="strat-empty-text">Enter values in all strata to see results</div>
            </div>
          ) : (
            <>
              <div className="strat-stats-grid">
                <div className="strat-stat-card">
                  <div className="strat-stat-label">Mantel-Haenszel OR</div>
                  <div className="strat-stat-value">{fmtNum(mhResult.orMH)}</div>
                  <div className="strat-stat-sub">
                    95% CI: {fmtNum(mhResult.orMH_CI_lower)} - {fmtNum(mhResult.orMH_CI_upper)}
                  </div>
                </div>
                <div className="strat-stat-card">
                  <div className="strat-stat-label">Mantel-Haenszel RR</div>
                  <div className="strat-stat-value">{fmtNum(mhResult.rrMH)}</div>
                  <div className="strat-stat-sub">
                    95% CI: {fmtNum(mhResult.rrMH_CI_lower)} - {fmtNum(mhResult.rrMH_CI_upper)}
                  </div>
                </div>
              </div>

              <div className="strat-ci-card">
                <span className="strat-ci-label">MH Summary Chi-sq</span>
                <span className="strat-ci-value">{fmtNum(mhResult.chiSquareMH, 2)}</span>
                <span className="strat-ci-hint">p = {fmtP(mhResult.pValueMH)}</span>
              </div>

              <div className="strat-chart-card">
                <div className="strat-chart-header">
                  <h2 className="strat-chart-title">Breslow-Day Test (Homogeneity of OR)</h2>
                </div>
                <div className="strat-bd-row">
                  <span>Chi-sq = {fmtNum(mhResult.breslowDayOR.chiSquare, 4)}</span>
                  <span>df = {mhResult.breslowDayOR.df}</span>
                  <span>p = {fmtP(mhResult.breslowDayOR.pValue)}</span>
                </div>
                <div className="strat-bd-note">
                  {mhResult.breslowDayOR.pValue > 0.05
                    ? 'p > 0.05 does not suggest interaction. The adjusted (MH) estimate can be used.'
                    : 'p <= 0.05 suggests possible interaction (effect modification) across strata. Interpret the pooled estimate with caution.'}
                </div>
              </div>

              <div className="strat-chart-card">
                <div className="strat-chart-header">
                  <h2 className="strat-chart-title">Per-Stratum Results</h2>
                </div>
                <table className="strat-table">
                  <thead>
                    <tr>
                      <th>Stratum</th>
                      <th>OR</th>
                      <th>RR</th>
                      <th>Chi-sq</th>
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

              <div className="strat-interp-card">
                <div className="strat-summary">
                  After adjusting for the stratification variable, the pooled odds ratio is{' '}
                  {fmtNum(mhResult.orMH, 2)} (95% CI: {fmtNum(mhResult.orMH_CI_lower, 2)}-
                  {fmtNum(mhResult.orMH_CI_upper, 2)}).
                </div>
                <button
                  className="strat-toggle-btn"
                  onClick={() => setShowInterp((s) => !s)}
                  type="button"
                >
                  {showInterp ? 'Show less' : 'Show more'}
                </button>
                {showInterp && (
                  <div className="strat-interp-detail">
                    <div className="strat-footnote">
                      The Mantel-Haenszel method combines stratum-specific estimates into a
                      single pooled estimate, weighting each stratum by its precision. This
                      controls for confounding by the stratification variable.
                    </div>
                    <div className="strat-disclaimer">
                      This tool is for epidemiological and educational purposes. It does not
                      replace professional statistical consultation for publication-grade
                      analyses.
                    </div>
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
