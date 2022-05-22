import {Component} from 'react';
import PropTypes from 'introspective-prop-types'
// import styled from "styled-components";

// import {AppStyles} from "../../../app/AppImports";
import FractoRoverDesign from "./rover/FractoRoverDesign";

const FRACTO_ROVER_DESIGN = 10001;
const FRACTO_ROVER_PREVIEW = 10002;
const FRACTO_ROVER_RENDER = 10003;

export class FractoRover extends Component {

   static propTypes = {
      steps_list: PropTypes.array,
      aspect_ratio: PropTypes.number,
      on_update_props: PropTypes.func.isRequired,
   }

   static defaultProps = {
      steps_list: [],
      aspect_ratio: 16 / 9
   }

   state = {
      in_path_design: false,
      in_path_preview: false,
      in_path_render: false,
      image_data: {}
   };

   componentDidMount() {
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
   }

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "design path", code: FRACTO_ROVER_DESIGN},
         {label: "preview path", code: FRACTO_ROVER_PREVIEW},
         {label: "render path", code: FRACTO_ROVER_RENDER},
      ];
   }

   static designer_image_id = '';

   static on_menu_select = (code, segment_data, ref) => {
      console.log("on_menu_select", code)
      switch (code) {
         case FRACTO_ROVER_DESIGN:
            console.log("FRACTO_ROVER_DESIGN", segment_data)
            if (ref.current) {
               ref.current.setState({in_path_design: true})
            }
            return true;
         case FRACTO_ROVER_PREVIEW:
            console.log("FRACTO_ROVER_PREVIEW", segment_data)
            if (ref.current) {
               ref.current.setState({in_path_preview: true})
            }
            return true;
         case FRACTO_ROVER_RENDER:
            console.log("FRACTO_ROVER_RENDER", segment_data)
            if (ref.current) {
               ref.current.setState({in_path_render: true})
            }
            return true;
         default:
            return false;
      }
   }

   render() {
      const {in_path_design} = this.state;
      const {image_id, steps_list, aspect_ratio, on_update_props} = this.props;
      const designer = !in_path_design ? '' : <FractoRoverDesign
         key={`RoverDesign_${image_id}`}
         image_id={image_id}
         steps_list={steps_list}
         aspect_ratio={aspect_ratio}
         on_update_props={on_update_props}
         on_response_modal={r => this.setState({in_path_design: false})}/>
      // const previewer = !in_path_preview ? '' : <RoverPreview
      //    key={`RoverPreview${image_id}`}
      //    image_id={image_id}
      //    steps_list={steps_list}
      //    aspect_ratio={aspect_ratio}
      //    on_response_modal={r => this.setState({in_path_preview: false})}/>
      // const renderer = !in_path_render ? '' : <RoverRender
      //    key={`RoverRender${image_id}`}
      //    image_id={image_id}
      //    steps_list={steps_list}
      //    aspect_ratio={aspect_ratio}
      //    on_response_modal={r => this.setState({in_path_render: false})}/>
      // const image = !image_id ? '' : <ImageRender
      //    key={`ImageRender_${image_id}`}
      //    image_id={image_id}
      //    width_px={250}/>
      // return [
      //    designer,
      //    previewer,
      //    renderer,
      //    image
      // ];
      return designer
   }
}

export default FractoRover;
