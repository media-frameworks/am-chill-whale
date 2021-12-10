import React from 'react';
import ReactDOM from 'react-dom';
import AppRouting from './AppRouting';

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json';

TimeAgo.addDefaultLocale(en);

ReactDOM.render(
  <React.StrictMode>
      <AppRouting />
  </React.StrictMode>,
  document.getElementById('root')
);
