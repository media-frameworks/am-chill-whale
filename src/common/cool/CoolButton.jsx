import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../../app/AppImports";

const BasicButton = styled(AppStyles.InlineBlock)`
   ${AppStyles.pointer}
   border-radius: 0.25rem;
   padding: 0.325rem 0.75rem;
`;

export class CoolButton extends Component {

   static propTypes = {
      content: PropTypes.elementType.isRequired,
      on_click: PropTypes.func.isRequired,
      style: PropTypes.object,
      primary: PropTypes.bool,
      disabled: PropTypes.bool,
   }

   static defaultProps = {
      primary: false,
      disabled: false,
   }

   render() {
      const {content, on_click, style, primary, disabled} = this.props;
      if (primary) {
         style.color = "white";
         style.backgroundColor = AppColors.HSL_DEEP_BLUE
      } else {
         style.color = "#333333";
         style.backgroundColor = "#cccccc"
      }
      if (disabled) {
         style.alpha = 0.5;
         style.cursor = "default";
         return <BasicButton style={style}>{content}</BasicButton>
      }
      return <BasicButton
         style={style}
         onClick={e => on_click(e)}>
         {content}
      </BasicButton>
   }
}

export default CoolButton;