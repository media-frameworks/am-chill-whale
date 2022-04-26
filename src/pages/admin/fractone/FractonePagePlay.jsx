import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";

const TitleWrapper = styled(AppStyles.InlineBlock)`
   margin: 0.5rem;
`;

export class FractonePagePlay extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {};

   render () {
      return <TitleWrapper>Go Live!</TitleWrapper>
   }
}

export default FractonePagePlay;
