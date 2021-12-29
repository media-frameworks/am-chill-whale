import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {undo_icon} from "./CoolIcons"

import {Editor} from 'react-draft-wysiwyg';
import {EditorState, ContentState, convertFromHTML} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './cool.css';
import {AppStyles, AppColors} from "../../app/AppImports";

const IconWrapper = styled.div`
    ${AppStyles.inline};
    ${AppColors.COLOR_COOL_BLUE};
    height: 1.5rem;
    vertical-align: middle;
`;

export class CoolEditor extends Component {

   static propTypes = {
      html: PropTypes.string.isRequired,
      on_update: PropTypes.func.isRequired,
   }

   static defaultProps = {
      value: ""
   }

   state = {
      editorState: null,
   };

   componentDidMount() {
      const {html} = this.props;

      const blocksFromHTML = convertFromHTML(html);
      const content_state = ContentState.createFromBlockArray(
         blocksFromHTML.contentBlocks,
         blocksFromHTML.entityMap,
      );
      const editorState = EditorState.createWithContent(content_state);
      console.log("componentDidMount createWithContent returns", editorState);

      const exported = stateToHTML(content_state);
      console.log("componentDidMount exported", exported);

      this.setState({editorState: editorState});
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {editorState} = this.state;
      const contentState = editorState.getCurrentContent();
      console.log("componentDidUpdate content", contentState);

      const exported = stateToHTML(contentState);
      console.log("componentDidUpdate called", exported)
   }

   onEditorStateChange = (editorState) => {
      const {on_update} = this.props;
      console.log("onEditorStateChange editorState", editorState)
      this.setState({
         editorState: editorState
      });

      const contentState = editorState.getCurrentContent();
      console.log("onEditorStateChange content", contentState);

      const exported = stateToHTML(contentState);
      console.log("onEditorStateChange exported", exported);

      on_update(exported);
   };

   render() {
      const {editorState} = this.state;
      const toolbar = {
         options: ['inline', 'blockType', 'colorPicker', 'history'],
         inline: {
            options: ['bold', 'italic', 'underline', 'monospace'],
            bold: {className: "toolbar-element"},
            italic: {className: "toolbar-element"},
            underline: {className: "toolbar-element"},
            monospace: {className: "toolbar-element"},
         },
         blockType: {className: "toolbar-element"},
         colorPicker: {className: "toolbar-element"},
         history: {
            className: "toolbar-element",
            undo: {className: "history-button"},
            redo: {className: "history-button"},
         },
      };
      const editor_style = {
         margin: 0,
         paddingLeft: "0.25rem",
         fontSize: "1rem",
         lineHeight: 0
      };
      const editor_state = editorState ? editorState : EditorState.createEmpty()
      return <Editor
         editorState={editor_state}
         toolbarClassName={"editor-toolbar"}
         editorStyle={editor_style}
         toolbar={toolbar}
         onEditorStateChange={editorState => {
            this.onEditorStateChange(editorState);
         }}
      />
   }
}

export default CoolEditor;
