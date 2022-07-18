import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";

import {LEVEL_SCOPES} from "./FractoData";
import FractoTiles from "./FractoTiles";

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

export class FractoChaosLab extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      selected_level: 2
   }

   componentDidMount() {

   }

   render() {
      const {selected_level} = this.state;
      const title_bar = <TitleBar><TitleSpan>Chaos lab</TitleSpan></TitleBar>
      const scope_summary = LEVEL_SCOPES.map((level, i) => {
         if (i < 2) {
            return '';
         }
         const marker = selected_level === i ? <SelectedMarker/> : <NotSelectedSpace/>
         const tiles_viewer = selected_level !== i ? '' :
            <TilesWrapper>
               <FractoTiles key={`level_${i}`} cells={LEVEL_SCOPES[i].cells}/>
            </TilesWrapper>
         const tiles_count = LEVEL_SCOPES[i].cells.length;
         const points_count = tiles_count > 500 ?
            `${Math.round(tiles_count / 1.6) / 10}M` : `${tiles_count * Math.pow(2, 6)}K`;
         const wrapper_style = { backgroundColor: selected_level !== i ? "#dddddd" : "white" }
         return <LevelSummaryWrapper
            style={wrapper_style}
            onClick={e => this.setState({selected_level: i})}>
            {marker}
            <LevelTitleLink>{`level ${i}`}</LevelTitleLink>
            <LevelSummaryInfo>{`${tiles_count} tiles (${points_count} points)`}</LevelSummaryInfo>
            {tiles_viewer}
         </LevelSummaryWrapper>
      })
      return [title_bar, scope_summary]
   }

}

export default FractoChaosLab;
