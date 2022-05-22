import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import FractonePlayer from "./FractonePlayer"

const PlayerWrapper = styled(AppStyles.Block)`
   margin : 2rem auto;
`;

export class FractonePageLoad extends Component {

   static propTypes = {
      prefix: PropTypes.string.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   render() {
      const {prefix, width_px} = this.props;
      const wrapper_style = {width: width_px}
      return <PlayerWrapper
         style={wrapper_style}>
         <FractonePlayer
            prefix={prefix}
            width_px={width_px - 150}
            mask_radius={3}/>
      </PlayerWrapper>
   }
}

export default FractonePageLoad;
