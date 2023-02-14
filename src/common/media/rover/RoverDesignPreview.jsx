import React, {Component} from 'react';
import PropTypes from 'prop-types'
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import ImageModalSelect from "../image/ImageModalSelect";

const CanvasField = styled.canvas`
    ${AppStyles.block}    
    background-color: lightcoral;
    margin: 0.5rem auto;
`;

export class RoverDesignPreview extends Component {

   static propTypes = {
      image_id: PropTypes.string.isRequired,
      aspect_ratio: PropTypes.number.isRequired,
      step_values: PropTypes.object.isRequired,
      preview_height_px: PropTypes.number.isRequired,
   }

   state = {
      canvas_ref: React.createRef(),
      image_data: {},
      image_bitmap: null
   };

   componentDidMount() {
      const {image_id} = this.props;
      const image_data = ImageModalSelect.get_image_data(image_id);
      if (image_data.filename) {
         this.setState({image_data: image_data});
         this.load_image(image_data.secure_url)
      }
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (canvas) {
         const ctx = canvas.getContext('2d');
         this.setState({ctx: ctx,});
      }
   }

   load_image = (url) => {
      fetch(url)
         .then(response => response.blob())
         .then((blob) => {
            createImageBitmap(blob).then(result => {
               this.setState({image_bitmap: result})
            }, (err) => {
               console.log("err", err)
            });
         });
   }

   render() {
      const {canvas_ref, image_data, ctx, image_bitmap} = this.state;
      const {aspect_ratio, step_values, preview_height_px} = this.props;
      let height_px = preview_height_px;
      let width_px = height_px * aspect_ratio;
      const canvas_style = {
         width: `${width_px}px`,
         height: `${height_px}px`
      }
      if (image_bitmap && ctx) {
         console.log("step_values", step_values);
         const center_x = image_data.width * step_values.center_x;
         const center_y = image_data.height * step_values.center_y;
         const width = image_data.width * step_values.width;
         const height = width / aspect_ratio;
         ctx.drawImage(
            image_bitmap, //image,
            center_x - width / 2, // sx,
            center_y - height / 2, // sy,
            width, // sWidth,
            height, // sHeight,
            0, // dx,
            0, // dy,
            width_px, // dWidth,
            height_px // dHeight
         );
      }
      const canvas = <CanvasField
         ref={canvas_ref}
         style={canvas_style}
         width={`${width_px}px`}
         height={`${height_px}px`}/>
      return canvas;
   }
}

export default RoverDesignPreview;
