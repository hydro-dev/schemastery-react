import React from 'react';

export default function BitCheckBox({
  model, label, value, disabled, onChange,
}: {
  label: string,
  value: number,
  model: number,
  onChange: (value: number) => void,
  disabled?: boolean,
}) {
  return (
    <div className="bit-checkbox">
      <label htmlFor={label}>
        <input
          type="checkbox"
          checked={!!(model & value)}
          onChange={() => onChange(model ^ value)}
          disabled={disabled ?? false}
        />
        {label}
      </label>
    </div>
  );
}
