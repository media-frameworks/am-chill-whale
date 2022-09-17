import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import {CoolModal} from "common/cool/CoolImports";

import {
   render_title_bar,
   render_modal_title,
   render_fracto_locate,
   render_main_link
} from "./FractoStyles";
import FractoRender from "./FractoRender";
import FractoCommon from "./FractoCommon";
import FractoData, {get_ideal_level} from "./FractoData";
import FractoUtil, {DEFAULT_FRACTO_VALUES} from "./FractoUtil";

import CommonFiles from "./common/CommonFiles";

const FRACTO_RENDER_WIDTH_PX = 750;

const FractoWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem;
`;

const NewLinkWrapper = styled(AppStyles.Block)`
   margin-left: 9.5rem;
`;

export class FractoTileFactory extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      in_new_chaos: false,
      fracto_values: DEFAULT_FRACTO_VALUES,
      chaos_name: ''
   }

   componentDidMount() {
   }

   new_chaos = () => {
      const {fracto_values, chaos_name} = this.state;
      const {width_px} = this.props;
      const level = get_ideal_level(width_px, fracto_values.scope);
      const chaos_file = {
         name: chaos_name,
         level: level
      }
      const chaos_name_slug = FractoUtil.get_dirname_slug(chaos_name);
      const s3_folder_prefix = "orders";
      const filename = `${chaos_name_slug}.json`;
      CommonFiles.save_json_file(s3_folder_prefix, filename, chaos_file, result => {
         console.log("CommonFiles.save_registry_json", s3_folder_prefix, filename, chaos_file, result)
      })
   }

   on_response_modal = () => {
      this.setState({in_new_chaos: false})
   }

   render() {
      const {in_new_chaos, fracto_values, chaos_name} = this.state;
      const {width_px} = this.props;
      const title_bar = render_title_bar("chaos factory");
      const main_link = render_main_link("more chaos", e => this.setState({in_new_chaos: true}));

      const modal_title_bar = render_modal_title("new chaos factory order")
      const fracto_render = <FractoWrapper>
         <FractoRender
            width_px={FRACTO_RENDER_WIDTH_PX}
            aspect_ratio={1.0}
            initial_params={fracto_values}
            on_param_change={values => this.setState({fracto_values: values})}
         />
      </FractoWrapper>
      const fracto_locate = render_fracto_locate(fracto_values, FRACTO_RENDER_WIDTH_PX);

      const chaos_name_input = FractoCommon.render_entity_name_input("enter", chaos_name,
         value => this.setState({chaos_name: value}))
      const new_link = render_main_link("generate chaos!", e => this.new_chaos());

      const modal_contents = [
         modal_title_bar,
         fracto_render,
         <AppStyles.InlineBlock>{[
            fracto_locate,
            chaos_name_input,
            <NewLinkWrapper>{new_link}</NewLinkWrapper>,
         ]}</AppStyles.InlineBlock>
      ];
      const new_chaos_modal = !in_new_chaos ? '' : <CoolModal
         width={`${width_px - 200}px`}
         contents={modal_contents}
         response={r => this.on_response_modal(r)}/>

      return [
         title_bar, main_link,
         new_chaos_modal
      ]
   }
}

export default FractoTileFactory;
