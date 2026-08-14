import { useState, useMemo } from 'react';
import SampleSizeMeanInput from './SampleSizeMeanInput';
import { calculateSampleSizeMean } from '../lib/sampleSizeMean';
import type { SampleSizeMeanInput as InputType } from '../lib/sampleSizeMean';
import { translations, type Lang } from '../i18n/translations';

const DEFAULT_INPUT: InputType = {
  confidenceLevel: 0.95,
  power: 0.80,
  ratio: 1,
  sd1: 15,
  sd2: 15,
  meanDifference: 10,
};

interface Props {
  lang: Lang;
}

const SampleSizeMeanAnalysis: React.FC<Props> = ({ lang }) => {
  const T = translations[lang].samplesizepower.ssMean;
  const [input, setInput] = useState<InputType>(DEFAULT_INPUT);
  const [showFormula, setShowFormula] = useState(false);

  const result = useMemo(() => {
    try {
      return calculateSampleSizeMean(input);
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
        <SampleSizeMeanInput value={input} onChange={setInput} />

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
                <span className="formula-name">{T.formulaN1}</span>
                <span className="formula-expr">{T.formulaN1Expr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{T.formulaN2}</span>
                <span className="formula-expr">{T.formulaN2Expr}</span>
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
          <div className="strat-stats-grid">
            <div className="strat-stat-card">
              <div className="strat-stat-label">{T.sampleSizeGroup1Label}</div>
              <div className="strat-stat-value">{result.n1}</div>
            </div>
            <div className="strat-stat-card">
              <div className="strat-stat-label">{T.sampleSizeGroup2Label}</div>
              <div className="strat-stat-value">{result.n2}</div>
            </div>
            <div className="strat-stat-card" style={{ gridColumn: '1 / -1' }}>
              <div className="strat-stat-label">{T.totalSampleSizeLabel}</div>
              <div className="strat-stat-value">{result.n1 + result.n2}</div>
              <div className="strat-stat-sub">{T.roundedNote}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SampleSizeMeanAnalysis;