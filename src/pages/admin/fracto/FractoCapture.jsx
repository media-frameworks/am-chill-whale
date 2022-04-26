import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../app/AppImports";
import {PHI} from "../../../common/math/constants";

import FractoRender from "./FractoRender";
import FractoUtil from "./FractoUtil";

const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";
const RESULT_WIDTH = 2000;
const RESULT_ASPECT_RATIO = 1 / PHI;

const CaptureButton = styled(AppStyles.Block)`
   ${AppStyles.pointer}
   color: white;
   margin: 0.5rem 1rem;
   padding: 0.5rem 1rem;
   background-color: ${AppColors.HSL_DEEP_BLUE};
   border-radius: 0.25rem;
`;

const CanvasField = styled.canvas`
    margin: 0.5rem auto;
`;

export class FractoCapture extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.625}
      },
      aspect_ratio: RESULT_ASPECT_RATIO,
      canvas_ref: React.createRef(),
      ctx: null
   };

   componentDidMount() {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (canvas) {
         const ctx = canvas.getContext('2d');
         this.setState({ctx: ctx});
      }
   }

   update_values = (new_values) => {
      this.setState({fracto_values: new_values});
   }

   fill_canvas = (data) => {
      const {ctx} = this.state;
      const {width_px} = this.props;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width_px, width_px);
      for (let img_x = 0; img_x < data.length; img_x++ ) {
         const column = data[img_x];
         for (let img_y = 0; img_y < column.length; img_y++ ) {
            const pixel = column[img_y];
            if (!pixel[1]) {
               ctx.fillStyle = 'white';
            }
            else {
               ctx.fillStyle = FractoUtil.fracto_pattern_color(pixel[0], pixel[1])
            }
            ctx.fillRect(img_x, column.length - img_y, 1, 1);
         }
      }
   }

   capture_image = () => {
      const {fracto_values, aspect_ratio} = this.state;

      const url = `${FRACTO_PHP_URL_BASE}/generate_image.php?span=${fracto_values.scope}&focal_x=${fracto_values.focal_point.x}&focal_y=${fracto_values.focal_point.y}&aspect_ratio=${aspect_ratio}&width_px=${RESULT_WIDTH}`;
      console.log("url", url);

      const that = this;
      fetch(url, {
         headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
         },
         method: 'GET',
         mode: 'cors'
      }).then(function (response) {
         if (response.body) {
            return response.json();
         }
         return ["fail"];
      }).then(function (json) {
         console.log("capture_image result", json);
         that.fill_canvas(json);
      });
   }

   render() {
      const {fracto_values, aspect_ratio, canvas_ref} = this.state;
      const {width_px} = this.props;
      const result_width = RESULT_WIDTH;
      const result_height = RESULT_WIDTH * RESULT_ASPECT_RATIO;
      const canvas_style = {
         width: `${result_width}px`,
         height: `${result_height}px`
      }
      return [
         <AppStyles.InlineBlock>
            <FractoRender
               width_px={width_px / PHI}
               aspect_ratio={aspect_ratio}
               initial_params={fracto_values}
               on_param_change={values => this.update_values(values)}/>
         </AppStyles.InlineBlock>,
         <AppStyles.InlineBlock>
            <CaptureButton onClick={e => this.capture_image()}>Capture</CaptureButton>
         </AppStyles.InlineBlock>,
         <AppStyles.Block>
            <CanvasField
               ref={canvas_ref}
               style={canvas_style}
               width={`${result_width}px`}
               height={`${result_height}px`}/>
         </AppStyles.Block>
      ]

   }

}

export default FractoCapture;
