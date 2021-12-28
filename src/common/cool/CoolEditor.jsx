import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
// import styled from "styled-components";

import {Editor} from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './cool.css';

export class CoolEditor extends Component {

   static propTypes = {
      value: PropTypes.string,
   }

   static defaultProps = {
      value: ""
   }

   state = {
      editorState: EditorState.createEmpty(),
   };

   onEditorStateChange: Function = (editorState) => {
      console.log("onEditorStateChange",editorState)
      this.setState({
         editorState: editorState
      });
   };

   render() {
      const { editorState } = this.state;
      const toolbar = {
         options: ['inline', 'blockType', 'fontSize'],
         inline: {
            options: ['bold', 'italic', 'underline', 'monospace'],
            bold: {className: "toolbar-element"},
            italic: {className: "toolbar-element"},
            underline: {className: "toolbar-element"},
            monospace: {className: "toolbar-element"},
         },
         blockType: {className: "toolbar-element"},
         fontSize: {className: "toolbar-element"},
         link: {
            className: "toolbar-element",
            link: {className: "toolbar-links"},
            unlink: {className: "toolbar-links"},
         }
      };
      const editor_style = {
         margin: 0,
         paddingLeft: "0.25rem",
         fontSize: "1rem",
         lineHeight: 0
      };
      return <Editor
         editorState={editorState}
         toolbarClassName={"editor-toolbar"}
         editorStyle={editor_style}
         toolbar={toolbar}
         value={"test test"}
      />
   }
}

export default CoolEditor;
