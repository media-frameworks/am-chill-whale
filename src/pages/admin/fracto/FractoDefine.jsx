import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import {FractoCalc} from "./FractoCalc";

const SEED_X = -2.0
const SEED_Y = 4.0
const FULL_WIDTH = 4.0

export class FractoDefine extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {};

   render() {
      return <AppStyles.Block>
         <FractoCalc
            init_code={"0,0"}
            seed_x={SEED_X}
            seed_y={SEED_Y}
            frame_width={FULL_WIDTH}
            level_depth={11}
            max_iterations={1000000}
         />
      </AppStyles.Block>
   }

}

export default FractoDefine;
