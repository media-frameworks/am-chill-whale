import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars} from '@fortawesome/free-solid-svg-icons'

import {AppStyles} from "../../AppImports";
import CoolDropdown from "../../../common/cool/CoolDropdown";

const IconWrapper = styled.div`
    ${AppStyles.block};
    font-size: 1rem;
    color: #888888;
    opacity: 0.65;
    &: hover{
      opacity: 1;
    };
 `;

const MenuWrapper = styled.div`
    ${AppStyles.inline_block};
   background-color: white;
 `;

const FontAwesomeIconWrapper = styled(FontAwesomeIcon)`
    margin: 0;
`;

export class SegmentsMenu extends Component {

   static propTypes = {
      menu_options: PropTypes.array.isRequired,
      on_selected: PropTypes.func.isRequired,
   }

   state = {
      reference_rect: {},
      in_dropdown: false
   };

   handle_menu = (e) => {
      const reference_rect = e.target.getBoundingClientRect();
      this.setState({
         in_dropdown: true,
         reference_rect: reference_rect
      })
   }

   menu_selection = (selection) => {
      const {on_selected} = this.props;
      on_selected(selection);
      this.setState({in_dropdown: false});
   }

   render() {
      const {in_dropdown, reference_rect} = this.state;
      const {menu_options} = this.props;
      const segment_menu = !in_dropdown ? '' : <CoolDropdown
         items={menu_options}
         reference_rect={reference_rect}
         callback={selection => this.menu_selection(selection)}
      />
      return <MenuWrapper>
         <IconWrapper onClick={e => this.handle_menu(e)}>
            <FontAwesomeIconWrapper icon={faBars}/>
         </IconWrapper>
         {segment_menu}
      </MenuWrapper>
   }
}

export default SegmentsMenu;
