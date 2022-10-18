import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCaretUp, faCaretDown} from '@fortawesome/free-solid-svg-icons';

import {AppStyles} from "app/AppImports";

import FractoLocate from "../FractoLocate";
import {render_pattern_block} from "../FractoStyles";
import FractoUtil from "../FractoUtil";

const HEADER_HEIGHT_PX = 38;
const POINTS_LIST_HEIGHT_PX = 350;
const POINTS_LIST_WIDTH_PX = 500;
export const PATTERN_LIST_WIDTH_REM = 6;
const MAX_POTENTIALS = 5000;
const STEP_TIME_MS = 650;

const PatternRow = styled(AppStyles.Block)`
   ${AppStyles.pointer}
   ${AppStyles.centered}
   padding: 0.125rem 0.25rem;
   &:hover {
      background-color: #dddddd;
   }
`;

const PotentialRow = styled(AppStyles.Block)`
   ${AppStyles.pointer}
   ${AppStyles.ellipsis}
   padding: 0.125rem 0.25rem;
   &:hover {
      background-color: #dddddd;
   }
`;

const PatternsWrapper = styled(AppStyles.InlineBlock)`
   margin-right: 1rem;
   overflow-y: scroll;
   max-height: 256px;
   border: 1px solid #888888;
   border-radius: 0.25rem;
   width: ${PATTERN_LIST_WIDTH_REM}rem;
`;

const PotentialsWrapper = styled(AppStyles.InlineBlock)`
   margin: 0;
`;

const PotentialsList = styled(AppStyles.Block)`
   overflow-y: scroll;
   overflow-x: hidden;
   max-height: ${POINTS_LIST_HEIGHT_PX - HEADER_HEIGHT_PX}px;
   border: 1px solid #888888;
   width: ${POINTS_LIST_WIDTH_PX}px;
   border-radius: 0.25rem;
`;

const PatternDesignation = styled(AppStyles.Block)`
   height: ${HEADER_HEIGHT_PX}px; 
`;

const PointStats = styled(AppStyles.Block)`
   ${AppStyles.italic}
   font-size: 0.85rem;
   color: #aaaaaa;
   width: 400px;
`;

const PatternTitle = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   font-size: 1.125rem;
   color: #444444;
   line-height: 1.25rem;
`;

const PatternShortForm = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   font-size: 0.80rem;
   color: black;
   margin-left: 0.25rem;
   line-height: 1.25rem;
`;

const ListLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   float: right;
   font-size: 0.85rem;
   opacity: 0.5;
   color: #888888;
   margin-right: 0.5rem;
   line-height: 2rem;
   &:hover {
      opacity: 1.0;
   }
`;

export class BailiwickPointSelector extends Component {

   static propTypes = {
      root_pattern: PropTypes.number.isRequired,
      pattern_data: PropTypes.array.isRequired,
      fracto_values: PropTypes.object.isRequired,
      width_px: PropTypes.number.isRequired,
      on_change: PropTypes.func.isRequired,
      filter_region: PropTypes.object.isRequired,
   }

   state = {
      potentials: [],
      selected_pattern: 0,
      selected_potential: 0,
      potentials_list_ref: React.createRef(),
      sort_up: true,
      in_auto_step: false
   }

   componentDidMount() {
      const {pattern_data, fracto_values, width_px} = this.props;
      const potentials = BailiwickPointSelector.index_potentials(pattern_data, fracto_values, width_px, MAX_POTENTIALS);
      this.setState({potentials: potentials})
      document.addEventListener('keydown', this.key_handler);
      setInterval(() => {
         this.test_and_scroll ()
      }, STEP_TIME_MS);
   }

   componentWillUnmount() {
      document.removeEventListener('keydown', this.key_handler);
   }

   test_and_scroll = () => {
      const {in_auto_step, selected_potential, potentials_list_ref} = this.state;
      if (!in_auto_step) {
         return;
      }
      console.log("scrolling now", selected_potential)
      potentials_list_ref.current.scrollTop += 22;
      this.on_change(selected_potential + 1)
   }

   key_handler = (e) => {
      const {potentials, selected_potential, potentials_list_ref} = this.state;
      if (!potentials.length) {
         return;
      }

      if (e.code === "ArrowDown" && selected_potential < potentials.length - 1) {
         potentials_list_ref.current.scrollTop += 22;
         this.on_change(selected_potential + 1)
      }
      if (e.code === "ArrowUp" && selected_potential > 0) {
         potentials_list_ref.current.scrollTop -= 22;
         this.on_change(selected_potential - 1)
      }
      e.preventDefault();
      e.stopPropagation();
   }

   static index_potentials = (data, fracto_values, bailiwick_sample_width_px, max_count = -1) => {
      const increment = fracto_values.scope / bailiwick_sample_width_px;
      const leftmost = fracto_values.focal_point.x - fracto_values.scope / 2;
      const bottommost = fracto_values.focal_point.y - fracto_values.scope / 2;
      let pattern_lists = {};
      for (let img_x = 0; img_x < data.length; img_x++) {
         const column = data[img_x];
         const x = leftmost + increment * img_x;
         for (let img_y = 0; img_y < column.length; img_y++) {
            const y = bottommost + increment * img_y;
            let pixel = column[img_y];
            if (!pixel.length || !pixel[1]) {
               continue;
            }
            const key = `_${pixel[0]}`
            if (!pattern_lists[key]) {
               pattern_lists[key] = [];
            }
            pattern_lists[key].push({
               pattern: pixel[0],
               iterations: pixel[1],
               img_x,
               img_y,
               x: x,
               y: y
            });
         }
      }

      const potentials = Object.keys(pattern_lists).map(key => {
         const max_potentials = max_count === -1 ? pattern_lists[key].length : max_count;
         return {
            pattern: parseInt(key.replace('_', '')),
            values_sort_up: pattern_lists[key]
               .sort((a, b) => a.iterations - b.iterations)
               .slice(0, max_potentials),
            values_sort_down: pattern_lists[key]
               .sort((a, b) => b.iterations - a.iterations)
               .slice(0, max_potentials),
            total: pattern_lists[key].length,
         };
      }).sort((a, b) => a.pattern - b.pattern)

      return potentials;
   }

   on_change = (potantial_index, pattern_index = -1) => {
      const {potentials, selected_pattern, sort_up, potentials_list_ref} = this.state;
      const {root_pattern, on_change} = this.props;
      let values, pattern;
      if (pattern_index === -1) {
         pattern = potentials[selected_pattern].pattern;
         values = sort_up ? potentials[selected_pattern].values_sort_up : potentials[selected_pattern].values_sort_down;
         this.setState({selected_potential: potantial_index})
      } else {
         pattern = potentials[pattern_index].pattern;
         values = sort_up ? potentials[pattern_index].values_sort_up : potentials[pattern_index].values_sort_down;
         potentials_list_ref.current.scrollTop = 0;
         this.setState({
            selected_potential: potantial_index,
            selected_pattern: pattern_index,
         })
      }
      const short_form = FractoUtil.fracto_designation(root_pattern, pattern, true);
      on_change(pattern, short_form, values[potantial_index].x, values[potantial_index].y);
   }

   render() {
      const {potentials, selected_pattern, selected_potential, potentials_list_ref, sort_up, in_auto_step} = this.state;
      const {root_pattern, width_px, filter_region} = this.props;

      if (!potentials.length) {
         return "scanning field, please wait..."
      }

      const patterns_list = potentials.map((pot, i) => {
         const row_style = (selected_pattern !== i) ? {} : {
            backgroundColor: "#666666",
            color: "white"
         }
         return <PatternRow
            style={row_style}
            onClick={e => this.on_change(0, i)}>
            {render_pattern_block(pot.pattern)}
         </PatternRow>
      })

      const values = sort_up ? potentials[selected_pattern].values_sort_up : potentials[selected_pattern].values_sort_down;
      const region = {
         min_x: filter_region.focal_point.x - filter_region.scope / 2,
         max_x: filter_region.focal_point.x + filter_region.scope / 2,
         min_y: filter_region.focal_point.y - filter_region.scope / 2,
         max_y: filter_region.focal_point.y + filter_region.scope / 2,
      }
      const selected_potentials = values
         .filter(value => value.x > region.min_x && value.x < region.max_x && value.y > region.min_y && value.y < region.max_y)
         .map((value, i) => {
         const row_style = (selected_potential !== i) ? {} : {
            backgroundColor: "#666666",
            color: "white"
         }
         const coords = FractoLocate.render_coordinates(value.x, value.y)
         return <PotentialRow
            style={row_style}
            onClick={e => this.on_change(i)}>
            {`[${value.iterations}]  `}{coords}
         </PotentialRow>
      });

      const pattern_designation = FractoUtil.fracto_designation(root_pattern, potentials[selected_pattern].pattern);
      const short_form = FractoUtil.fracto_designation(root_pattern, potentials[selected_pattern].pattern, true);

      const total_points = width_px * width_px;
      const total_pct = Math.round(1000000 * potentials[selected_pattern].total / total_points) / 10000;
      const render_stats =
         <PointStats>{`(${potentials[selected_pattern].total} points, ${total_pct}% of total)`}</PointStats>

      const sort_toggle = sort_up ? <FontAwesomeIcon icon={faCaretDown}/> : <FontAwesomeIcon icon={faCaretUp}/>
      const auto_step_link = <ListLink onClick={e => this.setState({in_auto_step: !in_auto_step})}>
         {in_auto_step ? "no step" : "auto step"}
      </ListLink>

      return [
         <PatternsWrapper>{patterns_list}</PatternsWrapper>,
         <PotentialsWrapper>
            <PatternDesignation>
               <ListLink
                  title={sort_up ? "click to sort down" : "click to sort up"}
                  onClick={e => this.setState({sort_up: !sort_up})}>
                  {sort_toggle}
               </ListLink>
               {auto_step_link}
               <PatternTitle>{pattern_designation}</PatternTitle>
               <PatternShortForm>{`[${short_form}]`}</PatternShortForm>
               {render_stats}
            </PatternDesignation>
            <PotentialsList
               ref={potentials_list_ref}>
               {selected_potentials}
            </PotentialsList>
         </PotentialsWrapper>,
      ]
   }

}

export default BailiwickPointSelector;
