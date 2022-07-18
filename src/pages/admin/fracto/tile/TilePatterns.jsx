import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import StoreS3 from "common/StoreS3";
import FractoUtil from "../FractoUtil";

const PatternWrapper = styled(AppStyles.InlineBlock)`
   margin: 0.5rem 0;
`;

const FamilyRow = styled(AppStyles.Block)`
   margin: 0;
   height: 16px;
   font-size: 12px;
`;

const FamilyBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   ${AppStyles.monospace}
   ${AppStyles.centered}
   ${AppStyles.align_top}
   width: 24px;
   font-color: #444444;
`;

const AllPatternsBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   ${AppStyles.align_top}
   font-size: 12px;
   color: #888888;
   margin-left: 0.25rem;
   margin-top: 1px;
`;

const PatternColorBlock = styled(AppStyles.InlineBlock)`
   height: 14px;
   border: 1px solid #444444;
`;

export class TilePatterns extends Component {

   static propTypes = {
      short_code: PropTypes.string.isRequired,
   }

   state = {
      tile_data: {},
      all_families: {},
      zero_amount: 0,
      loading: true
   }

   componentDidMount() {
      this.load_tile()
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {short_code} = this.props;
      if (short_code !== prevProps.short_code) {
         this.setState({loading: true})
         this.load_tile()
      }
   }

   load_tile = () => {
      const {short_code} = this.props;
      const json_name = `tiles/256/json/${short_code}.json`;
      StoreS3.get_file_async(json_name, "fracto", json_str => {
         // console.log(`tile_data for ${json_name}`, json_str)
         const tile_data = JSON.parse(json_str);
         const family_list = this.combine_families(tile_data)
         this.setState({
            tile_data: tile_data,
            family_list: family_list,
            loading: false
         })
      });
   }

   combine_families = (tile_data) => {

      let all_patterns = {};
      tile_data.all_points.forEach(p => {
         if (p.img_x > 255 || p.img_y > 255) {
            return;
         }
         const pattern_key = `_${p.pattern}`;
         if (!all_patterns[pattern_key]) {
            all_patterns[pattern_key] = 1;
         } else {
            all_patterns[pattern_key] += 1;
         }
      });

      let all_families = {}
      let zero_amount = 0;
      Object.keys(all_patterns).forEach(pattern_key => {
         const pattern = parseInt(pattern_key.replace('_', ''));
         const family = FractoUtil.fracto_pattern_family(pattern)
         const family_key = `_${family}`;
         if (!all_families[family_key]) {
            all_families[family_key] = [];
         }
         all_families[family_key].push({
            pattern: pattern,
            amount: all_patterns[pattern_key]
         })
         if (family === 0) {
            zero_amount = all_patterns[pattern_key]
         }
      });
      this.setState({zero_amount: zero_amount})

      const family_list = Object.keys(all_families).map(key => {
         const family = parseInt(key.replace('_', ''));
         let total_amount = 0;
         const pattern_list = all_families[key].map(member => {
            total_amount += member.amount;
            return member.pattern;
         }).sort((a, b) => a - b);
         return {
            family: family,
            all_patterns: pattern_list.join(', '),
            total_amount: total_amount
         }
      });

      return family_list;
   }

   render() {
      const {loading, family_list, zero_amount} = this.state;
      const nonzero_amount = 256 * 256 - zero_amount;
      const rendered_families = loading ? 'loading...' :
         family_list
            .sort((a, b) => b.total_amount - a.total_amount)
            .slice(0, 20)
            .sort((a, b) => a.family - b.family).map(f => {
            if (f.family < 1) {
               return ''
            }
            const color_block_style = {
               width: `${f.total_amount * 256 / nonzero_amount}px`,
               backgroundColor: FractoUtil.fracto_pattern_color(f.family, 255)
            }
            return <FamilyRow title={`${f.total_amount} points`}>
               <FamilyBlock>{f.family}</FamilyBlock>
               <PatternColorBlock style={color_block_style}/>
               <AllPatternsBlock>{`(${f.all_patterns})`}</AllPatternsBlock>
            </FamilyRow>
         })
            .slice(0, 17)
      return <PatternWrapper>{rendered_families}</PatternWrapper>
   }
}

export default TilePatterns;
