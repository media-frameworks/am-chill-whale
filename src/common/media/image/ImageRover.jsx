import {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import ImageModalSelect from "./ImageModalSelect";
import ImageRender from "./ImageRender";
import RoverDesign from "./rover/RoverDesign";

const MEDIA_IMAGE_ROVER_DESIGN = 10001;

const FIRST_STEP = {
   center_x: 0.5,
   center_y: 0.5,
   width: 0.95
};

const PromptText = styled.span`
   ${AppStyles.pointer};
   color: #aaaaaa;   
   font-size: 1rem;
   font-style: italic;
   padding: 0 0.25rem;
`;

export class ImageRover extends Component {

   static propTypes = {
      image_id: PropTypes.string,
      steps_list: PropTypes.array,
      aspect_ratio: PropTypes.number,
      on_update_props: PropTypes.func.isRequired,
   }

   static defaultProps = {
      image_id: '',
      steps_list: [],
      aspect_ratio: 16 / 9
   }

   state = {
      in_image_select: false,
      in_path_design: false,
      image_data: {}
   };

   componentDidMount() {
      const {image_id, steps_list, on_update_props} = this.props;
      const image_data = ImageModalSelect.get_image_data(image_id);
      if (!steps_list.length) {
         steps_list.push(FIRST_STEP);
         on_update_props({steps_list: steps_list})
      }
      this.setState({image_data: image_data})
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {image_data} = this.state;
      const {image_id} = this.props;
      if (!image_data.filename && image_id !== '') {
         const image_data = ImageModalSelect.get_image_data(image_id);
         this.setState({image_data: image_data})
      }
   }

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "design route", code: MEDIA_IMAGE_ROVER_DESIGN},
      ];
   }

   static designer_image_id = '';

   static on_menu_select = (code, segment_data, ref) => {
      console.log("on_menu_select", code)
      switch (code) {
         case MEDIA_IMAGE_ROVER_DESIGN:
            console.log("MEDIA_IMAGE_ROVER_DESIGN", segment_data)
            const instance = ref.current;
            if (instance) {
               instance.setState({in_path_design: true})
            }
            return true;
         default:
            return false;
      }
   }

   select_image = (image_data) => {
      const {on_update_props} = this.props;
      this.setState({in_image_select: false});
      on_update_props({image_id: image_data.filename});
   }

   render() {
      const {in_image_select, in_path_design} = this.state;
      const {image_id, steps_list, aspect_ratio, on_update_props} = this.props;
      const prompt = image_id ? '' : <PromptText
         key={"rover_initial_prompt"}
         onClick={e => this.setState({in_image_select: true})}>
         {"configure this"}
      </PromptText>
      const rover_select_image = !in_image_select ? '' : <ImageModalSelect
         key={"rover_select_image"}
         response={image_data => this.select_image(image_data)}/>;
      const designer = !in_path_design ? '' : <RoverDesign
         key={`RoverDesign_${image_id}`}
         image_id={image_id}
         steps_list={steps_list}
         aspect_ratio={aspect_ratio}
         on_update_props={on_update_props}
         on_response_modal={r => this.setState({in_path_design: false})}/>
      const image = !image_id ? '' : <ImageRender
         key={`ImageRender_${image_id}`}
         image_id={image_id}
         width_px={250}/>
      return [
         prompt,
         rover_select_image,
         designer,
         image
      ];
   }
}

export default ImageRover;
