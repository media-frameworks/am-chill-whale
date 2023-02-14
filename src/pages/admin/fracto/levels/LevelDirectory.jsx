import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import CoolTabs from "common/cool/CoolTabs";

import {MAX_LEVEL} from "../FractoData";
import {render_title_bar} from "../FractoStyles";

import LevelTools from "./LevelTools";
import LevelStats from "./LevelStats";

const LevelTitleLink = styled.span`
   ${AppStyles.uppercase}
   ${AppStyles.monospace}
   ${AppStyles.pointer}
   font-size: 1.25rem;
   &:hover {
      ${AppStyles.underline}
   }
`;

const LevelSummaryWrapper = styled(AppStyles.Block)`
   ${AppStyles.noselect}
   ${AppStyles.pointer}
   margin: 0.25rem 1rem;
`;

const NotSelectedSpace = styled(AppStyles.InlineBlock)`
   width: 1rem;
   height: 1rem;
`;

const SelectedMarker = styled(AppStyles.InlineBlock)`
   width: 0.25rem;
   height: 0.25rem;
   margin: 0.25rem;
   margin-top: 0.35rem;
   border: 0.15rem solid #444444;
   border-radius: 0.25rem;
   background-color: #cccccc;
`;

const LevelContentWrapper = styled(AppStyles.Block)`
   margin: 0 1rem 0.5rem;
`;

export class LevelDirectory extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      selected_level: 2,
      selected_tab: "stats"
   }

   componentDidMount() {
      const selected_level = parseInt (localStorage.getItem("selected_level", '2'));
      this.level_selected(selected_level);
   }

   level_selected = (level) => {
      localStorage.setItem("selected_level", `${level}`)
      const storage_key = `level_${level}_selected_tab`
      const selected_tab = localStorage.getItem(storage_key, "stats");
      this.setState({
         selected_level: level,
         selected_tab: selected_tab
      });
   }

   select_tab = (tab) => {
      const {selected_level} = this.state;
      this.setState({selected_tab: tab})
      const storage_key = `level_${selected_level}_selected_tab`
      localStorage.setItem(storage_key, tab)
   }

   render() {
      const {selected_level, selected_tab} = this.state;
      const {width_px} = this.props;
      const title_bar = render_title_bar("Dante's Sherpa");
      let scope_summary = ['', ''];
      for (let i = 2; i < MAX_LEVEL; i++) {
         const marker = selected_level === i ? <SelectedMarker/> : <NotSelectedSpace/>
         const level_tabs = selected_level !== i ? '' : <LevelContentWrapper>
            <CoolTabs
               style={{width: "32rem", marginLeft: "1rem"}}
               tab_data={[
                  {label: "stats", content: [<LevelStats level={i}/>]},
                  {
                     label: "tools",
                     content: <LevelTools level={i} width_px={width_px}/>
                  },
               ]}
               selected_tab={selected_tab}
               on_tab_select={tab => this.select_tab(tab)}
            />
         </LevelContentWrapper>

         const wrapper_style = {backgroundColor: selected_level !== i ? "#dddddd" : "white"}
         scope_summary.push([
            <LevelSummaryWrapper
               style={wrapper_style}
               onClick={e => this.level_selected(i)}>
               {marker}
               <LevelTitleLink>{`level ${i}`}</LevelTitleLink>
            </LevelSummaryWrapper>,
            level_tabs
         ])
      }
      return [
         title_bar,
         scope_summary,
      ]
   }

}

export default LevelDirectory;
