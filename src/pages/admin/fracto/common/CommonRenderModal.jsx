import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import CoolModal from "common/cool/CoolModal"
import CoolButton from "common/cool/CoolButton"

import {render_modal_title} from "../FractoStyles";
import CommonResources from "./CommonResources";
import CommonFiles from "./CommonFiles";

const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";

const ButtonsRow = styled(AppStyles.Block)`
   ${AppStyles.centered}
`;

const CanvasField = styled.canvas`
   ${AppStyles.absolute}    
   top: 10000px;
   left: 10000px;
`;

const ProgressWrapper = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 1rem;
`;

export class CommonRenderModal extends Component {

   static propTypes = {
      dimension: PropTypes.number.isRequired,
      s3_folder_prefix: PropTypes.string.isRequired,
      fracto_values: PropTypes.object.isRequired,
      on_modal_response: PropTypes.func.isRequired,
   }

   state = {
      canvas_ref: React.createRef(),
      png_complete: false,
      json_complete: false,
      patterns_complete: false,
      png_files: [],
      json_files: [],
      pattern_files: [],
   }

   build_resources = (result) => {
      const {canvas_ref} = this.state;
      const {dimension, fracto_values, s3_folder_prefix} = this.props;

      CommonResources.generate_image(fracto_values, s3_folder_prefix, canvas_ref, dimension, result, png_files => {
         console.log("CommonResources.generate_image returns", png_files)
         this.setState({png_files: png_files, png_complete: true})
      })
      CommonResources.store_json_data(s3_folder_prefix, dimension, result, json_files => {
         console.log("CommonResources.store_json_data returns", json_files)
         this.setState({json_files: json_files, json_complete: true})
      })
      CommonResources.store_pattern_data(s3_folder_prefix, dimension, result, pattern_files => {
         console.log("CommonResources.store_pattern_data returns", pattern_files)
         this.setState({pattern_files: pattern_files, patterns_complete: true})
      })
   }

   componentDidMount() {
      // const {dimension, fracto_values} = this.props;
      //
      // if (false) {
      //    FractoSieve.extract(fracto_values.focal_point, 1.0, fracto_values.scope, dimension, result => {
      //       console.log("FractoSieve complete", dimension);
      //       this.build_resources(result);
      //    });
      // } else {
      //    const half_span = fracto_values.scope / 2;
      //    const left = fracto_values.focal_point.x - half_span;
      //    const top = fracto_values.focal_point.y + half_span;
      //    fetch(`${FRACTO_PHP_URL_BASE}/fast_sieve.php?left=${left}&top=${top}&span=${fracto_values.scope}&width_px=${dimension}`)
      //       .then(response => {
      //          console.log("response",response)
      //          return response.json()
      //       })
      //       .then(result => {
      //          console.log("fetch returns", result);
      //          this.build_resources(result);
      //       });
      // }
   }

   modal_response = (value) => {
      const {png_files, json_files, pattern_files} = this.state;
      const {on_modal_response, s3_folder_prefix} = this.props;

      if (value) {
         CommonFiles.load_registry_json(s3_folder_prefix, fs => {
            fs.png_files = png_files;
            fs.json_files = json_files;
            fs.pattern_files = pattern_files;
            CommonFiles.save_registry_json(s3_folder_prefix, fs, result => {
               console.log("CommonFiles.save_registry_json returns", result)
               on_modal_response(value);
            })
         })
      } else {
         on_modal_response(value);
      }
   }

   render() {
      const {canvas_ref, png_complete, json_complete, patterns_complete} = this.state;
      const {dimension, on_modal_response} = this.props;
      const modal_title = render_modal_title(`render field study: ${dimension}`)

      let progress = [];
      if (png_complete) {
         progress = progress.concat("image");
      }
      if (json_complete) {
         progress = progress.concat("data");
      }
      if (patterns_complete) {
         progress = progress.concat("patterns");
      }
      const is_complete = progress.length === 3;
      const complete = !is_complete ? '' : ', complete!';
      const progress_text = !progress.length ? 'initializing...' : `${progress.join(', ')}${complete}`;

      const cancel_button = <CoolButton
         primary={1}
         content={is_complete ? "Done" : "CANCEL"}
         on_click={e => this.modal_response(is_complete ? 1 : 0)}/>
      const modal_contents = [
         modal_title,
         <ProgressWrapper>{progress_text}</ProgressWrapper>,
         <ButtonsRow>{cancel_button}</ButtonsRow>
      ]

      const canvas_style = {
         width: `${dimension}px`,
         height: `${dimension}px`,
      };
      const image_canvas = <CanvasField
         ref={canvas_ref}
         style={canvas_style}
         width={`${dimension}px`}
         height={`${dimension}px`}/>

      return [
         image_canvas,
         <CoolModal
            width={"600px"}
            contents={modal_contents}
            response={r => on_modal_response(r)}
            settings={{no_escape: true}}
         />
      ]
   }
}

export default CommonRenderModal;
