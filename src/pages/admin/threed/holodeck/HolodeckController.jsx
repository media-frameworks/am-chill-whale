import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import CoolSlider from "common/cool/CoolSlider";
import {PHI} from "common/math/constants";
import FractoRender from "pages/admin/fracto/FractoRender"

import {AppStyles} from "app/AppImports";

const CONTAINER_WIDTH_PX = 250;
const LABEL_WIDTH_PX = 20;
const SLIDER_WIDTH_PX = CONTAINER_WIDTH_PX - LABEL_WIDTH_PX;

const MIN_VALUE_X = -2.0;
const MAX_VALUE_X = 0.5;
const STEP_COUNT_X = 250;

const MIN_VALUE_Y = -1.25;
const MAX_VALUE_Y = 1.25;
const STEP_COUNT_Y = 250;

// const MIN_VALUE_Z = 0;
// const MAX_VALUE_Z = 2;
// const STEP_COUNT_Z = 200;

const MIN_VALUE_L = 0;
const MAX_VALUE_L = 12;
const STEP_COUNT_L = MAX_VALUE_L - MIN_VALUE_L;

const MIN_VALUE_I = -90;
const MAX_VALUE_I = 90;
const STEP_COUNT_I = 180;

const MIN_VALUE_V = -180;
const MAX_VALUE_V = 180;
const STEP_COUNT_V = 360;

const MIN_VALUE_M = 1;
const MAX_VALUE_M = 100;
const STEP_COUNT_M = (MAX_VALUE_M - MIN_VALUE_M);

const MIN_VALUE_D = 1;
const MAX_VALUE_D = 100;
const STEP_COUNT_D = MAX_VALUE_D - MIN_VALUE_D;

const SLIDER_DATA = [
   {
      label: "X", key: "focal_x", title: "focal point, x",
      min: MIN_VALUE_X, max: MAX_VALUE_X, step_count: STEP_COUNT_X,
   },
   {
      label: "Y", key: "focal_y", title: "focal point, y",
      min: MIN_VALUE_Y, max: MAX_VALUE_Y, step_count: STEP_COUNT_Y,
   },
   // {
   //    label: "Z", key: "focal_z", title: "focal point, z",
   //    min: MIN_VALUE_Z, max: MAX_VALUE_Z, step_count: STEP_COUNT_Z,
   // },
   {
      label: "L", key: "fracto_level", title: "fracto level",
      min: MIN_VALUE_L, max: MAX_VALUE_L, step_count: STEP_COUNT_L,
   },
   {
      label: "I", key: "inclination_deg", title: "inclination, degrees",
      min: MIN_VALUE_I, max: MAX_VALUE_I, step_count: STEP_COUNT_I,
   },
   {
      label: "V", key: "view_angle_deg", title: "view angle, degrees",
      min: MIN_VALUE_V, max: MAX_VALUE_V, step_count: STEP_COUNT_V,
   },
   {
      label: "M", key: "field_span_deg", title: "magnification",
      min: MIN_VALUE_M, max: MAX_VALUE_M, step_count: STEP_COUNT_M,
   },
   {
      label: "D", key: "field_depth", title: "depth of field",
      min: MIN_VALUE_D, max: MAX_VALUE_D, step_count: STEP_COUNT_D,
   },
];

const ControlsWrapper = styled(AppStyles.Block)`
   ${AppStyles.relative}
   margin: 0.25rem;
   border-radius: 0.125rem;
   padding: 0.125rem 0.125rem 0;
   width: ${CONTAINER_WIDTH_PX}px;
   background-color: #f8f8f8;
   z-index: 100;
   box-shadow: 0.25rem 0.25rem 1rem rgba(0,0,0,0.375);
`;

const LabelWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   width: ${LABEL_WIDTH_PX}px;
`;

const SliderWrapper = styled(AppStyles.InlineBlock)`
   width: ${SLIDER_WIDTH_PX}px;
`;

const EnhanceButton = styled(AppStyles.InlineBlock)`
   ${AppStyles.centered}
   background-color: #aaaaaa;
   float: right;
   border: 0.1rem solid #666666;
   border-radius: 0.25rem;
   color: white;
   font-size: 0.75rem;
   letter-spacing: 0.25rem;
   padding: 0.125rem 0.25rem;
   margin-bottom: 0.125rem;
   &:hover {
      ${AppStyles.uppercase}
      color: lightgreen;      
      font-weight: bold;
      text-shadow: 0.25rem 0.25rem 0.5rem rgba(0,0,0,0.75);
   }
`;

const FractoRenderWrapper = styled(AppStyles.InlineBlock)`
   margin: 0;
`;

export class HolodeckController extends Component {

   static propTypes = {
      controls: PropTypes.object.isRequired,
      on_update: PropTypes.func.isRequired,
      x_offset_px: PropTypes.number.isRequired,
   };

   state = {
      navigator_scope: 2.5
   }

   update_control_value = (key, value) => {
      const {controls, on_update} = this.props;
      controls[key] = value;
      on_update(controls);
   }

   update_navigator_values = (values) => {
      const {navigator_scope} = this.state;
      const {controls, on_update} = this.props;
      if (navigator_scope !== values.scope) {
         this.setState({navigator_scope: values.scope})
      }
      if (controls.focal_x !== values.focal_point.x || controls.focal_y !== values.focal_point.y) {
         controls.focal_x = values.focal_point.x;
         controls.focal_y = values.focal_point.y;
         controls.enhance = false;
         on_update(controls);
      }
   }

   enhance = () => {
      const {controls, on_update} = this.props;
      controls.enhance = true;
      on_update(controls);
   }

   render() {
      const {navigator_scope} = this.state;
      const {controls, x_offset_px} = this.props;
      const control_sliders = SLIDER_DATA.map(s => {
         return [
            <LabelWrapper title={s.title}>{s.label}:</LabelWrapper>,
            <SliderWrapper><CoolSlider
               value={controls[s.key]} min={s.min} max={s.max} step_count={s.step_count}
               on_change={value => this.update_control_value(s.key, value)}
            /></SliderWrapper>
         ]
      });
      const fracto_values = {
         scope: navigator_scope,
         focal_point: {
            x: controls.focal_x,
            y: controls.focal_y,
         }
      }
      return <ControlsWrapper style={{left: `${x_offset_px}px`}}>
         {[
            control_sliders,
            <FractoRenderWrapper>
               <FractoRender
                  width_px={CONTAINER_WIDTH_PX}
                  aspect_ratio={1 / PHI}
                  initial_params={fracto_values}
                  on_param_change={values => this.update_navigator_values(values)}
               />
               <EnhanceButton onClick={e => this.enhance()}>enhance</EnhanceButton>
            </FractoRenderWrapper>
         ]}
      </ControlsWrapper>
   }
}

export default HolodeckController;
