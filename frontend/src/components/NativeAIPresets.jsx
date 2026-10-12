import React from 'react';

// Presets only update form state. Record choices always come from the loaded API list.
export default function NativeAIPresets({ presets, onChoose, disabled = false, prerequisite }) {
  return <div className="ai-preset-bar">
    <div><strong>Example inputs</strong><p>Choose an example, review the fields, then generate when ready.</p>
      {prerequisite && <p role="status">{prerequisite}</p>}</div>
    <div className="ai-actions">{presets.map((preset) =>
      <button key={preset.label} type="button" className="btn btn-secondary"
        disabled={disabled || preset.disabled} onClick={() => onChoose(preset)}>{preset.label}</button>)}</div>
  </div>;
}
