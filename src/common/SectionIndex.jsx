import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAngleRight} from '@fortawesome/free-solid-svg-icons'
import {faAngleDown} from '@fortawesome/free-solid-svg-icons'

import {AppStyles} from "../app/AppImports";
<<<<<<< HEAD
=======
import StoreS3, {S3_PREFIX} from "./StoreS3";
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe

export const NO_SELECTION = "None";
export const SECTION_WIDTH_PCT = 15;

const IndexWrapper = styled.div`
    position: fixed;
    left: 0;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    bottom: 0;
    right: ${100 - SECTION_WIDTH_PCT}%;
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
      selected_index: PropTypes.string.isRequired,
      on_select_index: PropTypes.func.isRequired,
      selected_content: PropTypes.array.isRequired
   }

   render() {
      const {index, title, selected_index, on_select_index, selected_content} = this.props;
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
      return <IndexWrapper>
         <TitleWrapper>
            <IndexTitle>{title}</IndexTitle>
         </TitleWrapper>
         {entries}
      </IndexWrapper>
   }
}

export default SectionIndex;
