import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import moment from 'moment';

import {AppStyles, AppColors} from "app/AppImports";
import CommonFiles from "../common/CommonFiles";

const ActionLink = styled(AppStyles.Block)`
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
      s3_folder_prefix: PropTypes.string.isRequired,
      on_change: PropTypes.func.isRequired
   }

   state = {
      selected_index: 0,
      statements_list: []
   }

   componentDidMount() {
      const {bailiwick_data} = this.props;
      console.log("BailiwickTools bailiwick_data", bailiwick_data);
   }

   normalize = () => {
      const {bailiwick_data, s3_folder_prefix, on_change} = this.props;
      const diff_x = bailiwick_data.core_point.x - bailiwick_data.octave_point.x;
      const diff_y = bailiwick_data.core_point.y - bailiwick_data.octave_point.y;
      const distance = Math.sqrt(diff_x * diff_x + diff_y * diff_y)
      bailiwick_data.display_settings = {
         focal_point: {
            x: 0.5 * (bailiwick_data.core_point.x + bailiwick_data.octave_point.x),
            y: 0.5 * (bailiwick_data.core_point.y + bailiwick_data.octave_point.y)
         },
         scope: distance * 3
      }
      bailiwick_data.normalized = moment().format();
      CommonFiles.save_registry_json(s3_folder_prefix, bailiwick_data, respose => {
         console.log("CommonFiles.save_registry_json", s3_folder_prefix, bailiwick_data, respose);
         on_change();
      })

   }

   make_draft = () => {
      const {bailiwick_data, s3_folder_prefix, on_change} = this.props;
      const statements_list = []
      console.log("make_draft", bailiwick_data)
      if (!bailiwick_data.normalized) {
         statements_list.push("bailiwick is not normalized")
      } else if (!bailiwick_data.png_files) {
         statements_list.push("image files have not been rendered")
      } else if (bailiwick_data.png_files.length < 5) {
         statements_list.push("not all image files have been rendered")
      } else {
         for (let i = 0; i < bailiwick_data.png_files.length; i++) {
            if (bailiwick_data.png_files[i].modified_time < bailiwick_data.normalized) {
               statements_list.push(`image size ${bailiwick_data.png_files[i].size} needs to be refreshed`)
            }
         }
      }
      if (!statements_list.length) {
         statements_list.push("OK Done!");
         bailiwick_data.draft_created = moment().format();
         CommonFiles.save_registry_json(s3_folder_prefix, bailiwick_data, respose => {
            console.log("CommonFiles.save_registry_json", s3_folder_prefix, bailiwick_data, respose);
            on_change();
         })
      }

      this.setState({statements_list: statements_list})
   }

   render() {
      const {statements_list} = this.state;
      const upgrade_link = <ActionLink
         onClick={e => this.normalize()}>{"normalize"}</ActionLink>
      const make_draft_link = <ActionLink
         onClick={e => this.make_draft()}>{"make draft"}</ActionLink>
      const statements = statements_list.map(statement => {
         return <AppStyles.Block>{statement}</AppStyles.Block>
      })
      return [upgrade_link, make_draft_link, statements]
   }
}

export default BailiwickTools;
