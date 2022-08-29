import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";

import {render_modal_title} from "../FractoStyles";
import CommonRenderSizes from "../common/CommonRenderSizes";

const StepNameWrapper = styled(AppStyles.Block)`
   ${AppStyles.centered}
   ${AppStyles.monospace}
   margin-top: 0.5rem;
   font-size: 1.75rem;
`;

export class BurrowStep extends Component {

   static propTypes = {
      on_response_modal: PropTypes.func.isRequired,
      s3_folder_prefix: PropTypes.string.isRequired,
      fracto_values: PropTypes.object,
      image_sizes_px: PropTypes.array.isRequired,
      step_name: PropTypes.string.isRequired,
   }

   state = {
      processing: false,
      registry: {}
   }

   componentDidMount() {
      this.setState({processing: true})
   }

   completed_action = (registry) => {
      const {on_response_modal} = this.props;
      this.setState({
         registry: registry,
         processing: false
      })
      on_response_modal(registry);
   }

   render() {
      const {processing, registry} = this.state;
      const {on_response_modal, s3_folder_prefix, fracto_values, image_sizes_px, step_name} = this.props;
      const title = render_modal_title("add burrow step");
      const rendering_action = !processing ? '' : <CommonRenderSizes
         on_response_modal={registry => this.completed_action(registry)}
         s3_folder_prefix={s3_folder_prefix}
         initial_params={fracto_values}
         image_sizes_px={image_sizes_px}
      />
      console.log("registry", registry);
      return <CoolModal
         width={"800px"}
         contents={[
            title,
            <StepNameWrapper>~{step_name}~</StepNameWrapper>,
            rendering_action
         ]}
         response={r => on_response_modal(r)}
      />
   }
}

export default BurrowStep;
