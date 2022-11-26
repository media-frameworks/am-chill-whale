import React, {Component} from 'react';
import {createBrowserHistory} from "history";

import {PageFracto} from "./pages/PageImports";

const FRACTO_ROUTING =
   {
      segment: 'fracto',
      path: '/fracto',
      component: <PageFracto/>,
   };

const history = createBrowserHistory()

export class AppRouting extends Component {

   process_path = (segments, branch) => {
      return <PageFracto/>
   }

   render() {
      const segments = history.location.pathname.split('/');
      segments.shift();
      return this.process_path(segments, FRACTO_ROUTING);
   }
}

export default AppRouting;