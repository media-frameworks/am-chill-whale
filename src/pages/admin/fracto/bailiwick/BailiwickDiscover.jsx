import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";
import StoreS3 from "common/StoreS3";

import FractoRender from "../FractoRender";
import FractoLocate from "../FractoLocate";
import FractoImage from "../FractoImage";
import FractoSieve from "../FractoSieve";
import FractoCalc from "../FractoCalc";
import {LEVEL_SCOPES} from "../FractoData";

import BailiwickFiles from "./BailiwickFiles";

const TEST_FRACTO_VALUES = {
   scope: 0.006044629098073147,
   focal_point: {
      x: -1.1864869782016154,
      y: 0.3031100138920893
   }
};
const DEFAULT_FRACTO_VALUES = {
   scope: 2.5,
   focal_point: {
      x: -.75,
      y: 0.771
   }
};

const BAILIWICK_SAMPLE_WIDTH_PX = 1200;

const TitleBar = styled(AppStyles.Block)`
   ${AppStyles.centered};
   ${AppStyles.uppercase};
   letter-spacing: 0.75rem;
   color: #888888;
   font-size: 0.85rem;
   border-bottom: 0.125rem solid ${AppColors.HSL_COOL_BLUE};
`;

const FractoWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem 1rem 0;
`;

const CorePointsWrapper = styled(AppStyles.Block)`
   margin: 1rem 1rem 0;
`;

const LocateWrapper = styled(AppStyles.Block)`
    border: 0.125rem solid #aaaaaa;
    width: 30rem;
    height: 5rem;
    margin: 1rem;
    margin-bottom: 0;
    border-radius: 0.25rem;
`;

const UpgradeLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin-right: 0.25rem;
   float: right;
`;

const IdentifyLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin: 0.5rem 2rem;
`;

const NewBailiwickLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin: 0.5rem 2rem;
`;

const IdentifyWrapper = styled(AppStyles.InlineBlock)`
   margin: 0.25rem 1rem;
`;

const PatternRow = styled(AppStyles.Block)`
   padding: 0.125rem 0.25rem;
   &:hover {
      background-color: #dddddd;
   }
`;

const PotentialRow = styled(AppStyles.Block)`
   padding: 0.125rem 0.25rem;
   &:hover {
      background-color: #dddddd;
   }
`;

const PatternsWrapper = styled(AppStyles.InlineBlock)`
   cursor: default; 
   margin: 0.5rem;
   overflow: auto;
   max-height: 256px;
   border: 1px solid #888888;
`;

const PotentialsWrapper = styled(AppStyles.InlineBlock)`
   cursor: default; 
   margin: 0.5rem;
   overflow: auto;
   max-height: 256px;
   border: 1px solid #888888;
   max-width: 500px;
`;

export class BailiwickDiscover extends Component {

   constructor(props) {
      super(props);
      this.state.fracto_values = props.initial_params
      this.state.potentials_list_ref = React.createRef();
   }

   static propTypes = {
      on_response_modal: PropTypes.func.isRequired,
      initial_params: PropTypes.object,
      bailiwick_files: PropTypes.array,
   }

   static defaultProps = {
      initial_params: DEFAULT_FRACTO_VALUES,
      bailiwick_files: []
   }

   state = {
      in_identify: false,
      potentials: [],
      selected_pattern: 0,
      selected_potential: 0
   }

   componentDidMount() {
      document.addEventListener('keydown', this.key_handler);
   }

   componentWillUnmount() {
      document.removeEventListener('keydown', this.key_handler);
   }

   key_handler = (e) => {
      const {potentials, selected_pattern, selected_potential, potentials_list_ref} = this.state;
      if (!potentials.length) {
         return;
      }

      if (e.code === "ArrowDown" && selected_potential < potentials.length - 1) {
         potentials_list_ref.current.scrollTop += 22;
         this.setState({selected_potential: selected_potential + 1})
      }
      if (e.code === "ArrowUp" && selected_potential > 0) {
         potentials_list_ref.current.scrollTop -= 22;
         this.setState({selected_potential: selected_potential - 1})
      }
      e.preventDefault();
      e.stopPropagation();
   }

   focal_point_filename = (focal_point) => {
      const x_part = Math.round(focal_point.x * 1000000) / 1000000;
      const y_part = Math.round(focal_point.y * 1000000) / 1000000;
      return `[${x_part},${y_part}].json`
   }

   upgrade_level = () => {
      const {fracto_values} = this.state;
      const level = FractoImage.find_best_level(fracto_values.scope);
      const visible_tiles = FractoSieve.find_tiles(
         LEVEL_SCOPES[level].cells, fracto_values.focal_point, 1.0, fracto_values.scope);
      const filename = this.focal_point_filename(fracto_values.focal_point);
      StoreS3.put_file_async(filename, JSON.stringify(visible_tiles), `fracto/orders`, data => {
         console.log(`upgrade_level order issued ${filename}`, data);
      });
   }

   identify_bailiwick = (data) => {
      const {fracto_values} = this.state;
      const increment = fracto_values.scope / BAILIWICK_SAMPLE_WIDTH_PX;
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
               const calculated = FractoCalc.calc(x, y);
               pixel = [calculated.pattern, calculated.iteration]
            }
            if (pixel[0] > 0) {
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
      }

      const potentials = Object.keys(pattern_lists).map(key => {
         return {
            pattern: parseInt(key.replace('_', '')),
            values: pattern_lists[key]
               .sort((a, b) => a.iterations - b.iterations)
               .slice(0, 250)
         };
      }).sort((a, b) => a.pattern - b.pattern)

      console.log("potentials", potentials);
      this.setState({potentials: potentials})
   }

   identify_mode = () => {
      const {fracto_values} = this.state;
      this.setState({in_identify: true})
      FractoSieve.extract(
         fracto_values.focal_point, 1.0, fracto_values.scope, BAILIWICK_SAMPLE_WIDTH_PX, result => {
            console.log("identify_mode sieve", result)
            this.identify_bailiwick(result)
         });
   }

   patterns_list = (potentials) => {
      const {selected_pattern, selected_potential, potentials_list_ref} = this.state;
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
            onClick={e => this.setState({selected_pattern: i, selected_potential: 0})}>
            {pot.pattern}
         </PatternRow>
      })
      const selected_potentials = potentials[selected_pattern].values.map((value, i) => {
         const row_style = (selected_potential !== i) ? {} : {
            backgroundColor: "#666666",
            color: "white"
         }
         const coords = FractoLocate.render_coordinates(value.x, value.y)
         return <PotentialRow
            style={row_style}
            onClick={e => this.setState({selected_potential: i})}>
            {`[${value.iterations}]  `}{coords}
         </PotentialRow>
      });
      return <AppStyles.Block>{[
         <PatternsWrapper>{patterns_list}</PatternsWrapper>,
         <PotentialsWrapper
            ref={potentials_list_ref}>
            {selected_potentials}
         </PotentialsWrapper>,
      ]}
      </AppStyles.Block>
   }

   new_bailiwick = () => {
      const {potentials, selected_potential} = this.state;
      BailiwickFiles.new_bailiwick(potentials[0].values[selected_potential], potentials[0].pattern, result => {
         this.setState({in_identify: false})
      });
   }

   bailiwick_highlights = () => {
      const {bailiwick_files} = this.props;
      return bailiwick_files.map(b_f => {
         return b_f.core_point;
      })
   }

   render() {
      const {fracto_values, in_identify, potentials, selected_pattern, selected_potential} = this.state;
      const {on_response_modal} = this.props;
      const modal_title = <TitleBar>discover a bailiwick</TitleBar>
      const point_highlights = !potentials.length ? this.bailiwick_highlights() : [potentials[selected_pattern].values[selected_potential]];
      const fracto_render = <FractoWrapper>
         <FractoRender
            width_px={500}
            aspect_ratio={1.0}
            initial_params={fracto_values}
            on_param_change={values => this.setState({fracto_values: values})}
            point_highlights={point_highlights}
         />
      </FractoWrapper>
      const level = FractoImage.find_best_level(fracto_values.scope);
      const fracto_locate = <LocateWrapper>
         <FractoLocate level={level} fracto_values={fracto_values}/>
      </LocateWrapper>
      const upgrade_link = <UpgradeLink
         onClick={e => this.upgrade_level()}>{"upgrade level"}</UpgradeLink>
      const identify_link = in_identify ? '' : <IdentifyLink
         onClick={e => this.identify_mode()}>{"click to begin"}</IdentifyLink>
      const new_bailiwick_link = !potentials.length ? '' : <NewBailiwickLink
         onClick={e => this.new_bailiwick()}>{"new bailiwick"}</NewBailiwickLink>
      const core_points_specify = !in_identify ? '' : <CorePointsWrapper>{[
         this.patterns_list(potentials)
      ]}</CorePointsWrapper>
      const discover_contents = [
         modal_title,
         <AppStyles.InlineBlock style={{width: "520px"}}>{[
            fracto_render,
            upgrade_link
         ]}</AppStyles.InlineBlock>,
         <AppStyles.InlineBlock>{[
            fracto_locate,
            identify_link,
            core_points_specify,
            new_bailiwick_link,
         ]}</AppStyles.InlineBlock>
      ]
      return <CoolModal
         width={"95%"}
         contents={discover_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default BailiwickDiscover;
