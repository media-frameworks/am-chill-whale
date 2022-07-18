import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import BailiwickPoints from "./BailiwickPoints";

const TAB_INDEX_IMAGES = 0;
const TAB_INDEX_POINTS = 1;
const TAB_INDEX_TOOLS = 2;
const TAB_INDEX_META = 3;

const BAILIWICK_EDIT_TABS = [
   {
      label: "images",
   },
   {
      label: "points"
   },
   {
      label: "tools"
   },
   {
      label: "meta"
   },
];

const TabsWrapper = styled(AppStyles.Block)`
   margin: 0;
`;

const CardWrapper = styled(AppStyles.Block)`
   border: 0.15rem solid #aaaaaa;
   border-radius: 0 0.25rem 0.25rem 0.25rem;
   min-height: 12.25rem;
   min-width: 20rem;
   margin-top: -2px;
   padding: 0.5rem
`;

const TabSpan = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   ${AppStyles.pointer}
   color: #eeeeee;
   background-color: #bbbbbb;
   padding: 0 0.5rem;
`;

const TabSpanSelected = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   color: #444444;
   padding: 0 0.5rem;
   border: 0.15rem solid #aaaaaa;
   border-radius: 0.25rem 0.25rem 0 0;
   border-bottom: 0;
   background-color: white;
   z-index: 100;
`;

export class BailiwickEditTabs extends Component {

   static propTypes = {
      bailiwick_data: PropTypes.object.isRequired,
   }

   state = {
      selected_index: 0
   }

   render() {
      const {selected_index} = this.state;
      const {bailiwick_data} = this.props;
      const all_tabs = BAILIWICK_EDIT_TABS.map((tab, i) => {
         return i !== selected_index ?
            <TabSpan onClick={e => this.setState({selected_index: i})}>{tab.label}</TabSpan> :
            <TabSpanSelected>{tab.label}</TabSpanSelected>
      })
      let card_content = [selected_index];
      switch (selected_index){
         case TAB_INDEX_POINTS:
            card_content = <BailiwickPoints bailiwick_data={bailiwick_data} />
            break;

         case TAB_INDEX_IMAGES:
         case TAB_INDEX_TOOLS:
         case TAB_INDEX_META:
         default:
            break;
      }

      return [
         <TabsWrapper>{all_tabs}</TabsWrapper>,
         <CardWrapper>{card_content}</CardWrapper>
      ]
   }

}

export default BailiwickEditTabs;
