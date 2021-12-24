import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {Editor} from 'react-draft-wysiwyg';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import {AppStyles} from "../../app/AppImports";

const RegularText = styled.div`
   ${AppStyles.block};
   ${AppStyles.pointer};
   color: #444444;   
   font-size: 1rem;
   margin: 0.5rem 0 0;
`;

export class CoolNotes extends Component {

   static propTypes = {
      value: PropTypes.string.isRequired,
      style_extra: PropTypes.object,
      placeholder: PropTypes.string,
      on_update: PropTypes.func.isRequired,
      editor_type: PropTypes.oneOf(['regular', 'fancy'])
   }

   static defaultProps = {
      style_extra: {},
      placeholder: "use your words",
      value: "",
      editor_type: "regular"
   }

   state = {
      current_value: this.props.value,
      input_ref: React.createRef(),
      edit_mode: false
   };

   componentDidMount() {
      const {input_ref} = this.state;
      const {value, on_update} = this.props;
      const key_handler = (key) => {
         if (key.code === "Escape") {
            document.removeEventListener("keydown", key_handler);
            on_update({value: value});
         }
         if (key.code === "Enter" || key.code === "NumpadEnter") {
            document.removeEventListener("keydown", key_handler);
            if (input_ref.current) {
               on_update({value: input_ref.current.value});
            }
         }
      }
      document.addEventListener("keydown", key_handler);
   }

   render() {
      const {input_ref, current_value, edit_mode} = this.state;
      const {placeholder, style_extra, editor_type, value} = this.props;
      console.log("value",value)
      if (!edit_mode) {
         return <RegularText onClick={e => this.setState({edit_mode: true})}>
            {value ? value : <i>click to begin</i>}
         </RegularText>
      }
      switch (editor_type) {
         case "regular" : {
            return <AppStyles.InputTextArea
               ref={input_ref}
               autoFocus
               size={current_value.length}
               style={style_extra}
               value={current_value}
               rows={5}
               cols={40}
               onChange={e => this.setState({current_value: e.target.value})}
               placeholder={placeholder}/>
         }
         default:
            return [];
      }
   }
}

export default CoolNotes;
