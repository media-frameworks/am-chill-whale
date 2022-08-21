import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";
import CoolButton from "common/cool/CoolButton";

import {
   render_modal_title,
   render_fracto_locate,
   render_main_link
} from "../FractoStyles";
import FractoRender from "../FractoRender";
import FractoCommon, {ENTITY_STATUS_DRAFT} from "../FractoCommon";
import {DEFAULT_FRACTO_VALUES} from "../FractoUtil";
import FractoSieve from "../FractoSieve";

import ObservatoryFiles from "./ObservatoryFiles";
import ObservatoryResources from "./ObservatoryResources";

const RENDER_WIDTH_PX = 600;

const IMAGE_SIZES_PX = [128, 256, 512, 1024];

const FractoWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem;
`;

const CanvasField = styled.canvas`
    ${AppStyles.absolute}    
    top: 10000px;
`;

const InfoRowWrapper = styled(AppStyles.Block)`
   margin: 0.25rem 3rem;
`;

const NewLinkWrapper = styled(AppStyles.Block)`
   margin-left: 9.5rem;
`;

const PromptSpan = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   font-size: 0.85rem;
   vertical-align: bottom;
   margin-left: 1rem;
   margin-right: 0.5rem;
   color: #444444;
`;

const ItemSpan = styled.span`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.COOL_BLUE_TEXT}
`;

export class ObservatoryCapture extends Component {

   constructor(props) {
      super(props);
      this.state.fracto_values = props.initial_params;
      this.state.canvas_refs = [];
      IMAGE_SIZES_PX.forEach((size, i) => {
         // eslint-disable-next-line
         this.state.canvas_refs[i] = React.createRef()
      })
   }

   static propTypes = {
      on_response_modal: PropTypes.func.isRequired,
      initial_params: PropTypes.object
   }

   static defaultProps = {
      initial_params: DEFAULT_FRACTO_VALUES,
      burrow_files: []
   }

   state = {
      fracto_values: DEFAULT_FRACTO_VALUES,
      field_study_name: '',
      canvas_refs: [],
      rendering_size: 0,
      png_files: [],
      json_files: [],
      pattern_files: [],
      formation_complete: false,
      in_study_formation: false
   }

   render_field_size = (size, limit, cb) => {
      const {fracto_values, field_study_name, canvas_refs} = this.state;
      this.setState({rendering_size: size});
      FractoSieve.extract(
         fracto_values.focal_point, 1.0, fracto_values.scope, size, result => {
            console.log("FractoSieve complete", size);
            const canvas_ref = canvas_refs.filter((ref, i) => IMAGE_SIZES_PX[i] === size).pop();
            ObservatoryResources.generate_image(fracto_values, field_study_name, canvas_ref, size, result, png_files => {
               this.setState({png_files: png_files})
            })
            ObservatoryResources.store_json_data(field_study_name, size, result, json_files => {
               this.setState({json_files: json_files})
            })
            ObservatoryResources.store_pattern_data(field_study_name, size, result, pattern_files => {
               this.setState({pattern_files: pattern_files})
            })
            if (size === limit) {
               cb();
               return;
            }
            this.render_field_size(size * 2, limit, cb);
         });
   }

   form_study = () => {
      const {field_study_name} = this.state;
      this.render_field_size(IMAGE_SIZES_PX[0], IMAGE_SIZES_PX[IMAGE_SIZES_PX.length - 1], () => {
         console.log("render complete", field_study_name);
         this.setState({formation_complete: true})
      })
   }

   new_field_study = () => {
      const {fracto_values, field_study_name, in_study_formation} = this.state;
      if (in_study_formation) {
         return;
      }
      this.setState({in_study_formation: true})
      ObservatoryFiles.new_field_study(fracto_values, field_study_name, result => {
         console.log("ObservatoryFiles.new_field_study result", result);
         this.form_study()
      })
   }

   draft_study = () => {
      const {field_study_name, png_files, json_files, pattern_files} = this.state;
      const {on_response_modal} = this.props;
      ObservatoryFiles.load_field_study(field_study_name, field_study => {
         console.log("ObservatoryFiles.load_field_study returns", field_study)
         field_study["png_files"] = png_files;
         field_study["json_files"] = json_files;
         field_study["pattern_files"] = pattern_files;
         field_study["status"] = ENTITY_STATUS_DRAFT;
         ObservatoryFiles.save_field_study(field_study_name, field_study, result => {
            console.log("ObservatoryFiles.save_field_study returns", result);
            on_response_modal(field_study_name)
         })
      })
   }

   render() {
      const {
         fracto_values, field_study_name,
         in_study_formation, formation_complete, canvas_refs,
         rendering_size, png_files, json_files, pattern_files
      } = this.state;
      const {on_response_modal} = this.props;

      const modal_title = render_modal_title("new field study")

      const fracto_render = <FractoWrapper>
         <FractoRender
            width_px={RENDER_WIDTH_PX}
            aspect_ratio={1.0}
            initial_params={fracto_values}
            on_param_change={values => this.setState({fracto_values: values})}
         />
      </FractoWrapper>
      const fracto_locate = render_fracto_locate(fracto_values);

      const field_study_name_input = FractoCommon.render_entity_name_input("study", field_study_name,
         value => this.setState({field_study_name: value}))
      const new_link = in_study_formation ? '' : render_main_link("generate now!", e => this.new_field_study());

      const image_canvases = []
      IMAGE_SIZES_PX.forEach((size_px, i) => {
         const canvas_style = {
            width: `${size_px}px`,
            height: `${size_px}px`,
            left: `${10000 * i}px`
         };
         image_canvases[i] = <CanvasField
            ref={canvas_refs[i]}
            style={canvas_style}
            width={`${size_px}px`}
            height={`${size_px}px`}/>
      })
      const image_canvas_set = !in_study_formation ? '' : image_canvases;
      const rendering_info = !in_study_formation ? '' :
         formation_complete ? "complete!" : `rendering: ${rendering_size ? rendering_size : ""}`
      const rendered_png_files = !in_study_formation ? '' : png_files.map((png_file, i) => {
         return <AppStyles.InlineBlock>{i ? ', ' : ''}<ItemSpan>{png_file.size}</ItemSpan></AppStyles.InlineBlock>
      });
      const rendered_json_files = !in_study_formation ? '' : json_files.map((json_file, i) => {
         return <AppStyles.InlineBlock>{i ? ', ' : ''}<ItemSpan>{json_file.size}</ItemSpan></AppStyles.InlineBlock>
      });
      const rendered_pattern_files = !in_study_formation ? '' : pattern_files.map((pattern_file, i) => {
         return <AppStyles.InlineBlock>{i ? ', ' : ''}<ItemSpan>{pattern_file.size}</ItemSpan></AppStyles.InlineBlock>
      });

      const png_files_prompt = !in_study_formation || !png_files.length ? '' : <PromptSpan>
         {"png files completed: "}
      </PromptSpan>;
      const json_files_prompt = !in_study_formation || !json_files.length ? '' : <PromptSpan>
         {"json files completed: "}
      </PromptSpan>;
      const pattern_files_prompt = !in_study_formation || !pattern_files.length ? '' : <PromptSpan>
         {"pattern files completed: "}
      </PromptSpan>;

      const button_style = {
         marginLeft: "10rem",
         marginTop: "1rem",
      }
      const draft_button = !formation_complete ? '' : <CoolButton
         content={"Draft Study Now"}
         style={button_style}
         on_click={e => this.draft_study()}
         primary={true}
      />

      const modal_contents = [
         modal_title,
         fracto_render,
         <AppStyles.InlineBlock>{[
            fracto_locate,
            field_study_name_input,
            <NewLinkWrapper>{new_link}</NewLinkWrapper>,
            image_canvas_set,
            <InfoRowWrapper>{rendering_info}</InfoRowWrapper>,
            <InfoRowWrapper>{png_files_prompt}{rendered_png_files}</InfoRowWrapper>,
            <InfoRowWrapper>{json_files_prompt}{rendered_json_files}</InfoRowWrapper>,
            <InfoRowWrapper>{pattern_files_prompt}{rendered_pattern_files}</InfoRowWrapper>,
            draft_button
         ]}</AppStyles.InlineBlock>
      ];
      return <CoolModal
         width={"70%"}
         contents={modal_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default ObservatoryCapture;
