import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";
//
// import {AppStyles} from "app/AppImports";

import FractoLayeredCanvas from "../FractoLayeredCanvas";
import {DEFAULT_FRACTO_VALUES} from "../FractoUtil";

export const FRACTO_RENDER_WIDTH_PX = 512;

// const CenteredBlock = styled(AppStyles.Block)`
//    ${AppStyles.centered}
//    margin: 0.5rem 1rem 0;
// `;

export class TestHarness extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      fracto_values: DEFAULT_FRACTO_VALUES
   }

   componentDidMount() {
   }

   render() {
      const {fracto_values} = this.state;
      const {width_px} = this.props;

      return [
         <FractoLayeredCanvas
            width_px={width_px}
            aspect_ratio={0.618}
            focal_point={fracto_values.focal_point}
            scope={fracto_values.scope}
            level={4}
         />
      ];
   }

}

export default TestHarness;
