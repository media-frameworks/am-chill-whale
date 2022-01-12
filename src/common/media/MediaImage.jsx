import {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles} from "../../app/AppImports";
import ImageModalSelect from "./image/ImageModalSelect";
import ImageRender from "./image/ImageRender";

const MEDIA_IMAGE_EDIT_ENTRY = 10001;

const PromptText = styled.span`
   ${AppStyles.pointer};
   color: #aaaaaa;   
   font-size: 1rem;
   font-style: italic;
   padding: 0 0.25rem;
`;

export class MediaImage extends Component {

   static propTypes = {
      image_id: PropTypes.string.isRequired,
      caption: PropTypes.string.isRequired,
      on_update_props: PropTypes.func.isRequired,
   }

   static defaultProps = {
      image_id: '',
      caption: '',
   }

   state = {
      in_modal_select: false,
   };

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "go to cloudarity", code: MEDIA_IMAGE_EDIT_ENTRY},
      ];
   }

   static on_menu_select = (code, segment_data) => {
      console.log("on_menu_select", code)
      switch (code) {
         case MEDIA_IMAGE_EDIT_ENTRY:
            console.log("MEDIA_IMAGE_EDIT_ENTRY")
            return true;
         default:
            return false;
      }
   }

   select_image = (image_data) => {
      const {on_update_props} = this.props;
      this.setState({in_modal_select: false});
      on_update_props({image_id: image_data.filename});
   }

   render() {
      const {in_modal_select} = this.state;
      const {image_id} = this.props;
      const have_image = image_id !== '';
      const image_select_prompt = have_image ? '' : <PromptText
         onClick={e => this.setState({in_modal_select: true})}>select image</PromptText>;
      const select_modal = !in_modal_select ? '' : <ImageModalSelect
         key={`${image_id}_modal_select`}
         response={image_data => this.select_image(image_data)} />
      const image = !image_id ? '' : <ImageRender
         key={`${image_id}_image_render`}
         image_id={image_id} width_px={150} />
      return [
         image_select_prompt,
         select_modal,
         image
      ];
   }
}

export default MediaImage;
