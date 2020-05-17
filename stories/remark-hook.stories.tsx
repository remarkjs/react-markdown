import { useEffect } from 'react';
import { text } from '@storybook/addon-knobs';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { useRemark } from '../src';

export default {
  title: 'Remark Hook',
  component: useRemark,
};

export const Default = () => {
  const [reactContent, setMarkdownSource] = useRemark();
  const markdownSource = text('markdown', '# header\n* list');

  useEffect(() => {
    setMarkdownSource(markdownSource);
  }, [markdownSource]);

  return reactContent;
};

export const Math = () => {
  const [reactContent, setMarkdownSource] = useRemark({
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  });
  const markdownSource = text(
    'markdown',
    `Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

  $$
  L = \\frac{1}{2} \\rho v^2 S C_L
  $$`
  );

  useEffect(() => {
    setMarkdownSource(markdownSource);
  }, [markdownSource]);

  return reactContent;
};
