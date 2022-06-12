import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars} from '@fortawesome/free-solid-svg-icons'

import {AppStyles, AppColors} from "app/AppImports";
import {CoolDropdown} from "common/cool/CoolImports";

export const STEP_CODE_SELECT = 10000;
export const STEP_CODE_ADD_ABOVE = 10001;
export const STEP_CODE_ADD_BELOW = 10002;
export const STEP_CODE_DELETE = 10003;

const STEP_MENU = [
   {label: "add above", code: STEP_CODE_ADD_ABOVE},
   {label: "add below", code: STEP_CODE_ADD_BELOW},
   {type: "separator"},
   {label: "delete", code: STEP_CODE_DELETE},
]

const StepIndex = styled(AppStyles.InlineBlock)`
   ${AppStyles.pointer};
   ${AppStyles.align_middle};
`;

const NumeralSpan =  styled.span`
   ${AppStyles.monospace};
   font-size: 2.0rem;
   padding-right: 0.5rem;
   text-align: right;
`;

const IconWrapper = styled.div`
    ${AppStyles.block};
    font-size: 1rem;
    color: #888888;
    opacity: 0.65;
    &: hover{
      opacity: 1;
    };
`;

const FontAwesomeIconWrapper = styled(FontAwesomeIcon)`
   font-size: 1.5rem;
   margin: 0;
`;

export class FractoRoverStepMenu extends Component {

   static propTypes = {
      step_index: PropTypes.number.isRequired,
      callback: PropTypes.func.isRequired,
      selected: PropTypes.bool.isRequired,
   }

   state = {
      menu_ref: React.createRef(),
      in_step_menu: false
   }

   menu_selection = (selection) => {
      const {callback} = this.props;
      callback (selection);
      this.setState({in_step_menu: false})
   }

   render_step_menu = (step_index) => {
      const {menu_ref} = this.state;
      const menu_options = STEP_MENU.map(item => {
         return Object.assign({}, item);
      })
      const reference_rect = menu_ref.current.getBoundingClientRect();
      return <CoolDropdown
         items={menu_options}
         reference_rect={{top: reference_rect.top, left: reference_rect.left + 10}}
         callback={selection => this.menu_selection(selection)}
      />
   }

   get_step_menu = () => {
      const {menu_ref} = this.state;
      const {selected} = this.props;
      const icon_style = { color: selected ? "white" : "#888888" }
      return <IconWrapper
         ref={menu_ref}
         style={icon_style}
         onClick={e => this.setState({in_step_menu: true})}>
         <FontAwesomeIconWrapper icon={faBars}/>
      </IconWrapper>
   }

   render() {
      const {in_step_menu} = this.state;
      const {step_index, selected} = this.props;
      const step_menu = !in_step_menu ? '' : this.render_step_menu(step_index);
      const numeral_style = { color: !selected ? AppColors.HSL_COOL_BLUE : AppColors.HSL_DEEP_BLUE}
      return <StepIndex
         title={"click to select"}>
         <NumeralSpan
            style={numeral_style}
            onClick={e => this.menu_selection(STEP_CODE_SELECT)}>
            {step_index + 1}
         </NumeralSpan>
         {this.get_step_menu()}
         {step_menu}
      </StepIndex>
   }
}

export default FractoRoverStepMenu;
