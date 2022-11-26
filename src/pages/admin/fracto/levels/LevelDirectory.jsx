import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";

import {MAX_LEVEL, get_level_cells} from "../FractoData";
import {render_title_bar, render_main_link} from "../FractoStyles";
import LevelTiles from "./LevelTiles";
import LevelIndexTiles from "./LevelIndexTiles";

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

const LevelSummaryInfo = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   font-size: 0.90rem;
   vertical-align: top;
   color: rgba(0,0,0,0.65);
   margin-left: 0.25rem;
   margin-top: 0.25rem;
`;

const TilesWrapper = styled(AppStyles.Block)`
   margin: 0 0.5rem 1rem;
`;

const LevelContentWrapper = styled(AppStyles.Block)`
   margin: 0 1rem;
`;

const LinkBlock = styled(AppStyles.Block)`
   margin: 0;
`;

export class LevelDirectory extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      selected_level: 2,
      index_mode: false
   }

   render() {
      const {selected_level, index_mode} = this.state;
      const title_bar = render_title_bar("Dante's Sherpa");
      let scope_summary = ['', ''];
      for (let i = 2; i < MAX_LEVEL; i++) {
         const marker = selected_level === i ? <SelectedMarker/> : <NotSelectedSpace/>
         const cells = get_level_cells (i);
         const index_link = render_main_link("index tiles", e => this.setState({index_mode: true}));
         const tiles_viewer = selected_level !== i ? '' :
            <TilesWrapper>
               <LinkBlock>{index_link}</LinkBlock>
               <LevelTiles key={`level_${i}`} cells={cells}/>
            </TilesWrapper>
         const tiles_count = cells.length;
         const points_count = tiles_count > 500 ?
            `${Math.round(tiles_count / 1.6) / 10}M` : `${tiles_count * Math.pow(2, 6)}K`;
         const wrapper_style = {backgroundColor: selected_level !== i ? "#dddddd" : "white"}
         scope_summary.push([
            <LevelSummaryWrapper
               style={wrapper_style}
               onClick={e => this.setState({selected_level: i})}>
               {marker}
               <LevelTitleLink>{`level ${i}`}</LevelTitleLink>
               <LevelSummaryInfo>{`${tiles_count} tiles (${points_count} points)`}</LevelSummaryInfo>
            </LevelSummaryWrapper>,
            <LevelContentWrapper>{tiles_viewer}</LevelContentWrapper>
         ])
      }
      const index_modal = !index_mode ? '' : <LevelIndexTiles
         level={selected_level}
         on_response_modal={result => this.setState({index_mode: false}) }
      />
      return [
         title_bar,
         scope_summary,
         index_modal
      ]
   }

}

export default LevelDirectory;
