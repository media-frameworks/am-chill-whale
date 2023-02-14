import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";

import AdminFracto from "../../AdminFracto";

const LeftBlock = styled(AppStyles.Block)`
   margin: 0.25rem 1rem 0 0;
`;

const StatPrompt = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   ${AppStyles.bold}
   ${AppStyles.align_right}
   font-size: 1rem;
   line-height: 1.125rem;
   width: 5rem;
   margin: 0.125rem 0.5rem;
   color: #666666;
`;

const StatValue = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   ${AppStyles.bold}
   ${AppStyles.align_middle}
   font-size: 1.125rem;
   padding-top: 0.25rem;
   color: black;
   line-height: 1.125rem;
`;

const StatBar = styled(AppStyles.InlineBlock)`
   height: 1.125rem;
   border: 0.125rem solid black;
   margin: 0 0.25rem 0 0;
   opacity: 0.5;
`;

const STATS_COLORS = {
   "indexed": "blue",
   "complete": "green",
   "ready": "yellow",
   "inland": "orange",
   "new": "white",
   "empty": "grey",
}

export class LevelStats extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
   }

   state = {
      stats_loaded: false,
      max_value: 0,
      total_tiles: 0
   }

   componentDidMount() {
      const {level} = this.props;
      let max_value = 0;
      let total_tiles = 0;
      const interval = setInterval(() => {
         if (AdminFracto.bin_counts["indexed"]) {
            Object.keys(STATS_COLORS).forEach(key => {
               if (AdminFracto.bin_counts[key][level] > max_value) {
                  max_value = AdminFracto.bin_counts[key][level];
               }
               total_tiles += AdminFracto.bin_counts[key][level]
            })
            this.setState({
               stats_loaded: true,
               max_value: max_value,
               total_tiles: total_tiles
            })
            clearInterval(interval)
         }
      }, 500)
   }

   render() {
      const {stats_loaded, max_value, total_tiles} = this.state;
      const {level} = this.props;
      const totals = !stats_loaded ? '' : Object.keys(STATS_COLORS).map(key => {
         const bar_style = {
            width: `${20 * AdminFracto.bin_counts[key][level] / max_value}rem`,
            backgroundColor: STATS_COLORS[key]
         }
         return <LeftBlock>
            <StatPrompt>{key}:</StatPrompt>
            <StatBar style={bar_style}/>
            <StatValue>{AdminFracto.bin_counts[key][level]}</StatValue>
         </LeftBlock>
      })
      const overall_total = <LeftBlock>
         <StatPrompt>total tiles:</StatPrompt>
         <StatValue>{total_tiles}</StatValue>
      </LeftBlock>
      return [
         overall_total,
         totals
      ]
   }
}

export default LevelStats;
