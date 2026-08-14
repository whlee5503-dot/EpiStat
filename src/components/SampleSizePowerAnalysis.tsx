import { useState } from 'react';
import SampleSizeProportionAnalysis from './SampleSizeProportionAnalysis';
import SampleSizeCCAnalysis from './SampleSizeCCAnalysis';
import SampleSizeCohortAnalysis from './SampleSizeCohortAnalysis';
import SampleSizeMeanAnalysis from './SampleSizeMeanAnalysis';
import PowerCCAnalysis from './PowerCCAnalysis';
import PowerCohortAnalysis from './PowerCohortAnalysis';
import PowerClinicalTrialAnalysis from './PowerClinicalTrialAnalysis';
import PowerCrossSectionalAnalysis from './PowerCrossSectionalAnalysis';
import PowerMeanAnalysis from './PowerMeanAnalysis';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import './StratifiedAnalysis.css';
import './RxCAnalysis.css';
import './SampleSizePowerAnalysis.css';

interface Props {
  lang: Lang;
}

type SubModuleKey =
  | 'ss-proportion'
  | 'ss-cc'
  | 'ss-cohort'
  | 'ss-mean'
  | 'power-cc'
  | 'power-cohort'
  | 'power-trial'
  | 'power-cross'
  | 'power-mean';

const SUB_MODULE_KEYS: SubModuleKey[] = [
  'ss-proportion',
  'ss-cc',
  'ss-cohort',
  'ss-mean',
  'power-cc',
  'power-cohort',
  'power-trial',
  'power-cross',
  'power-mean',
];

const SUBNAV_LABEL_KEY: Record<SubModuleKey, string> = {
  'ss-proportion': 'ssProportion',
  'ss-cc': 'ssCC',
  'ss-cohort': 'ssCohort',
  'ss-mean': 'ssMean',
  'power-cc': 'powerCC',
  'power-cohort': 'powerCohort',
  'power-trial': 'powerTrial',
  'power-cross': 'powerCross',
  'power-mean': 'powerMean',
};

const SampleSizePowerAnalysis: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const tsp = t.samplesizepower;

  const [active, setActive] = useState<SubModuleKey>('ss-proportion');

  return (
    <div className="strat-calc">
      <div className="calc-hero">
        <h1 className="calc-title">{tsp.title}</h1>
        <p className="calc-subtitle">{tsp.subtitle}</p>
      </div>

      <div className="ssp-subnav">
        {SUB_MODULE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={
              'ssp-subnav-btn' + (active === key ? ' ssp-subnav-btn-active' : '')
            }
            onClick={() => setActive(key)}
          >
            {tsp.subnav[SUBNAV_LABEL_KEY[key] as keyof typeof tsp.subnav]}
          </button>
        ))}
      </div>

      {active === 'ss-proportion' && <SampleSizeProportionAnalysis lang={lang} />}
      {active === 'ss-cc' && <SampleSizeCCAnalysis lang={lang} />}
      {active === 'ss-cohort' && <SampleSizeCohortAnalysis lang={lang} />}
      {active === 'ss-mean' && <SampleSizeMeanAnalysis lang={lang} />}
      {active === 'power-cc' && <PowerCCAnalysis lang={lang} />}
      {active === 'power-cohort' && <PowerCohortAnalysis lang={lang} />}
      {active === 'power-trial' && <PowerClinicalTrialAnalysis lang={lang} />}
      {active === 'power-cross' && <PowerCrossSectionalAnalysis lang={lang} />}
      {active === 'power-mean' && <PowerMeanAnalysis lang={lang} />}
    </div>
  );
};

export default SampleSizePowerAnalysis;