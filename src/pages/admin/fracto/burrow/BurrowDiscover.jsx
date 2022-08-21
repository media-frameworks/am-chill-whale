import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";
// import StoreS3 from "common/StoreS3";

import FractoRender from "../FractoRender";
import FractoCommon from "../FractoCommon";
import {
   render_modal_title,
   render_fracto_locate,
   render_main_link
} from "../FractoStyles";
import {DEFAULT_FRACTO_VALUES} from "../FractoUtil";

import BurrowFiles from "./BurrowFiles";

const RENDER_WIDTH_PX = 600;

const FractoWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem 1rem 0;
`;

export class BurrowDiscover extends Component {

   constructor(props) {
      super(props);
      this.state.fracto_values = props.initial_params
   }

   static propTypes = {
      on_response_modal: PropTypes.func.isRequired,
      initial_params: PropTypes.object,
      burrow_files: PropTypes.array,
   }

   static defaultProps = {
      initial_params: DEFAULT_FRACTO_VALUES,
      burrow_files: []
   }

   state = {
      burrow_name: ''
   }

   new_burrow = () => {
      const {fracto_values, burrow_name} = this.state;
      BurrowFiles.new_burrow(fracto_values, burrow_name, result => {
         console.log("BurrowFiles.new_burrow result", result);
      })
   }

   render() {
      const {fracto_values, burrow_name} = this.state;
      const {on_response_modal} = this.props;
      const modal_title = render_modal_title("to the burrows")

      const fracto_render = <FractoWrapper style={{width: `${RENDER_WIDTH_PX + 20}px`}}>
         <FractoRender
            width_px={RENDER_WIDTH_PX}
            aspect_ratio={1.0}
            initial_params={fracto_values}
            on_param_change={values => this.setState({fracto_values: values})}
         />
      </FractoWrapper>
      const fracto_locate = render_fracto_locate(fracto_values);

      const burrow_name_input = FractoCommon.render_entity_name_input("burrow", burrow_name,
         value => this.setState({burrow_name: value}))
      const new_link = render_main_link("start burrowing!", e => this.new_burrow());

      const discover_contents = [
         modal_title,
         fracto_render,
         <AppStyles.InlineBlock>{[
            fracto_locate,
            burrow_name_input,
            new_link,
         ]}</AppStyles.InlineBlock>
      ]

      return <CoolModal
         width={"95%"}
         contents={discover_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default BurrowDiscover;
