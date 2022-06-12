import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
// import styled from "styled-components";

// import {AppStyles, AppColors} from "app/AppImports";
import {CoolModal} from "common/cool/CoolImports";
import {ModalTitle} from "common/cool/CoolModal";

export class FractoRoverRender extends Component {

   static propTypes = {
      steps_list: PropTypes.array,
      aspect_ratio: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
      on_response_modal: PropTypes.func.isRequired,
   }

   state = {
   };

   componentDidMount() {
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
   }

   render() {
      const {on_response_modal} = this.props;
      const render_contents = [
         <ModalTitle>Render Video</ModalTitle>,
      ];
      return <CoolModal
         key={`CoolModal_fracto_rover_render`}
         width={"85%"}
         contents={render_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default FractoRoverRender;
