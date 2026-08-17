import { useState, useMemo } from 'react';
import WfhInput from './WfhInput';
import type { WfhFormState } from './WfhInput';
import { calculateWfh } from '../lib/wfh';
import type { WfhClassification } from '../lib/wfh';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css'; // shared layout classes
import './RxCAnalysis.css'; // .rxc-top / .rxc-results layout
import './WfaAnalysis.css'; // classification color modifiers (reused)

interface Props {
  lang: Lang;
}

const DEFAULT_FORM: WfhFormState = {
  sex: 'M',
  ageMonths: '9',
  lengthOrHeightCm: '75.0',
  measurementType: 'length',
  weightKg: '9.5',
};

const CLASSIFICATION_TONE: Record<WfhClassification, 'ok' | 'warning' | 'danger'> = {
  'severely wasted': 'danger',
  wasted: 'warning',
  normal: 'ok',
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

const WfhAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const tw = t.wfh;

  const CLASSIFICATION_LABEL: Record<WfhClassification, string> = {
    'severely wasted': tw.classSeverelyWasted,
    wasted: tw.classWasted,
    normal: tw.classNormal,
    overweight: tw.classOverweight,
    obese: tw.classObese,
  };

  const CLASSIFICATION_LABEL_LOWER: Record<WfhClassification, string> = {
    'severely wasted': tw.classSeverelyWastedLower,
    wasted: tw.classWastedLower,
    normal: tw.classNormalLower,
    overweight: tw.classOverweightLower,
    obese: tw.classObeseLower,
  };

  const MEASUREMENT_TYPE_LABEL: Record<'length' | 'height', string> = {
    length: tw.measurementTypeLength,
    height: tw.measurementTypeHeight,
  };

  const [form, setForm] = useState<WfhFormState>(DEFAULT_FORM);
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
      return calculateWfh(
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

  const typeNoun = result
    ? result.tableUsed === 'WFL'
      ? tw.lengthNoun
      : tw.heightNoun
    : '';

  const tableName = result
    ? result.tableUsed === 'WFL'
      ? tw.tableNameWfl
      : tw.tableNameWfh
    : '';

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{tw.title}</h1>
        <p className="calc-subtitle">{tw.subtitle}</p>
      </div>

      <div className="rxc-top">
        <WfhInput value={form} onChange={setForm} lang={lang} />

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
                <span className="formula-name">{tw.formulaZ}</span>
                <span className="formula-expr">{tw.formulaZExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tw.formulaLMS}</span>
                <span className="formula-expr">{tw.formulaLMSExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tw.formulaTable}</span>
                <span className="formula-expr">{tw.formulaTableExpr}</span>
              </div>
              <div className="formula-row">
                <span className="formula-name">{tw.formulaCorrection}</span>
                <span className="formula-expr">{tw.formulaCorrectionExpr}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rxc-results">
        {!result ? (
          <div className="strat-empty-state">
            <div className="strat-empty-text">{tw.emptyState}</div>
          </div>
        ) : (
          <>
            <div className="strat-stats-grid">
              <div className="strat-stat-card">
                <div className="strat-stat-label">{tw.zScoreLabel}</div>
                <div className="strat-stat-value">{fmtNum(result.zScore)}</div>
                <div className="strat-stat-sub">
                  {interp(tw.zScoreSubTemplate, { typeNoun })}
                </div>
              </div>
              <div className="strat-stat-card">
                <div className="strat-stat-label">{tw.classificationLabel}</div>
                <div
                  className={
                    'strat-stat-value wfa-badge-' +
                    CLASSIFICATION_TONE[result.classification]
                  }
                >
                  {CLASSIFICATION_LABEL[result.classification]}
                </div>
                <div className="strat-stat-sub">{tw.classificationCutoffs}</div>
              </div>
            </div>

            {result.correctionApplied && (
              <div className="strat-footnote" style={{ padding: 'var(--space-2) 0' }}>
                {interp(tw.correctionNote, {
                  enteredType: MEASUREMENT_TYPE_LABEL[form.measurementType],
                  expectedType: MEASUREMENT_TYPE_LABEL[result.measurementExpected],
                })}
              </div>
            )}

            <div className="strat-chart-card">
              <div className="strat-chart-header">
                <h2 className="strat-chart-title">{tw.whoRefTitle}</h2>
              </div>
              <table className="strat-table">
                <thead>
                  <tr>
                    <th>{tw.lCol}</th>
                    <th>{tw.mCol}</th>
                    <th>{tw.sCol}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{result.lms.L.toFixed(4)}</td>
                    <td>{result.lms.M.toFixed(4)} kg</td>
                    <td>{result.lms.S.toFixed(5)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="strat-footnote" style={{ marginTop: 'var(--space-3)' }}>
                {interp(tw.interpolationNoteTemplate, { tableName })}
              </div>
            </div>

            <div className="strat-interp-card">
              <div className="strat-summary">
                {interp(tw.interpSummary, {
                  age: form.ageMonths,
                  genderNoun: form.sex === 'M' ? tw.boyNoun : tw.girlNoun,
                  weight: form.weightKg,
                  measurementTypeLabel: MEASUREMENT_TYPE_LABEL[form.measurementType],
                  value: form.lengthOrHeightCm,
                  typeNoun,
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
                  <div className="strat-footnote">{tw.interpDetail1}</div>
                  <div className="strat-footnote">{tw.interpDetail2}</div>
                  <div className="strat-disclaimer">{tw.bodySizeDisclaimer}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WfhAnalysis;