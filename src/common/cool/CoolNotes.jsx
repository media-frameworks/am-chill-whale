import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles} from "../../app/AppImports";
import CoolEditor from './CoolEditor';

const COOLNOTES_CODE_FANCY_EDIT = 10001;
const COOLNOTES_CODE_REGULAR_EDIT = 10002;

const RegularText = styled.span`
   ${AppStyles.pointer};
   color: #444444;   
   font-size: 1rem;
   padding: 0 0.25rem;
`;

const PromptText = styled.span`
   ${AppStyles.pointer};
   color: #aaaaaa;   
   font-size: 1rem;
   font-style: italic;
   padding: 0 0.25rem;
`;

export class CoolNotes extends Component {

   static propTypes = {
      value: PropTypes.string,
      style_extra: PropTypes.object,
      placeholder: PropTypes.string,
      on_update_props: PropTypes.func.isRequired,
      editor_type: PropTypes.oneOf(['regular', 'fancy'])
   }

   static defaultProps = {
      style_extra: {},
      placeholder: "use your words",
      editor_type: "regular",
      value: ""
   }

   state = {
      current_value: this.props.value,
      input_ref: React.createRef(),
      edit_mode: false
   };

   static edit_owner = null;

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      const fancy_edit = segment_data.props && segment_data.props.editor_type === 'fancy' ?
         {label: "regular edit", code: COOLNOTES_CODE_REGULAR_EDIT} :
         {label: "fancy edit", code: COOLNOTES_CODE_FANCY_EDIT};
      return [
         fancy_edit,
      ];
   }

   static on_menu_select = (code, segment_data) => {
      console.log("on_menu_select", code)
      switch (code) {
         case COOLNOTES_CODE_FANCY_EDIT:
            segment_data.props.editor_type = 'fancy';
            return true;
         case COOLNOTES_CODE_REGULAR_EDIT:
            segment_data.props.editor_type = 'regular';
            return true;
         default:
            return false;
      }
   }

   key_handler = (key) => {
      const {input_ref} = this.state;
      const {value, on_update_props} = this.props;
      if (CoolNotes.edit_owner !== this) {
         return;
      }
      if (key.code === "Escape") {
         document.removeEventListener("keydown", this.key_handler);
         on_update_props({value: value});
         this.setState({edit_mode: false});
      }
      if (key.code === "Enter" || key.code === "NumpadEnter") {
         document.removeEventListener("keydown", this.key_handler);
         if (input_ref.current) {
            on_update_props({value: input_ref.current.value});
            this.setState({edit_mode: false});
         }
      }
   }

   focusout_handler = (evt) => {
      const {input_ref} = this.state;
      const {on_update_props} = this.props;
      if (CoolNotes.edit_owner !== this) {
         return;
      }
      if (input_ref.current) {
         console.log("focusout_handler")
         on_update_props({value: input_ref.current.value});
      }
   }

   go_to_edit = () => {
      if (CoolNotes.edit_owner) {
         document.removeEventListener("keydown", CoolNotes.edit_owner.key_handler);
         document.removeEventListener("focusout", CoolNotes.edit_owner.focusout_handler);
         CoolNotes.edit_owner.setState({edit_mode: false})
      }
      CoolNotes.edit_owner = this;
      document.addEventListener("keydown", this.key_handler);
      document.addEventListener("focusout", this.focusout_handler);

      this.setState({edit_mode: true})
   }

   render() {
      const {input_ref, current_value, edit_mode} = this.state;
      const {placeholder, style_extra, editor_type, value} = this.props;
      if (!edit_mode) {
         return value ? <RegularText onClick={e => this.go_to_edit()}>{value}</RegularText> :
            <PromptText onClick={e => this.go_to_edit()}>click to begin</PromptText>
      }
      style_extra["minHeight"] = "1.125rem";
      switch (editor_type) {
         case "regular" : {
            return <AppStyles.InputTextArea
               ref={input_ref}
               autoFocus
               size={current_value.length}
               style={style_extra}
               value={current_value}
               rows={"auto"}
               cols={current_value.length + 5}
               onChange={e => this.setState({current_value: e.target.value})}
               placeholder={placeholder}/>
         }
         case "fancy":
            return <CoolEditor />

         default:
            return [];
      }
   }
}

export default CoolNotes;
