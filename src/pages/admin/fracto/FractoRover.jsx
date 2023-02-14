import {Component} from 'react';
import PropTypes from 'prop-types'
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import FractoRoverDesign from "./rover/FractoRoverDesign";
import FractoRoverPreview from "./rover/FractoRoverPreview";
import FractoRoverRender from "./rover/FractoRoverRender";

const FRACTO_ROVER_DESIGN = 10001;
const FRACTO_ROVER_PREVIEW = 10002;
const FRACTO_ROVER_RENDER = 10003;

const PromptSpan = styled.span`
   ${AppStyles.italic}
   ${AppStyles.bold}
   ${AppStyles.pointer}
   ${AppColors.COLOR_DEEP_BLUE}
   margin-left: 0.5rem;
`;

export class FractoRover extends Component {

   static propTypes = {
      steps_list: PropTypes.array,
      aspect_ratio: PropTypes.number,
      width_px: PropTypes.number,
      on_update_props: PropTypes.func.isRequired,
   }

   static defaultProps = {
      steps_list: [],
      aspect_ratio: 16 / 9,
      width_px: 1200,
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
      const {in_path_design, in_path_preview, in_path_render} = this.state;
      const {steps_list, aspect_ratio, width_px, on_update_props} = this.props;

      const designer = !in_path_design ? '' : <FractoRoverDesign
         steps_list={steps_list}
         aspect_ratio={aspect_ratio}
         width_px={width_px}
         on_update_props={on_update_props}
         on_response_modal={r => this.setState({in_path_design: false})}/>
      const previewer = !in_path_preview ? '' : <FractoRoverPreview
         steps_list={steps_list}
         aspect_ratio={aspect_ratio}
         width_px={width_px}
         on_response_modal={r => this.setState({in_path_preview: false})}/>
      const renderer = !in_path_render ? '' : <FractoRoverRender
         steps_list={steps_list}
         aspect_ratio={aspect_ratio}
         width_px={width_px}
         on_response_modal={r => this.setState({in_path_render: false})}/>

      const design_link = <PromptSpan onClick={e => this.setState({in_path_design: true})}>design</PromptSpan>;
      const preview_link = <PromptSpan onClick={e => this.setState({in_path_preview: true})}>preview</PromptSpan>;
      const render_link = <PromptSpan onClick={e => this.setState({in_path_render: true})}>render</PromptSpan>;

      return [
         designer, previewer, renderer,
         design_link, preview_link, render_link
      ];
   }
}

export default FractoRover;
