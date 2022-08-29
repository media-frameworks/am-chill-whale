import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import {CoolInputText} from "common/cool/CoolImports";

import FractoUtil from "../FractoUtil";
import {render_title_bar, render_main_link} from "../FractoStyles";

import CommonFiles from "../common/CommonFiles";
import CommonCreateDraft from "../common/CommonCreateDraft";

import BurrowEdit from "./BurrowEdit";

const BurrowsWrapper = styled(AppStyles.Block)`
   margin: 1rem 2rem;
`;

const BurrowRow = styled(AppStyles.Block)`
   padding: 0.25rem 1rem;
   border-radius: 0.5rem;
   &:hover {
      background-color: #eeeeee;
   }
`;

const BurrowName = styled(AppStyles.InlineBlock)`
   ${AppStyles.pointer}
   ${AppStyles.noselect}
   ${AppStyles.italic}
   ${AppStyles.bold}
   font-size: 1.25rem;
   color: #666666;
   &:hover {
      ${AppStyles.underline}
   }
`;

const EditNameLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   ${AppStyles.pointer}
   ${AppStyles.COOL_BLUE_TEXT}
   font-size: 0.75rem;
   margin-left: 0.5rem;
   margin-top: 0.125rem;
   opacity: 0;
   &:hover {
      opacity: 1.0;
   }
`;

export class BurrowCollection extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      discover_mode: false,
      burrow_files: [],
      burrow_registry: {},
      editing_burrow: null,
      selected_burrow: -1,
      in_edit_name: -1
   }

   componentDidMount() {
      this.load_registry();
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      // this.load_registry();
   }

   load_registry = () => {
      CommonFiles.load_registry_json("burrows", registry => {
         console.log("CommonFiles.load_registry_json returns", registry)
         this.setState({burrow_registry: registry})
      });
   }

   response_modal = (r) => {
      console.log("response_modal", r);
      this.load_registry();
      this.setState({discover_mode: false});
   }

   rename_burrow = (burrow_name, new_burrow_name) => {
      const {burrow_files} = this.state;
      if (burrow_name === new_burrow_name) {
         return;
      }
      console.log(`rename_burrow from ${burrow_name} to ${new_burrow_name}`)
      burrow_files[new_burrow_name] = Object.assign({}, burrow_files[burrow_name])
      delete burrow_files[burrow_name];
      CommonFiles.save_registry_json("burrows", burrow_files => {
         console.log("CommonFiles.save_registry_json returns", burrow_files)
         this.load_registry();
      });
   }

   render() {
      const {discover_mode, selected_burrow, in_edit_name, burrow_registry} = this.state;
      const {width_px} = this.props;

      const title_bar = render_title_bar("Burrow Collection Bureau");
      const main_link = render_main_link("new burrow", e => this.setState({discover_mode: true}));

      const discover_modal = !discover_mode ? '' : <CommonCreateDraft
         burrow_files={burrow_registry}
         modal_title={"to the burrows!"}
         base_folder={"burrows"}
         on_response_modal={r => this.response_modal(r)}/>;
      const burrows = Object.keys(burrow_registry)
         .sort()
         .map(burrow_name => {
            const display_name = in_edit_name !== burrow_name ?
               <BurrowName
                  onClick={e => this.setState({selected_burrow: burrow_name === selected_burrow ? -1 : burrow_name})}>
                  {burrow_name}
               </BurrowName> :
               <CoolInputText
                  value={burrow_name}
                  placeholder={"a unique name is required"}
                  style_extra={{padding: "0.25rem 0.5rem"}}
                  callback={new_burrow_name => {
                     if (new_burrow_name.length) {
                        this.rename_burrow(burrow_name, new_burrow_name);
                     }
                     this.setState({in_edit_name: -1})
                  }}/>
            const edit_name_link = in_edit_name === burrow_name || selected_burrow !== burrow_name ? '' : <EditNameLink
               onClick={e => this.setState({in_edit_name: burrow_name})}>
               {"edit"}
            </EditNameLink>
            const burrow_dirname = FractoUtil.get_dirname_slug(burrow_name);
            const burrow_editor = burrow_name !== selected_burrow ? '' : <BurrowEdit
               burrow_dirname={burrow_dirname}/>
            return <BurrowRow>
               {display_name}
               {edit_name_link}
               {burrow_editor}
            </BurrowRow>
         })
      const burrows_syle = {width: `${width_px - 70}px`}
      return [
         title_bar,
         main_link,
         discover_modal,
         <BurrowsWrapper
            style={burrows_syle}>
            {burrows}
         </BurrowsWrapper>
      ]
   }
}

export default BurrowCollection;
