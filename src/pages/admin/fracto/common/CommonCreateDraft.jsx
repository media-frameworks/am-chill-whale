import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";

import {
   render_modal_title,
   render_fracto_locate,
   render_main_link
} from "../FractoStyles";
import FractoRender from "../FractoRender";
import FractoCommon from "../FractoCommon";
import FractoUtil, {DEFAULT_FRACTO_VALUES} from "../FractoUtil";

import CommonFiles from "./CommonFiles";
import CommonRenderSizes from "./CommonRenderSizes";

const RENDER_WIDTH_PX = 600;

const IMAGE_SIZES_PX = [128, 256, 512, 1024];

const FractoWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem;
`;

const NewLinkWrapper = styled(AppStyles.Block)`
   margin-left: 9.5rem;
`;

export class CommonCreateDraft extends Component {

   constructor(props) {
      super(props);
      this.state.fracto_values = props.initial_params;
   }

   static propTypes = {
      on_response_modal: PropTypes.func.isRequired,
      modal_title: PropTypes.string.isRequired,
      base_folder: PropTypes.string.isRequired,
      initial_params: PropTypes.object,
   }

   static defaultProps = {
      initial_params: DEFAULT_FRACTO_VALUES,
      burrow_files: []
   }

   state = {
      fracto_values: DEFAULT_FRACTO_VALUES,
      draft_name: '',
      rendering_size: 0,
      formation_complete: false,
      in_formation_mode: false
   }

   new_draft = () => {
      const {fracto_values, draft_name, in_formation_mode} = this.state;
      const {base_folder} = this.props;
      if (in_formation_mode) {
         return;
      }
      CommonFiles.create_draft(base_folder, draft_name, fracto_values, result => {
         console.log("CommonFiles.create_draft result", result);
         this.setState({in_formation_mode: true})
      })
   }

   render() {
      const {
         fracto_values, draft_name,
         in_formation_mode
      } = this.state;
      const {on_response_modal, modal_title, base_folder} = this.props;

      const modal_title_bar = render_modal_title(modal_title)

      const fracto_render = <FractoWrapper>
         <FractoRender
            width_px={RENDER_WIDTH_PX}
            aspect_ratio={1.0}
            initial_params={fracto_values}
            on_param_change={values => this.setState({fracto_values: values})}
         />
      </FractoWrapper>
      const fracto_locate = render_fracto_locate(fracto_values);

      const draft_name_input = FractoCommon.render_entity_name_input("enter", draft_name,
         value => this.setState({draft_name: value}))
      const new_link = in_formation_mode ? '' : render_main_link("generate now!", e => this.new_draft());

      const draft_dirname = FractoUtil.get_dirname_slug(draft_name);
      const common_render_sizes = !in_formation_mode ? '' : <CommonRenderSizes
         on_response_modal={r => on_response_modal(r)}
         s3_folder_prefix={`${base_folder}/${draft_dirname}`}
         initial_params={fracto_values}
         image_sizes_px={IMAGE_SIZES_PX}
      />

      const modal_contents = [
         modal_title_bar,
         fracto_render,
         <AppStyles.InlineBlock>{[
            fracto_locate,
            draft_name_input,
            <NewLinkWrapper>{new_link}</NewLinkWrapper>,
            common_render_sizes
         ]}</AppStyles.InlineBlock>
      ];
      return <CoolModal
         width={"70%"}
         contents={modal_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default CommonCreateDraft;
