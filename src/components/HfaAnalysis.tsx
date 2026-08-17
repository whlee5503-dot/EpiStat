import { useState, useMemo } from 'react';
import HfaInput from './HfaInput';
import type { HfaFormState } from './HfaInput';
import { calculateHfa } from '../lib/hfa';
import type { HfaClassification } from '../lib/hfa';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css'; // shared layout classes
import './RxCAnalysis.css'; // .rxc-top / .rxc-results layout
import './WfaAnalysis.css'; // classification color modifiers (reused)

interface Props {
  lang: Lang;
}

const DEFAULT_FORM: HfaFormState = {
  sex: 'M',
  ageMonths: '9',
  measuredValue: '71.9687',
  measurementType: 'length',
};

const CLASSIFICATION_TONE: Record<HfaClassification, 'ok' | 'warning' | 'danger'> = {
  'severely stunted': 'danger',
  stunted: 'warning',
  normal: 'ok',
};

function fmtNum(n: number, digits = 2): string {
  if (!isFinite(n) || isNaN(n)) return '-';
  return n.toFixed(digits);
}

function interp(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

const HfaAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const th = t.hfa;

  const CLASSIFICATION_LABEL: Record<HfaClassification, string> = {
    'severely stunted': th.classSeverelyStunted,
    stunted: th.classStunted,
    normal: th.classNormal,
  };

  const CLASSIFICATION_LABEL_LOWER: Record<HfaClassification, string> = {
    'severely stunted': th.classSeverelyStuntedLower,
    stunted: th.classStuntedLower,
    normal: th.classNormalLower,
  };

  const MEASUREMENT_TYPE_LABEL: Record<'length' | 'height', string> = {
    length: th.measurementTypeLength,
    height: th.measurementTypeHeight,
  };

  const [form, setForm] = useState<HfaFormState>(DEFAULT_FORM);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);

  const ageNum = parseFloat(form.ageMonths);
  const valueNum = parseFloat(form.measuredValue);
  const validAge = !isNaN(ageNum) && ageNum >= 0 && ageNum <= 60;
  const validValue = !isNaN(valueNum) && valueNum > 0;

  const result = useMemo(() => {
    if (!validAge || !validValue) return null;
    try {
      return calculateHfa(form.sex, ageNum, valueNum, form.measurementType);
    } catch {
      return null;
    }
  }, [form.sex, ageNum, valueNum, form.measurementType, validAge, validValue]);

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{th.title}</h1>
        <p className="calc-subtitle">{th.subtitle}</p>
      </div>

      <div className="rxc-top">
        <HfaInput value={form} onChange={setForm} lang={lang} />

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
                <span className="formula-name">{th.formulaZ}</span>
                <span className="formula-expr">{th.formulaZExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{th.formulaMS}</span>
                <span className="formula-expr">{th.formulaMSExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{th.formulaCorrection}</span>
                <span className="formula-expr">{th.formulaCorrectionExpr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rxc-results">
        {!result ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{th.emptyState}</div>
          </div>
        ) : (
          <>
            <div className="strat-stats-grid">
              <div className="strat-stat-card">
                <div className="strat-stat-label">{th.zScoreLabel}</div>
                <div className="strat-stat-value">{fmtNum(result.zScore)}</div>
                <div className="strat-stat-sub">{th.zScoreSub}</div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{th.classificationLabel}</div>
                <div
                  className={
                    'strat-stat-value wfa-badge-' +
                    CLASSIFICATION_TONE[result.classification]
                  }
                >
                  {CLASSIFICATION_LABEL[result.classification]}
                </div>
                <div className="strat-stat-sub">{th.classificationCutoffs}</div>
              </div>
            </div>

            {result.correctionApplied && (
              <div className="strat-footnote" style={{ padding: 'var(--space-2) 0' }}>
                {interp(th.correctionNote, {
                  enteredType: MEASUREMENT_TYPE_LABEL[form.measurementType],
                  expectedType: MEASUREMENT_TYPE_LABEL[result.measurementExpected],
                })}
              </div>
            )}

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{th.whoRefTitle}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th>{th.lCol}</th>
                    <th>{th.mCol}</th>
                    <th>{th.sCol}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{result.lms.L.toFixed(0)}</td>
                    <td>{result.lms.M.toFixed(4)} cm</td>
                    <td>{result.lms.S.toFixed(5)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                {th.interpolationNote}
              </div>
            </div>

            <div className="strat-interp-card">
              <div className="strat-summary">
                {interp(th.interpSummary, {
                  age: form.ageMonths,
                  genderNoun: form.sex === 'M' ? th.boyNoun : th.girlNoun,
                  measurementTypeLabel: MEASUREMENT_TYPE_LABEL[form.measurementType],
                  value: form.measuredValue,
                  z: fmtNum(result.zScore),
                  classLower: CLASSIFICATION_LABEL_LOWER[result.classification],
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
                  <div className="strat-footnote">{th.interpDetail1}</div>
                  <div className="strat-footnote">{th.interpDetail2}</div>
                  <div className="strat-disclaimer">{th.bodySizeDisclaimer}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HfaAnalysis;