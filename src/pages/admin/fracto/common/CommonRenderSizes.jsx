import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import CoolButton from "common/cool/CoolButton";

import {ENTITY_STATUS_DRAFT} from "../FractoCommon";
import {DEFAULT_FRACTO_VALUES} from "../FractoUtil";

// import CommonResources from "./CommonResources";
import CommonFiles from "./CommonFiles";

const CanvasField = styled.canvas`
    ${AppStyles.absolute}    
    top: 10000px;
`;

const InfoRowWrapper = styled(AppStyles.Block)`
   margin: 0.25rem 3rem;
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

export class CommonRenderSizes extends Component {

   constructor(props) {
      super(props);
      this.state.fracto_values = props.initial_params;
      this.state.canvas_refs = [];
      props.image_sizes_px.forEach((size, i) => {
         // eslint-disable-next-line
         this.state.canvas_refs[i] = React.createRef()
      })
   }

   static propTypes = {
      on_response_modal: PropTypes.func.isRequired,
      s3_folder_prefix: PropTypes.string.isRequired,
      initial_params: PropTypes.object,
      image_sizes_px: PropTypes.array.isRequired
   }

   static defaultProps = {
      initial_params: DEFAULT_FRACTO_VALUES,
      burrow_files: []
   }

   state = {
      fracto_values: DEFAULT_FRACTO_VALUES,
      canvas_refs: [],
      rendering_size: 0,
      png_files: [],
      json_files: [],
      pattern_files: [],
      formation_complete: false,
   }

   componentDidMount() {
      const {s3_folder_prefix} = this.props;
      this.render_draft_size(0, () => {
         console.log("render complete", s3_folder_prefix);
         this.setState({formation_complete: true})
      })
   }

   render_draft_size = (size_index, cb) => {
      // const {fracto_values, canvas_refs} = this.state;
      // const {image_sizes_px, s3_folder_prefix} = this.props;
      //
      // const size = image_sizes_px[size_index];
      // const canvas_ref = canvas_refs[size_index];
      // this.setState({rendering_size: size});

      // FractoSieve.extract(fracto_values.focal_point, 1.0, fracto_values.scope, size, result => {
      //    console.log("FractoSieve complete", size);
      //    CommonResources.generate_image(fracto_values, s3_folder_prefix, canvas_ref, size, result, png_files => {
      //       console.log("CommonResources.generate_image returns", png_files)
      //       this.setState({png_files: png_files, png_complete: true})
      //    })
      //    CommonResources.store_json_data(s3_folder_prefix, size, result, json_files => {
      //       console.log("CommonResources.store_json_data returns", json_files)
      //       this.setState({json_files: json_files, json_complete: true})
      //    })
      //    CommonResources.store_pattern_data(s3_folder_prefix, size, result, pattern_files => {
      //       console.log("CommonResources.store_pattern_data returns", pattern_files)
      //       this.setState({pattern_files: pattern_files, patterns_complete: true})
      //    })
      //    if (size_index === image_sizes_px.length - 1) {
      //       setTimeout(() => cb(), 3000);
      //       return;
      //    }
      //    setTimeout(() => this.render_draft_size(size_index + 1, cb), 3000);
      // });
   }

   create_draft = () => {
      const {png_files, json_files, pattern_files} = this.state;
      const {on_response_modal, s3_folder_prefix} = this.props;

      let registry = {}
      CommonFiles.load_registry_json(s3_folder_prefix, r => {
         if (r) {
            console.log("CommonFiles.load_registry_json returns", r)
            registry = Object.assign({}, r)
         }
         registry["png_files"] = png_files;
         registry["json_files"] = json_files;
         registry["pattern_files"] = pattern_files;
         registry["status"] = ENTITY_STATUS_DRAFT;
         CommonFiles.save_registry_json(s3_folder_prefix, registry, result => {
            console.log("CommonFiles.save_registry_json returns", result);
            on_response_modal(registry)
         })
      })
   }

   render() {
      const {
         canvas_refs, formation_complete,
         rendering_size, png_files, json_files, pattern_files
      } = this.state;
      const {image_sizes_px} = this.props;

      const image_canvases = []
      image_sizes_px.forEach((size_px, i) => {
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
      const rendering_info = formation_complete ? "complete!" : `rendering: ${rendering_size ? rendering_size : ""}`
      const rendered_png_files = png_files.map((png_file, i) => {
         return <AppStyles.InlineBlock>{i ? ', ' : ''}<ItemSpan>{png_file.size}</ItemSpan></AppStyles.InlineBlock>
      });
      const rendered_json_files = json_files.map((json_file, i) => {
         return <AppStyles.InlineBlock>{i ? ', ' : ''}<ItemSpan>{json_file.size}</ItemSpan></AppStyles.InlineBlock>
      });
      const rendered_pattern_files = pattern_files.map((pattern_file, i) => {
         return <AppStyles.InlineBlock>{i ? ', ' : ''}<ItemSpan>{pattern_file.size}</ItemSpan></AppStyles.InlineBlock>
      });

      const png_files_prompt = !png_files.length ? '' : <PromptSpan>
         {"png files completed: "}
      </PromptSpan>;
      const json_files_prompt = !json_files.length ? '' : <PromptSpan>
         {"json files completed: "}
      </PromptSpan>;
      const pattern_files_prompt = !pattern_files.length ? '' : <PromptSpan>
         {"pattern files completed: "}
      </PromptSpan>;

      const button_style = {
         marginLeft: "10rem",
         marginTop: "1rem",
      }
      const draft_button = !formation_complete ? '' : <CoolButton
         content={"Create Draft Now"}
         style={button_style}
         on_click={e => this.create_draft()}
         primary={true}
      />

      return [
         image_canvases,
         <InfoRowWrapper>{rendering_info}</InfoRowWrapper>,
         <InfoRowWrapper>{png_files_prompt}{rendered_png_files}</InfoRowWrapper>,
         <InfoRowWrapper>{json_files_prompt}{rendered_json_files}</InfoRowWrapper>,
         <InfoRowWrapper>{pattern_files_prompt}{rendered_pattern_files}</InfoRowWrapper>,
         draft_button
      ];
   }
}

export default CommonRenderSizes;
