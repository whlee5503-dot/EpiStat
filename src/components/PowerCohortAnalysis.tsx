import PowerCohortAnalysisBase from './PowerCohortAnalysisBase';
import { translations, type Lang } from '../i18n/translations';

const DEFAULT_INPUT = {
  confidenceLevel: 0.95,
  exposed: 436,
  unexposed: 436,
  exposedOutcome: 0.10,
  unexposedOutcome: 0.05,
};

interface Props {
  lang: Lang;
}

export default function PowerCohortAnalysis({ lang }: Props) {
  const T = translations[lang].samplesizepower.powerCohort;

  return (
    <PowerCohortAnalysisBase
      title={T.title}
      outcomeLabel={T.outcomeLabel}
      exposedLabel={T.exposedLabel}
      unexposedLabel={T.unexposedLabel}
      ratioLabel={T.ratioLabel}
      defaultInput={DEFAULT_INPUT}
      lang={lang}
    />
  );
}