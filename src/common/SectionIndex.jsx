import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAngleRight} from '@fortawesome/free-solid-svg-icons'
import {faAngleDown} from '@fortawesome/free-solid-svg-icons'

import {AppStyles} from "../app/AppImports";
import CoolSplitter, {SPLITTER_TYPE_VERTICAL} from "./cool/CoolSplitter";

export const NO_SELECTION = "None";
export const SECTION_WIDTH_PCT = 15;

const IndexWrapper = styled.div`
    position: fixed;
    left: 0;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    bottom: 0;
    background-color: #eeeeee;
    border-right: 0.15rem solid #bbbbbb;
`;

const TitleWrapper = styled.div`
    ${AppStyles.block}
    ${AppStyles.underline}
    padding: 1rem 0.5rem;            
`;

const IndexTitle = styled.span`
    ${AppStyles.noselect}
    font-size: 1.125rem;
    font-weight: bold;
    color: #666666;
`;

const IndexEntry = styled.div`
    ${AppStyles.block}
    ${AppStyles.noselect}
    ${AppStyles.pointer}
    font-size: 1rem;
    margin-left: 0.75rem;
    margin-bottom: 0.5rem;
    color: #666666;
`;

const EntryBasic = css`
    font-size: 1.125rem;
    margin-left: 0.25rem;
    color: #666666;
    vertical-align: top;
`;

const EntryName = styled.div`
    ${AppStyles.inline_block}
    ${EntryBasic}
`;

const EntryIcon = styled.div`
    ${AppStyles.inline_block}
    ${EntryBasic}
    margin-top: 0.125rem;
    width: 0.75rem;
`;

export class SectionIndex extends Component {

   static propTypes = {
      index: PropTypes.array.isRequired,
      title: PropTypes.string.isRequired,
      width_px: PropTypes.number.isRequired,
      selected_index: PropTypes.string.isRequired,
      on_select_index: PropTypes.func.isRequired,
      on_resize: PropTypes.func.isRequired,
      selected_content: PropTypes.array.isRequired
   }

   state = {
      section_ref: React.createRef(),
      section_bounds: {height: 0}
   }

   componentDidMount() {
      const {section_ref} = this.state;
      const section_bounds = section_ref.current.getBoundingClientRect()
      this.setState({section_bounds: section_bounds})
   }

   on_change = (pos) => {
      const {on_resize} = this.props;
      on_resize(pos);
   }

   render() {
      const {section_ref, section_bounds} = this.state;
      const {index, title, width_px, selected_index, on_select_index, selected_content} = this.props;
      const entries = index.sort((a, b) => a.title > b.title ? 1 : -1)
         .map(entry => {
            const isSelected = selected_index === entry.title;
            const icon = isSelected ? <FontAwesomeIcon icon={faAngleDown}/> : <FontAwesomeIcon icon={faAngleRight}/>
            return <IndexEntry
               key={`index_entry_${entry.key}`}>
               <EntryIcon onClick={e => on_select_index(entry.title)}>{icon}</EntryIcon>
               <EntryName onClick={e => on_select_index(entry.title)}>{entry.title}</EntryName>
               {isSelected ? selected_content : []}
            </IndexEntry>
         });
      const index_style = {width: `${width_px}px`}
      return [
         <IndexWrapper
            ref={section_ref}
            style={index_style}>
            <TitleWrapper>
               <IndexTitle>{title}</IndexTitle>
            </TitleWrapper>
            {entries}
         </IndexWrapper>,
         <CoolSplitter
            type={SPLITTER_TYPE_VERTICAL}
            name={"section-index"}
            bar_width_px={5}
            container_bounds={section_bounds}
            position={width_px}
            on_change={pos => this.on_change(pos)}
         />
      ]
   }
}

export default SectionIndex;
