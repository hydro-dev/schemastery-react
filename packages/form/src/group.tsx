import React, { useState } from 'react';
import { getFallback, isObjectSchema, Schema } from './utils';
import SchemaItem from './item';
import useWatch from './useWatch';
import SchemaMarkDown from './markdown';
import SchemaForm from './schema';

export default function SchemaGroup({
  schema = {} as Schema, value, initial, prefix, disabled, instant, signal, onChange, onSignal,
}: {
  schema: Schema;
  value: any;
  initial: any;
  prefix: String;
  disabled: boolean;
  instant: boolean;
  signal: boolean;
  onChange: (value: object) => void;
  onSignal: (signal: boolean) => void;
}) {
  const [entries, updateEnties] = useState<any[]>([]);
  let stop;

  function doWatch() {
    return useWatch(entries, () => {
      if (schema.type === 'dict') {
        const result = {};
        for (const [key, val] of entries) {
          if (key in result) return;
          result[key] = val;
        }
        onChange(result);
      } else {
        onChange(entries.map(([, val]) => val));
      }
    }, { deep: true });
  }

  function handleCommand(action: string, index?: number) {
    // TODO
    if (action === 'down') {
      if (schema.type === 'dict') {
        entries.splice(index + 1, 0, ...entries.splice(index, 1));
      } else {
        const temp = entries[index][1];
        entries[index][1] = entries[index + 1][1];
        entries[index + 1][1] = temp;
      }
    } else if (action === 'up') {
      if (schema.type === 'dict') {
        entries.splice(index - 1, 0, ...entries.splice(index, 1));
      } else {
        const temp = entries[index][1];
        entries[index][1] = entries[index - 1][1];
        entries[index - 1][1] = temp;
      }
    } else if (action === 'delete') {
      entries.splice(index, 1);
    } else if (action === 'add') {
      entries.push(['', getFallback(schema.inner, true)]);
    }
  }

  useWatch(() => value, (val) => {
    stop?.();
    updateEnties(Object.entries(val || {}));
    stop = doWatch();
  }, { immediate: true, deep: true });

  useWatch(() => signal, (val) => {
    // FIXME: don't need it
    if (!val) return;
    handleCommand('add');
    onSignal(false);
  });

  return (
    <>
      {entries.map((item, key) => {
        if (isObjectSchema(schema.inner)) {
          (
            <>
              <SchemaItem
                invaild={entries.filter((e) => e[0] === key).length > 1}
                Header={
                  schema.type === 'array'
                    ? (
                      <>
                        <span className="prefix">{prefix.slice(0, -1)}</span>
                        <span className="index">{key}</span>
                      </>
                    )
                    : (
                      <>
                        <span className="prefix">{prefix}</span>
                        <input value={entries[key][0]} />
                      </>
                    )
                }
                Description={
                  <SchemaMarkDown inline source={schema.inner.meta.description} />
                }
              /* Menu */
              />
              <div className="k-schema-group">
                <SchemaForm
                  value={entries[key][1]}
                  initial={initial?.[key]}
                  schema={{ ...schema.inner, meta: { ...schema.inner.meta, description: '' } } as Schema}
                  disabled={disabled}
                  instant={instant}
                  onChange={(val) => {
                    entries[key][1] = val;
                  }}
                  prefix={schema.type === 'array' ? `${prefix.slice(0, -1)}[${key}].` : `${prefix}${key}.`}
                >
                  <span className="prefix">{prefix}</span>
                  <span>{key}</span>
                </SchemaForm>
              </div>
            </>);
        } else {
          return (
            <SchemaForm
              value={entries[key][1]}
              invalid={entries.filter((e) => e[0] === key).length > 1}
              initial={initial?.[key]}
              schema={schema.inner}
              disabled={disabled}
              instant={instant}
              onChange={(val) => {
                entries[key][1] = val;
              }}
              onCommand={handleCommand}
              prefix={schema.type === 'array' ? `${prefix.slice(0, -1)}[${key}].` : `${prefix}${key}.`}
            >
              <span className="prefix">{prefix}</span>
              <span>{key}</span>
            </SchemaForm>
          );
        }
      })}
    </>
  );
}
