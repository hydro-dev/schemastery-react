import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

import ElementPlus from 'element-plus';
import form from 'schemastery-vue';
import { createI18n } from 'vue-i18n';
import { createElement } from 'react';
import Schema from 'schemastery';
import { applyPureReactInVue, applyVueInReact, createReactMissVue } from 'veaury';
import Dynamic from './dynamic.vue';
import { reactive } from 'vue';

const KForm = applyVueInReact(form.Form) as any;

export type MarkdownRenderer = (props: { source: string }) => React.ReactNode;

form.extensions.add({
  type: 'any',
  role: 'dynamic',
  component: Dynamic,
});

interface AppProps {
  schema: Schema<any>,
  initial: any,
  value: any,
  onChange: (value: any) => void,
  dynamic: Record<string, any>,
}

export function createSchemasteryReact({
  Markdown, setupVue, locale,
}: {
  Markdown: MarkdownRenderer,
  setupVue?: (app: any) => void,
  locale?: string,
}) {
  const storeDynamic = reactive({ dynamic: {} });

  const [, ReactMissVue] = createReactMissVue({
    useVueInjection() {
      return {
        storeDynamic,
      };
    },
    beforeVueAppMount(app: any) {
      app.use(form);
      app.use(createI18n({
        legacy: false,
        locale: locale || 'en-US',
      }));
      app.use(ElementPlus);
      app.component('k-markdown', applyPureReactInVue(Markdown));
      setupVue?.(app);
    },
  });

  function App({
    schema, initial, value, onChange, dynamic, ...props
  }: AppProps & Partial<React.HTMLAttributes<HTMLDivElement>>) {
    storeDynamic.dynamic = dynamic;
    return createElement(ReactMissVue, {}, createElement(KForm, { ...props, schema, initial, 'v-model': [value, onChange] }));
  }

  return App;
}
