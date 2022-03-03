import {Component} from 'react';
import PropTypes from 'prop-types'
// import styled from "styled-components";

// import {AppStyles} from "../../../app/AppImports";
import ImageModalSelect from "./ImageModalSelect";

export class ImageRender extends Component {

   static propTypes = {
      image_id: PropTypes.string.isRequired,
      width_px: PropTypes.number.isRequired,
      image_ref: PropTypes.oneOfType([
         PropTypes.func,
         PropTypes.shape({current: PropTypes.instanceOf(Element)})
      ]).isRequired,
   }

   state = {
      image_data: {}
   };

   componentDidMount() {
      const {image_id} = this.props;
      const image_data = ImageModalSelect.get_image_data(image_id);
      this.setState({image_data: image_data});
   }

   render() {
      const {image_data} = this.state;
      const {width_px, image_ref} = this.props;
      if (!image_data || !image_data.secure_url) {
         return []
      }
      return <img
         ref={image_ref}
         key={`render_${image_data.filename}`}
         src={image_data.secure_url}
         alt={"am-chill-whale all rights reserved"}
         width={`${width_px}px`}/>
   }
}

export default ImageRender;
