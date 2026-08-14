import { useState, useEffect, lazy, Suspense } from 'react';
import { translations } from './i18n/translations';
import type { Lang } from './i18n/translations';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const StratifiedAnalysis = lazy(() => import('./components/StratifiedAnalysis'));
const RxCAnalysis = lazy(() => import('./components/RxCAnalysis'));
const SMRAnalysis = lazy(() => import('./components/SMRAnalysis'));
const MatchCCAnalysis = lazy(() => import('./components/MatchCCAnalysis'));
const DoseResponseAnalysis = lazy(() => import('./components/DoseResponseAnalysis'));
const WfaAnalysis = lazy(() => import('./components/WfaAnalysis'));
const HfaAnalysis = lazy(() => import('./components/HfaAnalysis'));
const WfhAnalysis = lazy(() => import('./components/WfhAnalysis'));
const BmiAnalysis = lazy(() => import('./components/BmiAnalysis'));
const PersonTimeAnalysis = lazy(() => import('./components/PersonTimeAnalysis'));
const SampleSizePowerAnalysis = lazy(() => import('./components/SampleSizePowerAnalysis'));

type ModuleKey =
  | 'stratified'
  | 'rxc'
  | 'smr'
  | 'matchcc'
  | 'doseresponse'
  | 'wfa'
  | 'hfa'
  | 'wfh'
  | 'bmi'
  | 'persontime'
  | 'samplesizepower';

const MODULE_KEYS: ModuleKey[] = [
  'stratified',
  'rxc',
  'smr',
  'matchcc',
  'doseresponse',
  'wfa',
  'hfa',
  'wfh',
  'bmi',
  'persontime',
  'samplesizepower',
];

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
];

function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('stratified');
  const [lang, setLang] = useState<Lang>('en');

  // Restore saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('epistat-lang');
    if (saved === 'en' || saved === 'ko' || saved === 'fr') {
      setLang(saved);
    }
  }, []);

  const changeLang = (next: Lang) => {
    setLang(next);
    localStorage.setItem('epistat-lang', next);
  };

  const t = translations[lang];

  return (
    <div className="app-root">
      <div className="app-lang-switcher">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            className={'app-lang-btn' + (lang === l.code ? ' app-lang-btn-active' : '')}
            onClick={() => changeLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <nav className="app-nav">
        {MODULE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={
              'app-nav-btn' + (activeModule === key ? ' app-nav-btn-active' : '')
            }
            onClick={() => setActiveModule(key)}
          >
            {t.nav[key]}
          </button>
        ))}
      </nav>

      {/* resetKey=activeModule: switching modules automatically clears any
          error state left over from a previously-failed module, so a
          transient failure (e.g. a dropped network connection during a
          dynamic import) doesn't permanently disable that module for the
          rest of the session. */}
      <ErrorBoundary lang={lang} resetKey={activeModule}>
        <Suspense fallback={<div className="app-module-loading">Loading...</div>}>
          {activeModule === 'stratified' && <StratifiedAnalysis lang={lang} />}
          {activeModule === 'rxc' && <RxCAnalysis lang={lang} />}
          {activeModule === 'smr' && <SMRAnalysis lang={lang} />}
          {activeModule === 'matchcc' && <MatchCCAnalysis lang={lang} />}
          {activeModule === 'doseresponse' && <DoseResponseAnalysis lang={lang} />}
          {activeModule === 'wfa' && <WfaAnalysis lang={lang} />}
          {activeModule === 'hfa' && <HfaAnalysis lang={lang} />}
          {activeModule === 'wfh' && <WfhAnalysis lang={lang} />}
          {activeModule === 'bmi' && <BmiAnalysis lang={lang} />}
          {activeModule === 'persontime' && <PersonTimeAnalysis lang={lang} />}
          {activeModule === 'samplesizepower' && <SampleSizePowerAnalysis lang={lang} />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;