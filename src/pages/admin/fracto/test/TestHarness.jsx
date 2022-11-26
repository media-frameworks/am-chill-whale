import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";

import FractoActiveImage from "../FractoActiveImage";
import {DEFAULT_FRACTO_VALUES} from "../FractoUtil";

export const FRACTO_RENDER_WIDTH_PX = 512;

const RenderWrapper = styled(AppStyles.InlineBlock)`
   margin: 0 0.5rem 1rem 1rem;
   border: 0.125rem solid #aaaaaa;
   border-radius: 0.25rem;
   height: ${FRACTO_RENDER_WIDTH_PX}px;
`;

export class TestHarness extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
   }

   componentDidMount() {
   }

   render() {
      const fracto_render = <RenderWrapper>
         <FractoActiveImage
            width_px={FRACTO_RENDER_WIDTH_PX}
            aspect_ratio={1.0}
            scope={DEFAULT_FRACTO_VALUES.scope}
         />
      </RenderWrapper>

      return [
         fracto_render
      ];
   }

}

export default TestHarness;
