/* eslint-disable react/no-danger */
import React from 'react';
import MarkdownIt from 'markdown-it';

export default function SchemaMarkDown(
  { source, inline, tag }: {
    source:string;
    inline?:boolean;
    tag?:any;
  }) {
  const html = inline ? MarkdownIt().renderInline(source) : MarkdownIt().render(source);
  if (tag) return React.createElement(tag, { className: 'k-markdown', dangerouslySetInnerHTML: { __html: html } });
  if (inline) return (<span className="k-markdown" dangerouslySetInnerHTML={{ __html: html }} />);
  return (<div className="k-markdown" dangerouslySetInnerHTML={{ __html: html }} />);
}
