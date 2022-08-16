import React from 'react';
import { isNullable } from 'cosmokit';
import Schema from 'schemastery';

export default function SchemaPrimitive({
  schema, value, disabled, onChange, Prefix, Suffix,
}: {
  schema: Schema;
  value: any;
  disabled: boolean;
  onChange: (value: any) => void;
  Prefix?: any;
  Suffix?: any;
}) {
  if (schema.type === 'boolean') {
    return (
      <input
        type="checkbox"
        className="checkbox"
        checked={value || false}
        disabled={disabled}
        onChange={(e) => { onChange(e.target.checked); }}
      />
    );
  }
  if (schema.type === 'number') {
    if (schema.meta.role === 'slider') {
      return (
        <input
          type="range"
          className="range"
          min={schema.meta.min}
          max={schema.meta.max}
          step={schema.meta.step}
          value={value || ''}
          disabled={disabled}
          onChange={(e) => {
            onChange(+e.target.value);
          }}
        />
      );
    }
    return (
      <input
        type="number"
        className="textbox"
        value={value || ''}
        disabled={disabled}
        step={schema.meta.step}
        onChange={(e) => {
          onChange(+e.target.value);
        }}
      />
    );
  }
  if (schema.meta.role === 'time') {
    return (
      <input
        type="time"
        value={value ? value.replaceAll('/', '-') : ''}
        disabled={disabled}
        onChange={(e) => {
          onChange(new Date(e.target.value).toLocaleTimeString());
        }}
      />
    );
  }
  if (schema.meta.role === 'date') {
    return (
      <input
        type="date"
        value={value ? value.replaceAll('/', '-') : ''}
        disabled={disabled}
        onChange={(e) => {
          onChange(new Date(e.target.value).toLocaleDateString());
        }}
      />
    );
  }
  if (schema.meta.role === 'datetime') {
    return (
      <input
        type="datetime-local"
        value={value ? value.replaceAll('/', '-') : ''}
        disabled={disabled}
        onChange={(e) => {
          onChange(new Date(e.target.value).toLocaleString());
        }}
      />
    );
  }
  if (schema.meta.role === 'secret') {
    return (
      <input
        type="password"
        className="textbox"
        value={value || ''}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    );
  }
  if (['url', 'link'].includes(schema.meta.role || '')) {
    return (
      <input
        type="url"
        className="textbox"
        value={value || ''}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    );
  }
  return (
    <>
      {Prefix && isNullable(value) && <Prefix />}
      <input
        type="text"
        className="textbox"
        value={value || ''}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      {Suffix && <Suffix />}
    </>
  );
}
