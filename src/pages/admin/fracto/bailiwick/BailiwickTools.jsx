import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import StoreS3 from "common/StoreS3";

import FractoSieve from "../FractoSieve";
import {get_level_tiles, GET_COMPLETED_TILES_ONLY} from "../FractoData";

const UpgradeLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin-right: 0.25rem;
`;

export class BailiwickTools extends Component {

   static propTypes = {
      bailiwick_data: PropTypes.object.isRequired,
   }

   state = {
      selected_index: 0
   }

   componentDidMount() {
      const {bailiwick_data} = this.props;
      console.log("BailiwickTools bailiwick_data", bailiwick_data);
   }

   focal_point_filename = (focal_point) => {
      const x_part = Math.round(focal_point.x * 1000000) / 1000000;
      const y_part = Math.round(focal_point.y * 1000000) / 1000000;
      return `[${x_part},${y_part}].json`
   }

   upgrade_level = () => {
      const {bailiwick_data} = this.props;
      const fracto_values = bailiwick_data.display_settings;

      let sample_size = 2000;
      let completed_tiles_in_scope = [];
      while (true) {
         console.log("sample_size", sample_size)
         if (sample_size < 200) {
            break;
         }
         const completed_tiles = get_level_tiles(sample_size, fracto_values.scope, GET_COMPLETED_TILES_ONLY);
         if (!completed_tiles.length) {
            sample_size -= 100;
            continue;
         }
         completed_tiles_in_scope = FractoSieve.find_tiles(
            completed_tiles, fracto_values.focal_point, 1.0, fracto_values.scope);
         if (!completed_tiles_in_scope.length) {
            sample_size -= 100;
            continue;
         }

         break;
      }
      console.log("completed_tiles_in_scope.length", completed_tiles_in_scope.length)
      if (!completed_tiles_in_scope.length) {
         return;
      }

      const filename = this.focal_point_filename(fracto_values.focal_point);
      StoreS3.put_file_async(filename, JSON.stringify(completed_tiles_in_scope), `fracto/orders`, data => {
         console.log(`upgrade_level order issued ${filename}`, data);
      });
   }

   render() {
      const upgrade_link = <UpgradeLink
         onClick={e => this.upgrade_level()}>{"upgrade level"}</UpgradeLink>
      return [upgrade_link]
   }
}

export default BailiwickTools;
