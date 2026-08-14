import { useState, useMemo } from 'react';
import PersonTimeInput from './PersonTimeInput';
import { analyzeStratifiedPersonTime } from '../lib/personTime';
import type { PersonTimeStratum } from '../lib/personTime';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css'; // shared layout classes
import './RxCAnalysis.css'; // .rxc-top / .rxc-results layout

interface Props {
  lang: Lang;
}

const DEFAULT_STRATA: PersonTimeStratum[] = [
  { casesExposed: 10, personTimeExposed: 53, casesUnexposed: 4, personTimeUnexposed: 245 },
  { casesExposed: 11, personTimeExposed: 129, casesUnexposed: 5, personTimeUnexposed: 114 },
];

function fmtNum(n: number, digits = 3): string {
  if (!isFinite(n) || isNaN(n)) return '-';
  return n.toFixed(digits);
}

function fmtP(p: number): string {
  if (!isFinite(p) || isNaN(p)) return '-';
  if (p < 0.0001) return '< 0.0001';
  return p.toFixed(4);
}

function interp(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

const PersonTimeAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const tp = t.persontime;

  const [strata, setStrata] = useState<PersonTimeStratum[]>(DEFAULT_STRATA);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);

  const inputError = useMemo(() => {
    if (strata.some((s) => s.personTimeExposed <= 0 || s.personTimeUnexposed <= 0)) {
      return tp.errorPersonTime;
    }
    if (strata.some((s) => s.casesExposed === 0 || s.casesUnexposed === 0)) {
      return tp.errorZeroCases;
    }
    return null;
  }, [strata, tp]);

  const result = useMemo(() => {
    if (inputError) return null;
    try {
      return analyzeStratifiedPersonTime(strata);
    } catch {
      return null;
    }
  }, [strata, inputError]);

  const isStratified = strata.length > 1;

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{tp.title}</h1>
        <p className="calc-subtitle">{tp.subtitle}</p>
      </div>

      <div className="rxc-top">
        <PersonTimeInput strata={strata} onChange={setStrata} />

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
                <span className="formula-name">{tp.formulaIR}</span>
                <span className="formula-expr">{tp.formulaIRExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tp.formulaIRR}</span>
                <span className="formula-expr">{tp.formulaIRRExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tp.formulaIRD}</span>
                <span className="formula-expr">{tp.formulaIRDExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tp.formulaMhIRR}</span>
                <span className="formula-expr">{tp.formulaMhIRRExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tp.formulaInteraction}</span>
                <span className="formula-expr">{tp.formulaInteractionExpr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rxc-results">
        {!result ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{inputError ?? tp.emptyState}</div>
          </div>
        ) : (
          <>
            <div className="strat-stats-grid">
              <div className="strat-stat-card">
                <div className="strat-stat-label">{tp.crudeIRRLabel}</div>
                <div className="strat-stat-value">{fmtNum(result.crude.irr)}</div>
                <div className="strat-stat-sub">
                  {interp(tp.ci95, {
                    lo: fmtNum(result.crude.irrCI[0]),
                    hi: fmtNum(result.crude.irrCI[1]),
                  })}
                </div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{tp.crudeIRDLabel}</div>
                <div className="strat-stat-value">{fmtNum(result.crude.ird, 4)}</div>
                <div className="strat-stat-sub">
                  {interp(tp.ci95, {
                    lo: fmtNum(result.crude.irdCI[0], 4),
                    hi: fmtNum(result.crude.irdCI[1], 4),
                  })}
                </div>
              </div>
            </div>

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{tp.crudeSigTestTitle}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th>{tp.zCol}</th>
                    <th>{tp.pValueCol}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{fmtNum(result.crude.zStat, 3)}</td>
                    <td>{fmtP(result.crude.pValue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {isStratified && (
              <>
                <div className="strat-chart-card">
                  <div className="strat-chart-header">
                    <h2 className="strat-chart-title">{tp.adjustedIRRTitle}</h2>
                  </div>
                  <table className="strat-table">
                    <thead>
                      <tr>
                        <th>{tp.methodCol}</th>
                        <th>{tp.irrCol}</th>
                        <th>{tp.ci95Col}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{tp.directlyAdjusted}</td>
                        <td>{fmtNum(result.directIRR)}</td>
                        <td>
                          {fmtNum(result.directIRRCI[0])} - {fmtNum(result.directIRRCI[1])}
                        </td>
                      </tr>
                      <tr>
                        <td>{tp.mantelHaenszelMethod}</td>
                        <td>{fmtNum(result.mhIRR)}</td>
                        <td>
                          {fmtNum(result.mhIRRCI[0])} - {fmtNum(result.mhIRRCI[1])}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                    {interp(tp.interactionIRRNote, {
                      chiSq: fmtNum(result.interactionChiSqIRR, 3),
                      df: strata.length - 1,
                      p: fmtP(result.interactionPValueIRR),
                    })}{' '}
                    {result.interactionPValueIRR < 0.05
                      ? tp.interactionSigTrue
                      : tp.interactionSigFalse}
                  </div>
                </div>

                <div className="strat-chart-card">
                  <div className="strat-chart-header">
                    <h2 className="strat-chart-title">{tp.adjustedIRDTitle}</h2>
                  </div>
                  <table className="strat-table">
                    <thead>
                      <tr>
                        <th>{tp.methodCol}</th>
                        <th>{tp.irdCol}</th>
                        <th>{tp.ci95Col}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{tp.directlyAdjusted}</td>
                        <td>{fmtNum(result.directIRD, 4)}</td>
                        <td>
                          {fmtNum(result.directIRDCI[0], 4)} - {fmtNum(result.directIRDCI[1], 4)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                    {interp(tp.interactionIRDNote, {
                      chiSq: fmtNum(result.interactionChiSqIRD, 3),
                      df: strata.length - 1,
                      p: fmtP(result.interactionPValueIRD),
                    })}
                  </div>
                </div>

                <div className="strat-chart-card">
                  <div className="strat-chart-header">
                    <h2 className="strat-chart-title">{tp.stratumSpecificTitle}</h2>
                  </div>
                  <table className="strat-table">
                    <thead>
                      <tr>
                        <th>{tp.stratumCol}</th>
                        <th>{tp.irrCol}</th>
                        <th>{tp.irdCol}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.strata.map((s, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{fmtNum(s.irri)}</td>
                          <td>{fmtNum(s.irdi, 4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="strat-interp-card">
              <div className="strat-summary">
                {isStratified
                  ? interp(tp.summaryZTemplate, {
                    z: fmtNum(result.summaryZ, 3),
                    p: fmtP(result.summaryPValue),
                  })
                  : interp(tp.summaryCrudeTemplate, {
                    irr: fmtNum(result.crude.irr),
                    lo: fmtNum(result.crude.irrCI[0]),
                    hi: fmtNum(result.crude.irrCI[1]),
                    p: fmtP(result.crude.pValue),
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
                  <div className="strat-footnote">{tp.interpDetail1}</div>
                  {isStratified && (
                    <div className="strat-footnote">{tp.interpDetail2}</div>
                  )}
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

export default PersonTimeAnalysis;