import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../app/AppImports";
import FractoUtil from "../fracto/FractoUtil";

const PATTERN_COUNT = 64;

const ColorBar = styled(AppStyles.InlineBlock)`
   border: 0.15rem solid #888888;
   color: white;
   font-size: 0.75rem;
   text-shadow: 0.125rem 0.125rem 0.25rem rgba(0,0,0,0.95);
   margin-right: 2px;
   margin-bottom: 2px;
   border-radius: 0.25rem;
   height: 12px;
   padding: 3px;
   line-height: 12px;
`;

const SortPatternBar = styled(AppStyles.InlineBlock)`
   margin: 0.25rem 0.5rem;
   font-style: italic;   
   font-size: 0.85rem;
`;

const LinkText = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   margin-left: 0.125rem;
   &: hover{
      color: ${AppColors.HSL_COOL_BLUE};
   }
`;

export class FractonePatternBar extends Component {

   static propTypes = {
      instrument_data: PropTypes.array.isRequired
   }

   state = {
      patterns: {},
      sort_by: "pattern",
   }

   componentDidMount() {
      const {instrument_data} = this.props;
      const patterns = FractonePatternBar.fill_patterns(instrument_data)
      this.setState({patterns: patterns})
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {instrument_data} = this.props;
      if (prevProps.instrument_data !== instrument_data) {
         const patterns = FractonePatternBar.fill_patterns(instrument_data)
         this.setState({patterns: patterns})
         this.forceUpdate();
      }
   }

   static fill_patterns = (instrument_data) => {
      let patterns = {};
      const width = Object.keys(instrument_data).length;
      for (let img_x = 0; img_x < width; img_x++) {
         const column = instrument_data[img_x];
         for (let img_y = 0; img_y < column.length; img_y++) {
            const pixel = column[img_y];
            if (!pixel[0]) {
               continue;
            }
            const pattern_index = `_${pixel[0]}`;
            if (!patterns[pattern_index]) {
               patterns[pattern_index] = 1
            } else {
               patterns[pattern_index] += 1
            }
         }
      }
      return patterns
   }

   render() {
      const {patterns, sort_by} = this.state;

      const sort_choice = <SortPatternBar>
         sort by:
         <LinkText onClick={e => this.setState({sort_by: "pattern"})}>pattern</LinkText>,
         <LinkText onClick={e => this.setState({sort_by: "quantity"})}>quantity</LinkText>
      </SortPatternBar>

      const pattern_bar = Object.keys(patterns).map(key => {
         const pattern = key.replaceAll('_', '');
         return {pattern: parseInt(pattern), count: parseInt(patterns[key])}
      })
         .filter(obj => obj.pattern > 0)
         .sort((a, b) => sort_by === "pattern" ? a.pattern - b.pattern : b.count - a.count)
         .slice(0, PATTERN_COUNT)
         .map(obj => {
            const width = Math.round(obj.count / 150);
            const label = width > 12 ? obj.pattern : '';
            const style = {
               width: `${width}px`,
               backgroundColor: FractoUtil.fracto_pattern_color(obj.pattern, 1000)
            }
            return <ColorBar
               key={`color_${obj.pattern}`}
               style={style}
               title={obj.pattern}>
               {label}
            </ColorBar>
         });

      return [pattern_bar, sort_choice]
   }

}

export default FractonePatternBar;
