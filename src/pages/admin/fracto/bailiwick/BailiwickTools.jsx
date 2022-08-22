import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import StoreS3 from "common/StoreS3";

import FractoSieve from "../FractoSieve";
import {get_level_tiles} from "../FractoData";

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
      const display_settings = bailiwick_data.display_settings;
      const level_tiles = get_level_tiles(1500, display_settings.scope);
      const visible_tiles = FractoSieve.find_tiles(
         level_tiles, display_settings.focal_point, 1.0, display_settings.scope);
      const filename = this.focal_point_filename(display_settings.focal_point);
      StoreS3.put_file_async(filename, JSON.stringify(visible_tiles), `fracto/orders`, data => {
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
