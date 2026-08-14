import { useState, useMemo } from 'react';
import BmiInput from './BmiInput';
import type { BmiFormState } from './BmiInput';
import { calculateBmi } from '../lib/bmi';
import type { BmiClassification } from '../lib/bmi';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css'; // shared layout classes
import './RxCAnalysis.css'; // .rxc-top / .rxc-results layout
import './WfaAnalysis.css'; // classification color modifiers (reused)

interface Props {
  lang: Lang;
}

const DEFAULT_FORM: BmiFormState = {
  sex: 'M',
  ageMonths: '9',
  lengthOrHeightCm: '71.9687',
  measurementType: 'length',
  weightKg: '8.9',
};

const CLASSIFICATION_TONE: Record<BmiClassification, 'ok' | 'warning' | 'danger'> = {
  'severely wasted': 'danger',
  wasted: 'warning',
  normal: 'ok',
  'possible risk of overweight': 'warning',
  overweight: 'warning',
  obese: 'danger',
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

const BmiAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const tb = t.bmi;

  const CLASSIFICATION_LABEL: Record<BmiClassification, string> = {
    'severely wasted': tb.classSeverelyWasted,
    wasted: tb.classWasted,
    normal: tb.classNormal,
    'possible risk of overweight': tb.classRiskOverweight,
    overweight: tb.classOverweight,
    obese: tb.classObese,
  };

  const CLASSIFICATION_LABEL_LOWER: Record<BmiClassification, string> = {
    'severely wasted': tb.classSeverelyWastedLower,
    wasted: tb.classWastedLower,
    normal: tb.classNormalLower,
    'possible risk of overweight': tb.classRiskOverweightLower,
    overweight: tb.classOverweightLower,
    obese: tb.classObeseLower,
  };

  const MEASUREMENT_TYPE_LABEL: Record<'length' | 'height', string> = {
    length: tb.measurementTypeLength,
    height: tb.measurementTypeHeight,
  };

  const [form, setForm] = useState<BmiFormState>(DEFAULT_FORM);
  const [showFormula, setShowFormula] = useState(false);
  const [showInterp, setShowInterp] = useState(false);

  const ageNum = parseFloat(form.ageMonths);
  const cmNum = parseFloat(form.lengthOrHeightCm);
  const weightNum = parseFloat(form.weightKg);
  const validAge = !isNaN(ageNum) && ageNum >= 0 && ageNum <= 60;
  const validCm = !isNaN(cmNum) && cmNum > 0;
  const validWeight = !isNaN(weightNum) && weightNum > 0;

  const result = useMemo(() => {
    if (!validAge || !validCm || !validWeight) return null;
    try {
      return calculateBmi(
        form.sex,
        ageNum,
        weightNum,
        cmNum,
        form.measurementType
      );
    } catch {
      return null;
    }
  }, [
    form.sex,
    ageNum,
    weightNum,
    cmNum,
    form.measurementType,
    validAge,
    validCm,
    validWeight,
  ]);

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{tb.title}</h1>
        <p className="calc-subtitle">{tb.subtitle}</p>
      </div>

      <div className="rxc-top">
        <BmiInput value={form} onChange={setForm} />

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
                <span className="formula-name">{tb.formulaBmi}</span>
                <span className="formula-expr">{tb.formulaBmiExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tb.formulaZ}</span>
                <span className="formula-expr">{tb.formulaZExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tb.formulaCorrectionOrder}</span>
                <span className="formula-expr">{tb.formulaCorrectionOrderExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tb.formulaTable}</span>
                <span className="formula-expr">{tb.formulaTableExpr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rxc-results">
        {!result ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{tb.emptyState}</div>
          </div>
        ) : (
          <>
            <div className="strat-stats-grid">
              <div className="strat-stat-card">
                <div className="strat-stat-label">{tb.bmiLabel}</div>
                <div className="strat-stat-value">{fmtNum(result.bmi, 1)}</div>
                <div className="strat-stat-sub">{tb.bmiUnit}</div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{tb.zScoreLabel}</div>
                <div className="strat-stat-value">{fmtNum(result.zScore)}</div>
                <div className="strat-stat-sub">{tb.zScoreSub}</div>
              </div>
            </div>

            <div className="strat-stats-grid" style={{ marginTop: 'var(--space-3)' }}>
              <div className="strat-stat-card" style={{ gridColumn: '1 / -1' }}>
                <div className="strat-stat-label">{tb.classificationLabel}</div>
                <div
                  className={
                    'strat-stat-value wfa-badge-' +
                    CLASSIFICATION_TONE[result.classification]
                  }
                  style={{ fontSize: '1.5rem' }}
                >
                  {CLASSIFICATION_LABEL[result.classification]}
                </div>
                <div className="strat-stat-sub">{tb.classificationCutoffs}</div>
              </div>
            </div>

            {result.correctionApplied && (
              <div className="strat-footnote" style={{ padding: 'var(--space-2) 0' }}>
                {interp(tb.correctionNote, {
                  measurementTypeLabel: MEASUREMENT_TYPE_LABEL[form.measurementType],
                  expectedType: MEASUREMENT_TYPE_LABEL[result.measurementExpected],
                })}
              </div>
            )}

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{tb.whoRefTitle}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th>{tb.lCol}</th>
                    <th>{tb.mCol}</th>
                    <th>{tb.sCol}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{result.lms.L.toFixed(4)}</td>
                    <td>{result.lms.M.toFixed(4)} kg/m2</td>
                    <td>{result.lms.S.toFixed(5)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                {tb.interpolationNote}
              </div>
            </div>

            <div className="strat-interp-card">
              <div className="strat-summary">
                {interp(tb.interpSummary, {
                  age: form.ageMonths,
                  genderNoun: form.sex === 'M' ? tb.boyNoun : tb.girlNoun,
                  weight: form.weightKg,
                  measurementTypeLabel: MEASUREMENT_TYPE_LABEL[form.measurementType],
                  value: form.lengthOrHeightCm,
                  bmi: fmtNum(result.bmi, 1),
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
                  <div className="strat-footnote">{tb.interpDetail1}</div>
                  <div className="strat-footnote">{tb.interpDetail2}</div>
                  <div className="strat-disclaimer">{tb.bodySizeDisclaimer}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BmiAnalysis;