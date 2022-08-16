import React, { useEffect, useState } from 'react';
import { clone, isNullable, valueMap } from 'cosmokit';
import SchemaItem from './item';
import SchemaGroup from './group';
import SchemaPrimitive from './primitive';
import SchemaMarkDown from './markdown';
import BitCheckBox from './bit';
import './assets/schema.scss';
import './assets/form.css';
import {
  deepEqual, getChoices, getFallback, Schema, validate,
} from './utils';

function optional(schema: Schema): Schema {
  if (schema.type === 'object') {
    return Schema.object(
      valueMap(schema.dict!, (item) => (item.type === 'const' ? item : item.required(false))),
    );
  }
  if (schema.type === 'intersect') {
    return Schema.intersect(schema.list.map(optional));
  }
  return schema;
}

export default function SchemaForm({
  schema = {} as Schema, initial, value, instant,
  invalid, disabled, prefix = '', onChange,
  onCommand, children,
}: {
  schema: Schema;
  initial?: any;
  value?: any;
  instant?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  prefix?: String
  onChange: Function;
  onCommand?: Function;
  children?: any;
}): JSX.Element {
  const [choices, updateChoices] = useState<Schema[]>([]);
  const [cache, updateCache] = useState<any[]>([]);
  const [_active, _updateActive] = useState(JSON.stringify(schema));
  const active = new Schema(JSON.parse(_active));
  const updateActive = (s) => { _updateActive(JSON.stringify(s)); };

  const isHidden = (!schema || schema.meta?.hidden) ?? false;
  const isPrimitive = ['string', 'number', 'boolean'].includes(active.type)
    && active.meta.role !== 'textarea';
  const isComposite = ['array', 'dict'].includes(active.type) && validate(active.inner);
  const [config, updateConfig] = useState<any>(['string', 'number', 'boolean', 'bitset', 'union'].includes(active.type) ? null : {});
  const [signal, updateSignal] = useState(false);
  const changed = !instant && !deepEqual(value, initial);
  const required = schema.meta?.required
    && isNullable(schema.meta.default ?? '')
    && isNullable(value);
  const handleCommand = (action: string) => {
    if (action === 'discard') {
      onChange(clone(initial));
    } else if (action === 'default') {
      onChange(undefined);
    } else {
      onCommand(action);
    }
  };

  useEffect(() => {
    if (!schema.list) {
      updateChoices([]);
      return;
    }
    updateChoices(getChoices(schema));
    updateCache(getChoices(schema).map((item) => {
      if (item.type === 'const') return item.value;
      return getFallback(item, true);
    }));
  }, [schema]);

  useEffect(() => {
    updateConfig(value ?? getFallback(schema));
    updateActive(schema);
    for (const item of choices) {
      try {
        updateConfig(optional(item)(config));
        updateActive(item);
        break;
      } catch { }
    }
  }, [JSON.stringify(value)]);

  const [firstCheckChange, updateFirstCheckChange] = useState(true);
  useEffect(() => {
    if (firstCheckChange) {
      updateFirstCheckChange(false);
      return;
    }
    if (!schema) return;
    if (initial === undefined && deepEqual(config, schema.meta.default)) {
      onChange(undefined);
    } else {
      onChange(config);
    }
  }, [JSON.stringify(config)]);

  if (isHidden || schema.type === 'const') return <div />;
  if (schema.type === 'object') {
    return (
      <>
        {schema.meta?.description && (<h2 className="k-schema-header">{schema.meta.description}</h2>)}
        {Object.keys(schema.dict || []).map((item) => (
          <SchemaForm
            key={item}
            value={config[item]}
            schema={schema.dict[item]}
            initial={initial?.[item]}
            instant={instant}
            disabled={disabled}
            prefix={`${prefix}${item}.`}
            onChange={
              (val) => updateConfig({ ...config, [item]: val })
            }
          >
            <span className="prefix">{prefix}</span>
            <span>{item}</span>
          </SchemaForm>
        ))}
      </>
    );
  }
  if (schema.type === 'intersect' || (schema.type === 'union' && choices.length === 1)) {
    return (
      <>
        {choices.map((item) => (
          <SchemaForm
            value={config}
            initial={initial}
            schema={{ ...item, meta: { ...schema.meta, ...item.meta } } as Schema}
            instant={instant}
            disabled={disabled}
            prefix={prefix}
            onChange={(val) => {
              console.log(val);
              updateConfig({ ...config, ...val });
            }}
          >
            {children}
          </SchemaForm>
        ),
        )}
      </>
    );
  }
  if (prefix || (!isComposite && schema?.type !== 'union')) {
    return (
      <SchemaItem
        disabled={disabled}
        Header={children}
        Description={
          schema?.meta?.description
            ? <SchemaMarkDown inline source={schema?.meta?.description || ''} />
            : null
        }
        Right={(
          <>
            {schema.type === 'union' && schema.meta.role !== 'radio' && (
              <select
                value={active !== schema ? active.meta.description || active.value : null}
                onChange={(e) => {
                  if (active === choices[+e.target.value]) return;
                  updateConfig(cache[+e.target.value]);
                  updateActive(choices[+e.target.value]);
                }}
              >
                {choices.map((item, index) =>
                  (<option key={item.meta.description || item.value} value={index}>{item.meta.description || item.value}</option>),
                )}
              </select>
            )}
            {isPrimitive ? <SchemaPrimitive value={config} schema={active} disabled={disabled} onChange={(e) => updateConfig(e)} />
              : isComposite ? <button type="button" onClick={() => updateSignal(true)} disabled={disabled}>添加项</button>
                : schema.type === 'tuple' && active.list.map((item, index) =>
                  <SchemaPrimitive value={config[index]} schema={item} disabled={disabled} onChange={(e) => updateConfig(e)} />,
                )}
          </>
        )}
      >
        {(schema.type === 'union' && schema.meta.role === 'radio') ? (
          <ul className="bottom">
            {choices.map((item) => (
              <li key={item.value}>
                <input
                  type="radio"
                  className="radiobox"
                  name="config"
                  value={item.value}
                  checked={config === item.value}
                  onChange={() => updateConfig(item.value)}
                />
                {item.meta.description || item.value}
              </li>
            ))}
          </ul>
        ) : schema.type === 'bitset' ? (
          <ul className="bottom">
            {Object.keys(schema.bits).map((val) => (
              <li key={val}>
                <BitCheckBox
                  model={config}
                  disabled={disabled}
                  label={val}
                  value={schema.bits[val]}
                  onChange={(e) => updateConfig(e)}
                />
              </li>
            ))}
          </ul>
        ) : schema.type === 'string' && schema.meta.role === 'textarea' && (
          <textarea
            className="textbot"
            value={config || ''}
            disabled={disabled}
            onChange={(e) => updateConfig(e.target.value)}
          />
        )}
      </SchemaItem>
    );
  }

  if (isHidden || (schema.type === 'union' && choices.length === 1)) return <div />;
  if (isComposite) {
    const schemaGroup = (
      <SchemaGroup
        signal={signal}
        value={config}
        schema={active}
        prefix={prefix}
        disabled={disabled}
        instant={instant}
        initial={initial}
        onSignal={(val) => updateSignal(val)}
        onChange={(val) => updateConfig(val)}
      />
    );
    return prefix ? (
      <div className="k-schema-group">
        {schemaGroup}
      </div>
    ) : (
      <>
        <h2 className="k-schema-header">
          {schema.meta.description || '配置列表'}
          <button type="button" onClick={() => updateSignal(true)} disabled={disabled}>
            添加项
          </button>
        </h2>
        {schemaGroup}
      </>
    );
  }
  if (
    schema?.type === 'union'
    && choices.length > 1
    && ['object', 'intersect'].includes(active?.type || '')
  ) {
    return (
      <SchemaForm
        value={config}
        initial={initial}
        schema={active}
        instant={instant}
        disabled={disabled}
        prefix={prefix}
        onChange={(val) => updateConfig(val)}
      />
    );
  }
  return <div />;
}
