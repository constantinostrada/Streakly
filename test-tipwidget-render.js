import React from 'react';
import { renderToString } from 'react-dom/server';
import TipWidget from './src/app/components/TipWidget';

async function testRender() {
  const element = await TipWidget();
  const html = renderToString(element);
  console.log(html);
}

testRender();
