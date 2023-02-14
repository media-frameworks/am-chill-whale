import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";

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

export class CoolTabs extends Component {

   static propTypes = {
      tab_data: PropTypes.array.isRequired,
      style: PropTypes.object,
      initial_selection: PropTypes.number
   }

   static defaultProps = {
      style: {},
      initial_selection: 0
   }

   componentDidMount() {
      const {initial_selection} = this.props;
      this.setState({selected_index: initial_selection})
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      // const {selected_index} = this.state;
      // const {initial_selection} = this.props;
      // if (selected_index !== initial_selection) {
      //    this.setState({selected_index: initial_selection})
      // }
   }

   state = {
      selected_index: 0
   }

   render() {
      const {selected_index} = this.state;
      const {tab_data, style} = this.props;
      const all_tabs = tab_data.map((tab, i) => {
         return i !== selected_index ?
            <TabSpan onClick={e => this.setState({selected_index: i})}>{tab.label}</TabSpan> :
            <TabSpanSelected>{tab.label}</TabSpanSelected>
      })
      return [
         <TabsWrapper style={style}>{all_tabs}</TabsWrapper>,
         <CardWrapper style={style}>{tab_data[selected_index].content}</CardWrapper>
      ]
   }
}

export default CoolTabs;
