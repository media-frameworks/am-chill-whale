import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";
import CoolButton from "common/cool/CoolButton";

import {
   render_modal_title,
   render_pattern_block,
   render_fracto_navigation
} from "../FractoStyles";
import FractoLocate from "../FractoLocate";
import CommonFiles from "../common/CommonFiles";

import BailiwickPointSelector, {PATTERN_LIST_WIDTH_REM} from "./BailiwickPointSelector";

const FRACTO_RENDER_WIDTH_PX = 650;
const POINT_SELECTOR_RESOLUTION = 2048;

const ActionLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin-right: 0.25rem;
`;

const SelectorWrapper = styled(AppStyles.InlineBlock)`
   margin-top: 1rem;
`;

const LoadingWrapper = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 1rem;
`;

const AllPointsWrapper = styled(AppStyles.Block)`
   margin: 1rem 0;
`;

const PointsList = styled(AppStyles.InlineBlock)`
   overflow-y: scroll;
   overflow-x: hidden;
   max-height: 256px;
   border: 1px solid #888888;
   width: 450px;
   border-radius: 0.25rem;
`;

const PointRow = styled(AppStyles.Block)`
   ${AppStyles.pointer}
   ${AppStyles.ellipsis}
   padding: 0.125rem 0.25rem;
   &:hover {
      background-color: #dddddd;
   }
`;

const PatternBlockColumn = styled(AppStyles.InlineBlock)`
   ${AppStyles.centered}
   width: 3rem;
`;

const ShortFormColumn = styled(AppStyles.InlineBlock)`
   width: 4rem;
`;

export class BailiwickPoints extends Component {

   static propTypes = {
      registry_filename: PropTypes.string.isRequired,
      bailiwick_data: PropTypes.string.isRequired,
      on_change: PropTypes.func.isRequired,
   }

   state = {
      definition_mode: false,
      fracto_values: {},
      point_highlights: [],
      pattern_data: [],
      loading: true,
      selected_pattern: -1,
      selected_short_form: '',
      all_points: [],
      selected_point: -1
   };

   componentDidMount() {
      const {bailiwick_data} = this.props;
      this.setState({fracto_values: bailiwick_data.display_settings})
      console.log(bailiwick_data);

      const json_data = bailiwick_data.json_files.find(file => file.size === POINT_SELECTOR_RESOLUTION);
      const file_path = json_data.filename.slice(11);

      CommonFiles.load_json_file("bailiwicks", file_path, pattern_data => {
         console.log("CommonFiles.load_json_file", "bailiwicks", file_path)
         this.setState({
            pattern_data: pattern_data,
            loading: false,
            all_points: bailiwick_data.points ? bailiwick_data.points : []
         })
      })
   }

   add_point = () => {
      const {selected_pattern, selected_short_form, point_highlights, all_points} = this.state;
      const {bailiwick_data, registry_filename, on_change} = this.props;
      all_points.push({
         x: point_highlights[0].x,
         y: point_highlights[0].y,
         pattern: selected_pattern,
         short_form: selected_short_form,
      });
      this.setState({all_points: all_points})
      bailiwick_data["points"] = all_points;

      const filepath = `bailiwicks/${registry_filename}`;
      const bailiwick_dirname = filepath.replace('/registry.json', '');
      CommonFiles.save_registry_json(bailiwick_dirname, bailiwick_data, result => {
         console.log("CommonFiles.save_registry_json", filepath, bailiwick_data, result);
         on_change(bailiwick_data)
      })
   }

   render_points_list = (all_points, selected_point) => {
      return <PointsList>
         {all_points
            .sort((a, b) => a.pattern - b.pattern)
            .map((point, i) => {
               const row_style = (selected_point !== i) ? {} : {
                  backgroundColor: "#666666",
                  color: "white"
               }
               const coords = FractoLocate.render_coordinates(point.x, point.y)
               const pattern_block = render_pattern_block(point.pattern)
               return <PointRow
                  key={`PointRow_${i}`}
                  style={row_style} onClick={e => this.setState({selected_point: i})}>
                  <PatternBlockColumn>{pattern_block}</PatternBlockColumn>
                  <ShortFormColumn>{`[${point.short_form}]`}</ShortFormColumn>
                  {coords}
               </PointRow>
            })}
      </PointsList>
   }

   render() {
      const {
         definition_mode,
         fracto_values,
         point_highlights,
         pattern_data,
         loading,
         selected_pattern, all_points, selected_point
      } = this.state;
      const {bailiwick_data} = this.props;
      const define_points_link = <ActionLink
         onClick={e => this.setState({definition_mode: true})}>define points</ActionLink>

      const modal_title = render_modal_title(`bailiwick points of interest`)

      let modal_contents = !definition_mode ? '' : [
         modal_title,
         !loading ? '' : <LoadingWrapper>{"Loading, please wait..."}</LoadingWrapper>
      ];
      if (definition_mode && pattern_data.length) {
         const inner_content = [
            <SelectorWrapper><BailiwickPointSelector
               root_pattern={bailiwick_data.pattern}
               pattern_data={pattern_data}
               fracto_values={bailiwick_data.display_settings}
               filter_region={fracto_values}
               width_px={POINT_SELECTOR_RESOLUTION}
               on_change={(pattern, short_form, x, y) => {
                  console.log("on_change", pattern, short_form, x, y)
                  this.setState({
                     point_highlights: [{x: x, y: y}],
                     selected_pattern: pattern,
                     selected_short_form: short_form
                  })
               }}/>
            </SelectorWrapper>,
            <AllPointsWrapper>
               <CoolButton
                  primary={selected_pattern > 0}
                  disabled={selected_pattern <= 0}
                  content={"add point"}
                  style={{width: `${PATTERN_LIST_WIDTH_REM - 1.45}rem`, marginRight: "1rem"}}
                  on_click={e => this.add_point()}
               />
               {this.render_points_list(all_points, selected_point)}
            </AllPointsWrapper>
         ];
         const fracto_nav = render_fracto_navigation(fracto_values, FRACTO_RENDER_WIDTH_PX, point_highlights, inner_content, values => {
            this.setState({fracto_values: values})
         });
         modal_contents.push(fracto_nav);
      }

      const definition_modal = !definition_mode ? '' : <CoolModal
         width={"1400px"}
         contents={modal_contents}
         response={result => this.setState({definition_mode: false})}
      />

      const points_list = this.render_points_list(bailiwick_data.points ? bailiwick_data.points : [], -1);
      return [
         define_points_link,
         definition_modal,
         points_list
      ]
   }
}

export default BailiwickPoints;
