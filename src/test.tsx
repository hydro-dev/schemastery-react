import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { SchemaForm, Schema } from './index';

const container = document.getElementById('root');
const root = createRoot(container as HTMLDivElement);

enum Intents { FOO = 1, BAR = 2, QUX = 4 }

const testSchema = Schema.object({
  num: Schema.number(),
  slider: Schema.number().role('slider')
    .min(0).max(100).step(1).default(30),
  enable: Schema.boolean(),
  text: Schema.string(),
  secret: Schema.string().role('secret')
    .default('114514'),
  link: Schema.string().role('link')
    .default('https://github.com'),
  area: Schema.string().role('textarea'),
  intents: Schema.bitset(Intents)
    .default(Intents.FOO | Intents.QUX),
  datetime: Schema.string().role('datetime'),
  date: Schema.string().role('date'),
  time: Schema.string().role('time'),
  valueUnion: Schema.union(['foo', 'bar', 'qux']),
  valueUnion2: Schema.union([
    Schema.const('foo').description('选项 1'),
    Schema.const('bar').description('选项 2'),
    Schema.const('baz').description('选项 3'),
  ]).role('radio'),
  valueUnion3: Schema.union([
    Schema.const(null).description('unset'),
    Schema.number().description('number'),
    Schema.string().description('string'),
    Schema.const(true).description('true'),
    Schema.const(false).description('false'),
    Schema.object({
      foo: Schema.string(),
      bar: Schema.number(),
    }).description('object'),
  ]),
  FileSetting: Schema.intersect([
    Schema.object({
      type: Schema.union([
        Schema.const('file').description('local file provider').required(),
        Schema.const('s3').description('s3 provider').required(),
      ] as const).required().description('provider type'),
    }).description('setting_file'),
    Schema.union([
      Schema.object({
        type: Schema.const('file').required(),
        path: Schema.string().default('/data/file/hydro').description('Storage path').required(),
      }),
      Schema.object({
        type: Schema.const('s3').required(),
        endPoint: Schema.string().required(),
        accessKey: Schema.string().required().description('access key'),
        secretKey: Schema.string().required().description('secret key').role('secret'),
        bucket: Schema.string().default('hydro').required(),
        region: Schema.string().default('us-east-1').required(),
        pathStyle: Schema.boolean().default(true).required(),
        endPointForUser: Schema.string().default('/fs/').required(),
        endPointForJudge: Schema.string().default('/fs/').required(),
      }),
    ] as const),
  ] as const).description('File Setting'),
}).description('test_form');

function Test() {
  const [input, updateInput] = useState({});
  const [output, updateOutput] = useState({});
  const schema = testSchema;

  useEffect(() => {
    try {
      updateOutput(schema(input));
    } catch (e) {
      updateOutput({ message: 'invalid input' });
    }
  }, [input]);
  return (
    <div>
      <SchemaForm schema={schema} onChange={(e) => updateInput(e)} />
      <h2>Input</h2>
      <p>{JSON.stringify(input)}</p>
      <h2>Output</h2>
      <p>{JSON.stringify(output)}</p>
    </div>
  );
}

root.render(<Test />);
