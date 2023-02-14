import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import CommonFiles from "../common/CommonFiles";
import FractoLocate from "../FractoLocate";
// import FractoSieve from "../FractoSieve";

import BailiwickDiscover from "./BailiwickDiscover";
import {FRACTO_RENDER_WIDTH_PX} from "./BailiwickEdit";

const PotentialRow = styled(AppStyles.Block)`
   padding: 0.125rem 0.25rem;
   &:hover {
      background-color: #dddddd;
   }
`;

const ListTitle = styled(AppStyles.Block)`
   ${AppStyles.centered}
   ${AppStyles.bold}
   ${AppStyles.uppercase}
   ${AppColors.COLOR_DEEP_BLUE}
   font-size: 1rem;
   margin-top: 0.5rem;
`;

const PotentialsWrapper = styled(AppStyles.Block)`
   cursor: default; 
   margin: 0 0.5rem 0.5rem;
   overflow: auto;
   max-height: 256px;
   border: 1px solid #888888;
   max-width: 500px;
`;

export class BailiwickDefine extends Component {

   static propTypes = {
      bailiwick_data: PropTypes.object.isRequired,
      s3_folder_prefix: PropTypes.string.isRequired,
      on_change: PropTypes.func.isRequired
   }

   state = {
      json_file: [],
      all_potentials: [],
      all_potentials_reverse: [],
      potential_root_index: 0,
      potential_octave_index: 0,
      potential_crevasse_index: 0,
   }

   componentDidMount() {
      // const {bailiwick_data} = this.props;
      // const fracto_values = bailiwick_data.display_settings;
      // FractoSieve.extract(
      //    fracto_values.focal_point, 1.0, fracto_values.scope, FRACTO_RENDER_WIDTH_PX, result => {
      //       console.log("FractoSieve.extract", result)
      //       const all_potentials = BailiwickDiscover.identify_bailiwick(result, fracto_values, FRACTO_RENDER_WIDTH_PX, true)
      //       const all_potentials_reverse = BailiwickDiscover.identify_bailiwick(result, fracto_values, FRACTO_RENDER_WIDTH_PX, false)
      //       this.setState({
      //          json_file: result,
      //          all_potentials: all_potentials,
      //          all_potentials_reverse: all_potentials_reverse,
      //       })
      //    });
   }

   set_root_index = (index) => {
      const {all_potentials} = this.state;
      const {bailiwick_data, s3_folder_prefix, on_change} = this.props;
      bailiwick_data["core_point"] = {
         x: all_potentials[0].values[index].x,
         y: all_potentials[0].values[index].y,
      }
      CommonFiles.save_registry_json(s3_folder_prefix, bailiwick_data, respose => {
         console.log("CommonFiles.save_registry_json", s3_folder_prefix, bailiwick_data, respose);
         this.setState({potential_root_index: index})
         on_change();
      })
   }

   set_octave_index = (index) => {
      const {all_potentials} = this.state;
      const {bailiwick_data, s3_folder_prefix, on_change} = this.props;
      bailiwick_data["octave_point"] = {
         x: all_potentials[1].values[index].x,
         y: all_potentials[1].values[index].y,
      }
      CommonFiles.save_registry_json(s3_folder_prefix, bailiwick_data, respose => {
         console.log("CommonFiles.save_registry_json", s3_folder_prefix, bailiwick_data, respose);
         this.setState({potential_octave_index: index})
         on_change();
      })
   }

   set_crevasse_index = (index) => {
      const {all_potentials_reverse} = this.state;
      const {bailiwick_data, s3_folder_prefix, on_change} = this.props;
      bailiwick_data["crevasse_point"] = {
         x: all_potentials_reverse[0].values[index].x,
         y: all_potentials_reverse[0].values[index].y,
      }
      CommonFiles.save_registry_json(s3_folder_prefix, bailiwick_data, respose => {
         console.log("CommonFiles.save_registry_json", s3_folder_prefix, bailiwick_data, respose);
         this.setState({potential_crevasse_index: index})
         on_change();
      })
   }

   render_potentials = (potentials, state_name, on_click) => {
      const potentials_list = potentials.map((p, index) => {
         const location = FractoLocate.render_coordinates(p.x, p.y)
         const row_style = (this.state[state_name] !== index) ? {} : {
            backgroundColor: "#666666",
            color: "white"
         }
         return <PotentialRow
            style={row_style}
            onClick={e => on_click(index)}>
            {location}
         </PotentialRow>
      })
      return <PotentialsWrapper>{potentials_list}</PotentialsWrapper>
   }

   render() {
      const {all_potentials} = this.state;

      const root_potentials = !all_potentials.length ? '' :
         this.render_potentials(all_potentials[0].values, "potential_root_index", this.set_root_index);
      const octave_potentials = !all_potentials.length ? '' :
         this.render_potentials(all_potentials[1].values, "potential_octave_index", this.set_octave_index);
      // const crevasse_potentials = !all_potentials_reverse.length ? '' :
      //    this.render_potentials(all_potentials_reverse[0].values, "potential_crevasse_index", this.set_crevasse_index);

      const root_title = !all_potentials.length ? '' : <ListTitle>root points</ListTitle>
      const octave_title = !all_potentials.length ? '' : <ListTitle>octave points</ListTitle>
      // const crevasse_title = !all_potentials_reverse.length ? '' : <ListTitle>crevasse points</ListTitle>
      return [
         all_potentials.length ? '' : "loading...",
         <AppStyles.Block>
            <AppStyles.InlineBlock>{root_title}{root_potentials}</AppStyles.InlineBlock>
            <AppStyles.InlineBlock>{octave_title}{octave_potentials}</AppStyles.InlineBlock>
         </AppStyles.Block>,
         // <AppStyles.Block>
         //    <AppStyles.InlineBlock>{crevasse_title}{crevasse_potentials}</AppStyles.InlineBlock>
         // </AppStyles.Block>
      ]
   }
}

export default BailiwickDefine;
