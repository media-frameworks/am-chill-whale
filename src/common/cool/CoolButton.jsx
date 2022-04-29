import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../../app/AppImports";

const BlueButton = styled(AppStyles.InlineBlock)`
   ${AppStyles.pointer}
   color: white;
   margin: 0.5rem 1rem;
   padding: 0.5rem 1rem;
   background-color: ${AppColors.HSL_DEEP_BLUE};
   border-radius: 0.25rem;
`;

export class CoolButton extends Component {

   static propTypes = {
      content: PropTypes.elementType.isRequired,
      on_click: PropTypes.func.isRequired,
      style: PropTypes.object
   }

   render () {
      const {content, on_click, style} = this.props;
      return <BlueButton style={style} onClick={e => on_click(e)}>{content}</BlueButton>
   }
}

export default CoolButton;