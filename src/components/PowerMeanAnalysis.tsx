import { useState, useMemo } from 'react';
import PowerMeanInput from './PowerMeanInput';
import { calculatePowerMean } from '../lib/powerMean';
import type { PowerMeanInput as InputType } from '../lib/powerMean';
import { translations, type Lang } from '../i18n/translations';

const DEFAULT_INPUT: InputType = {
  confidenceLevel: 0.95,
  meanDifference: 5,
  n1: 100,
  s1: 15.34,
  n2: 100,
  s2: 18.23,
};

function fmtPct(x: number, digits = 1): string {
  if (!isFinite(x) || isNaN(x)) return '-';
  return (x * 100).toFixed(digits) + '%';
}

function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

interface Props {
  lang: Lang;
}

const PowerMeanAnalysis: React.FC<Props> = ({ lang }) => {
  const T = translations[lang].samplesizepower.powerMean;
  const [input, setInput] = useState<InputType>(DEFAULT_INPUT);
  const [showFormula, setShowFormula] = useState(false);

  const result = useMemo(() => {
    try {
      return calculatePowerMean(input);
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
        <PowerMeanInput value={input} onChange={setInput} lang={lang} />

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
                <span className="formula-name">{T.formulaSE}</span>
                <span className="formula-expr">{T.formulaSEExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{T.formulaPower}</span>
                <span className="formula-expr">{T.formulaPowerExpr}</span>
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
                <div className="strat-stat-label">{T.powerLabel}</div>
                <div className="strat-stat-value">{fmtPct(result.power)}</div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{T.seLabel}</div>
                <div className="strat-stat-value">{result.se.toFixed(4)}</div>
              </div>
            </div>

            <div className="strat-interp-card">
              <div className="strat-summary">
                {t(T.summaryTemplate, {
                  diff: Math.abs(input.meanDifference),
                  power: fmtPct(result.power, 0),
                  confidence: (input.confidenceLevel * 100).toFixed(0),
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PowerMeanAnalysis;