import {Component} from 'react';
import PropTypes from 'prop-types'
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";

const MEDIA_IMAGE_ROVER_DESIGN = 10001;

const PromptText = styled.span`
   ${AppStyles.pointer};
   color: #aaaaaa;   
   font-size: 1rem;
   font-style: italic;
   padding: 0 0.25rem;
`;

export class ImageRover extends Component {

   static propTypes = {
      image_id: PropTypes.string.isRequired,
      rover_path: PropTypes.array.isRequired,
      on_update_props: PropTypes.func.isRequired,
   }

   static defaultProps = {
      image_id: '',
      rover_path: [],
   }

   state = {
      in_rover_design: false,
      image_data: {}
   };

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "design route", code: MEDIA_IMAGE_ROVER_DESIGN},
      ];
   }

   static on_menu_select = (code, segment_data) => {
      console.log("on_menu_select", code)
      switch (code) {
         case MEDIA_IMAGE_ROVER_DESIGN:
            console.log("MEDIA_IMAGE_ROVER_DESIGN")
            return true;
         default:
            return false;
      }
   }

   render() {
      const {in_rover_design} = this.state;
      const {image_id} = this.props;
      const prompt = image_id && in_rover_design ? '' : <PromptText
         key={"rover_prompt"}
         onClick={e => this.setState({in_rover_design: true})}>
         {"configure this"}
      </PromptText>
      return [prompt];
   }
}

export default ImageRover;
