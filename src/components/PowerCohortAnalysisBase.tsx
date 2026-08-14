import { useState, useMemo } from 'react';
import PowerCohortInput from './PowerCohortInput';
import { calculatePowerCohort } from '../lib/powerCohort';
import type { PowerCohortInput as InputType } from '../lib/powerCohort';
import { translations, type Lang } from '../i18n/translations';

export interface PowerCohortAnalysisBaseProps {
  title: string;
  outcomeLabel: string;
  exposedLabel: string;
  unexposedLabel: string;
  ratioLabel: string;
  defaultInput: InputType;
  lang: Lang;
}

function fmtPct(x: number, digits = 1): string {
  if (!isFinite(x) || isNaN(x)) return '-';
  return (x * 100).toFixed(digits) + '%';
}

function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

export default function PowerCohortAnalysisBase({
  title,
  outcomeLabel,
  exposedLabel,
  unexposedLabel,
  ratioLabel,
  defaultInput,
  lang,
}: PowerCohortAnalysisBaseProps) {
  const T = translations[lang].samplesizepower.powerCohortBase;
  const [input, setInput] = useState<InputType>(defaultInput);
  const [showFormula, setShowFormula] = useState(false);

  const result = useMemo(() => {
    try {
      return calculatePowerCohort(input);
    } catch {
      return null;
    }
  }, [input]);

  return (
    <>
      <h2 className="strat-chart-title" style={{ marginBottom: 'var(--space-3)' }}>
        {title}
      </h2>

      <div className="rxc-top">
        <PowerCohortInput
          value={input}
          onChange={setInput}
          exposedLabel={exposedLabel}
          unexposedLabel={unexposedLabel}
          outcomeLabel={outcomeLabel}
        />

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
                <span className="formula-name">{T.formulaPower}</span>
                <span className="formula-expr">{T.formulaPowerExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{T.formulaWithCC}</span>
                <span className="formula-expr">{T.formulaWithCCExpr}</span>
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
                <div className="strat-stat-label">{T.powerUncorrectedLabel}</div>
                <div className="strat-stat-value">{fmtPct(result.powerUncorrected)}</div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{T.powerCCLabel}</div>
                <div className="strat-stat-value">{fmtPct(result.powerContinuityCorrected)}</div>
              </div>
            </div>

            <div className="strat-interp-card">
              <div className="strat-summary">
                {t(T.summaryTemplate, {
                  ratioLabel,
                  rr: result.riskRatio.toFixed(3),
                  powerUncorrected: fmtPct(result.powerUncorrected, 0),
                  powerCC: fmtPct(result.powerContinuityCorrected, 0),
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}