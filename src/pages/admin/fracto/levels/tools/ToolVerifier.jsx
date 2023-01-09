import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";

import {
   render_main_link
} from "../../FractoStyles";
import ToolSelectTile from "./ToolSelectTile"

const StartAtPrompt = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   font-size: 1rem;
   margin-right: 0.5rem;
   vertical-align: middle;
   line-height: 2rem;
`;

const LinkWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.align_right}  
   line-height: 2rem;
   vertical-align: middle;
   width: 8rem;
`;

export class ToolVerifier extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {}

   render() {
      const {level, width_px} = this.props;
      const main_link = render_main_link("verify", e => this.setState({index_mode: true}));
      return [
         <LinkWrapper>{main_link}</LinkWrapper>,
         <StartAtPrompt>start at:</StartAtPrompt>,
         <ToolSelectTile level={level} width_px={width_px} />
      ]
   }
}

export default ToolVerifier;
