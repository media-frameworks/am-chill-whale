import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";

import {MAX_LEVEL, get_level_cells} from "../FractoData";
import LevelTiles from "./LevelTiles";

const TitleBar = styled(AppStyles.Block)`
   background: linear-gradient(120deg, #999999, #eeeeee);
   height: 1.25rem;
   width: 100%;
   border-bottom: 0.15rem solid #666666;
`;

const TitleSpan = styled.span`
   ${AppStyles.uppercase}
   ${AppStyles.noselect}
   ${AppStyles.bold}
   font-size: 1.25rem;
   letter-spacing: 0.75rem;
   margin-left: 1rem;
   color: white;
   text-shadow: 0.01rem 0.01rem 0.2rem black;
`;

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

const UpstanWrapper = styled(AppStyles.Block)`
   ${AppStyles.bold}
   color: #666666;
   margin: 0 1rem;
`;

const UpstanLink = styled.span`
   ${AppStyles.link}
   ${AppStyles.COOL_BLUE_TEXT}
   padding: 0 0.25rem;
   font-size: 0.85rem;
`;

const LevelContentWrapper = styled(AppStyles.Block)`
   margin: 0 1rem;
`;

export class LevelDirectory extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      selected_level: 2
   }

   render() {
      const {selected_level} = this.state;
      const title_bar = <TitleBar><TitleSpan>Dante's Sherpa</TitleSpan></TitleBar>
      let scope_summary = ['', ''];
      for (let i = 2; i < MAX_LEVEL; i++) {
         const marker = selected_level === i ? <SelectedMarker/> : <NotSelectedSpace/>
         const cells = get_level_cells (i);
         const tiles_viewer = selected_level !== i ? '' :
            <TilesWrapper>
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
            <LevelContentWrapper>{[
               tiles_viewer
            ]}</LevelContentWrapper>
         ])
      }
      return [title_bar, scope_summary]
   }

}

export default LevelDirectory;
