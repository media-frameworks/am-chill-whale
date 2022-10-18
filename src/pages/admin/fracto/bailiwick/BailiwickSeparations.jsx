import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";
import CoolCanvas from "common/cool/CoolCanvas";

import FractoUtil from "../FractoUtil";
import {render_modal_title, render_pattern_block} from "../FractoStyles";
import CommonFiles from "../common/CommonFiles";

import BailiwickPointSelector from "./BailiwickPointSelector";

const PATTERN_SEPARATOR_RESOLUTION = 2048;
const PATTERN_LIST_WIDTH_REM = 6;

const PREVIEW_CANVAS_WIDTH_PX = 640;
const PREVIEW_CANVAS_HEIGHT_PX = 640;
const POTENTIALS_COUNT_LOWER_BOUND = 500;

const ActionLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin-right: 0.25rem;
`;

const LoadingWrapper = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 1rem;
`;

const PatternRow = styled(AppStyles.Block)`
   ${AppStyles.pointer}
   ${AppStyles.centered}
   padding: 0.125rem 0.25rem;
   &:hover {
      background-color: #dddddd;
   }
`;

const PatternsWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem 1rem 1rem 0;
   overflow-y: scroll;
   max-height: 640px;
   border: 1px solid #888888;
   border-radius: 0.25rem;
   width: ${PATTERN_LIST_WIDTH_REM}rem;
`;

const CanvasWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem 1rem 1rem 0;
`;

export class BailiwickSeparations extends Component {

   static propTypes = {
      registry_filename: PropTypes.string.isRequired,
      bailiwick_data: PropTypes.string.isRequired,
      on_change: PropTypes.func.isRequired,
   }

   state = {
      definition_mode: false,
      pattern_data: [],
      selected_patterns: [-1],
      loading: true,
      potentials: [],
      canvas_ref: null
   };

   componentDidMount() {
      const {bailiwick_data} = this.props;
      const json_data = bailiwick_data.json_files.find(file => file.size === PATTERN_SEPARATOR_RESOLUTION);
      const file_path = json_data.filename.slice(11);
      CommonFiles.load_json_file("bailiwicks", file_path, pattern_data => {
         console.log("CommonFiles.load_json_file", "bailiwicks", file_path)
         const potentials = BailiwickPointSelector.index_potentials(
            pattern_data, bailiwick_data.display_settings, PATTERN_SEPARATOR_RESOLUTION);
         this.setState({
            pattern_data: pattern_data,
            loading: false,
            potentials: potentials,
         })
      })
   }

   click_pattern = (pattern) => {
      const {selected_patterns} = this.state;
      const pattern_index = selected_patterns.indexOf(pattern);
      if (pattern_index >= 0) {
         selected_patterns.splice(pattern_index, 1);
      } else {
         selected_patterns.push(pattern)
      }
      this.setState({selected_patterns: selected_patterns})
   }

   render_canvas = (ctx) => {
      console.log("render_canvas", ctx)
   }

   update_canvas = () => {
      const {canvas_ref, potentials, selected_patterns} = this.state;
      const {bailiwick_data} = this.props;
      if (!canvas_ref || !potentials.length) {
         return [];
      }
      if (!canvas_ref.current) {
         return [];
      }
      const canvas = canvas_ref.current;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(0, 0, PREVIEW_CANVAS_WIDTH_PX, PREVIEW_CANVAS_HEIGHT_PX);

      const orbitals = selected_patterns.map(pattern => {
         const pattern_potentials = potentials.find(pot => pot.pattern === pattern);
         console.log("pattern_potentials", pattern_potentials)
         return pattern_potentials.values_sort_up;
      });

      const pixel_size = 1.25 * PREVIEW_CANVAS_HEIGHT_PX / PATTERN_SEPARATOR_RESOLUTION;
      const image_center_x = bailiwick_data.display_settings.focal_point.x;
      const image_center_y = bailiwick_data.display_settings.focal_point.y;
      const scope = bailiwick_data.display_settings.scope;
      const scale_factor = PREVIEW_CANVAS_WIDTH_PX / scope
      const half_width = PREVIEW_CANVAS_WIDTH_PX / 2;
      for (let orbital_index = 0; orbital_index < orbitals.length; orbital_index++) {
         const values = orbitals[orbital_index];
         for (let value_index = 0; value_index < values.length; value_index++ ) {
            const x = values[value_index].x
            const y = values[value_index].y
            const img_x = half_width + scale_factor * (x - image_center_x);
            const img_y = half_width - scale_factor * (y - image_center_y);
            const color = FractoUtil.fracto_pattern_color(values[value_index].pattern, values[value_index].iterations)
            ctx.fillStyle = color;
            ctx.fillRect(img_x, img_y, pixel_size, pixel_size);
         }
      }
   }

   render() {
      const {definition_mode, loading, potentials, selected_patterns} = this.state;
      const define_points_link = <ActionLink
         onClick={e => this.setState({definition_mode: true})}>perform orbital separations</ActionLink>

      const modal_title = render_modal_title(`bailiwick orbital separations`)
      let modal_contents = !definition_mode ? [] : [
         modal_title,
         !loading ? '' : <LoadingWrapper>{"Loading, please wait..."}</LoadingWrapper>
      ];

      if (!loading && definition_mode) {
         const patterns_list = potentials
            .filter(pot => pot.total > POTENTIALS_COUNT_LOWER_BOUND && pot.pattern > 0)
            .map((pot, i) => {
               const row_style = (!selected_patterns.includes(pot.pattern)) ? {} : {
                  backgroundColor: "#666666",
                  color: "white"
               }
               return <PatternRow
                  style={row_style}
                  onClick={e => this.click_pattern(pot.pattern)}>
                  {render_pattern_block(pot.pattern)}
               </PatternRow>
            })
         const preview_canvas = <CoolCanvas
            width_px={PREVIEW_CANVAS_WIDTH_PX}
            height_px={PREVIEW_CANVAS_HEIGHT_PX}
            on_init={canvas_ref => this.setState({canvas_ref: canvas_ref})}
         />
         modal_contents.push(<CanvasWrapper>{preview_canvas}</CanvasWrapper>)
         modal_contents.push(<PatternsWrapper>{patterns_list}</PatternsWrapper>)
         this.update_canvas();
      }

      const definition_modal = !definition_mode ? '' : <CoolModal
         width={"1400px"}
         contents={modal_contents}
         response={result => this.setState({definition_mode: false})}
      />

      return [
         define_points_link,
         definition_modal
      ]
   }

}

export default BailiwickSeparations;
