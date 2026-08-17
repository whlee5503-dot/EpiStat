import React from 'react';
import './SMRInput.css';
import { translations, type Lang } from '../i18n/translations';

interface SMRInputProps {
  observed: number;
  expected: number;
  onChangeObserved: (value: number) => void;
  onChangeExpected: (value: number) => void;
  lang: Lang;
}

const SMRInput: React.FC<SMRInputProps> = ({
  observed,
  expected,
  onChangeObserved,
  onChangeExpected,
  lang,
}) => {
  const t = translations[lang].smr.input;

  const handleObservedChange = (raw: string) => {
    const val = Math.max(0, Math.floor(parseFloat(raw) || 0));
    onChangeObserved(val);
  };

  const handleExpectedChange = (raw: string) => {
    const val = Math.max(0, parseFloat(raw) || 0);
    onChangeExpected(val);
  };

  return (
    <div className="smr-input-wrapper">
      <div className="smr-field">
        <label className="smr-label" htmlFor="smr-observed">
          {t.observedLabel}
        </label>
        <input
          id="smr-observed"
          type="number"
          className="smr-field-input"
          min={0}
          step={1}
          value={observed}
          onChange={(e) => handleObservedChange(e.target.value)}
        />
        <div className="smr-hint">{t.observedHint}</div>
      </div>

      <div className="smr-field">
        <label className="smr-label" htmlFor="smr-expected">
          {t.expectedLabel}
        </label>
        <input
          id="smr-expected"
          type="number"
          className="smr-field-input"
          min={0}
          step={0.1}
          value={expected}
          onChange={(e) => handleExpectedChange(e.target.value)}
        />
        <div className="smr-hint">{t.expectedHint}</div>
      </div>
    </div>
  );
};

export default SMRInput;