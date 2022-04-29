import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import FractoUtil from "../fracto/FractoUtil";

const CanvasField = styled.canvas`
    margin: 0 auto;
`;

export class FractoneInstrument extends Component {

   static propTypes = {
      instrument_width: PropTypes.number.isRequired,
      instrument_height: PropTypes.number.isRequired,
      instrument_data: PropTypes.array.isRequired,
   }

   state = {
      canvas_ref: React.createRef(),
      ctx: null,
      bounds_rect: {},
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (canvas) {
         const ctx = canvas.getContext('2d');
         const bounds_rect = canvas.getBoundingClientRect();
         this.setState({ctx: ctx, bounds_rect: bounds_rect});
         this.fill_canvas(ctx)
      }
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {ctx} = this.state;
      const {instrument_data} = this.props;
      if (prevProps.instrument_data !== instrument_data) {
         this.fill_canvas(ctx);
         this.forceUpdate();
      }
   }

   fill_canvas = (ctx) => {
      const {instrument_width, instrument_height, instrument_data} = this.props;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, instrument_width, instrument_height);
      const width = Object.keys(instrument_data).length;
      for (let img_x = 0; img_x < width; img_x++) {
         const column = instrument_data[img_x];
         for (let img_y = 0; img_y < column.length; img_y++) {
            const pixel = column[img_y];
            if (!pixel) {
               console.log("no pixel")
               ctx.fillStyle = 'white';
            } else {
               ctx.fillStyle = FractoUtil.fracto_pattern_color(pixel[0], pixel[1])
            }
            ctx.fillRect(img_x, instrument_height - img_y, 1, 1);
         }
      }
   }

   render() {
      const {canvas_ref} = this.state;
      const {instrument_width, instrument_height} = this.props;
      const canvas_style = {
         width: `${instrument_width}px`,
         height: `${instrument_height}px`
      }
      return <CanvasField
         ref={canvas_ref}
         style={canvas_style}
         width={`${instrument_width}px`}
         height={`${instrument_height}px`}
      />
   }

}

export default FractoneInstrument;
