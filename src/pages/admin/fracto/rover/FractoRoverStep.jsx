import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles} from "app/AppImports";

import FractoValues from "../FractoValues";
import FractoImage from "../FractoImage";

const StepWrapper = styled(AppStyles.InlineBlock)`
   border: 0.1rem solid #666666;
   border-radius: 0.25rem;
   width: 28rem;
   padding: 0.125rem 0.25rem;
`;

const PreviewWrapper = styled(AppStyles.InlineBlock)`
   margin-left: 1rem;
   border: 0.1rem solid #666666;
   border-radius: 0.25rem;
`;

export class FractoRoverStep extends Component {

   static propTypes = {
      fracto_values: PropTypes.object.isRequired,
      aspect_ratio: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
      selected: PropTypes.bool.isRequired,
      on_click: PropTypes.func.isRequired,
   }

   render() {
      const {fracto_values, aspect_ratio, width_px, selected, on_click} = this.props;
      const wrapper_style = {backgroundColor: !selected ? "#eeeeee" : "white"}
      return [
         <StepWrapper
            style={wrapper_style}
            onClick={e => on_click()}>
            <FractoValues fracto_values={fracto_values} width_px={width_px}/>
         </StepWrapper>,
         <PreviewWrapper
            onClick={e => on_click()}>
            <FractoImage
               width_px={100}
               aspect_ratio={aspect_ratio}
               focal_point={fracto_values.focal_point}
               scope={fracto_values.scope}/>
         </PreviewWrapper>
      ]
   }
}

export default FractoRoverStep;
