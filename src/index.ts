import 'element-plus/dist/index.css';

import ElementPlus from 'element-plus';
import form from 'schemastery-vue';
import { createI18n } from 'vue-i18n';
import React from 'react';
import Schema from 'schemastery';
import { applyPureReactInVue, applyVueInReact, createReactMissVue } from 'veaury';

const KForm = applyVueInReact(form.Form) as any;

export type MarkdownRenderer = (source: string) => React.ReactNode;

export function createSchemasteryReact({
  Markdown, setupVue, locale,
}: {
  Markdown: MarkdownRenderer, setupVue(app: any): void, locale: string
}) {
  const [, ReactMissVue] = createReactMissVue({
    useVueInjection() {
      return {};
    },
    beforeVueAppMount(app: any) {
      app.use(form);
      app.use(createI18n({
        legacy: false,
        locale: locale || 'en-US',
      }));
      app.use(ElementPlus);
      app.component('k-markdown', applyPureReactInVue(Markdown));
      setupVue(app);
    },
  });

  function App({
    schema, initial, value, onChange, ...props
  }: { schema: Schema<any>, initial: any, value: any, onChange: (value: any) => void } & Partial<React.HTMLAttributes<HTMLDivElement>>) {
    return React.createElement(ReactMissVue, {}, React.createElement(KForm, { ...props, schema, initial, 'v-model': [value, onChange] }));
  }

  return App;
}
