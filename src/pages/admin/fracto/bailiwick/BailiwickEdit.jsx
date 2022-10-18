import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import StoreS3 from "common/StoreS3";
import {AppStyles} from "app/AppImports";
import CoolTabs from "common/cool/CoolTabs";

import BailiwickFiles from "./BailiwickFiles";
import BailiwickTools from "./BailiwickTools";
import BailiwickDefine from "./BailiwickDefine";
// import BailiwickOrbitals from "./BailiwickOrbitals";

import CommonRenderings from "../common/CommonRenderings";
import CommonFiles from "../common/CommonFiles";

import FractoRender from "../FractoRender";
import FractoLocate from "../FractoLocate";
import {render_fracto_locate_cb} from "../FractoStyles";

export const FRACTO_RENDER_WIDTH_PX = 512;

const RenderWrapper = styled(AppStyles.InlineBlock)`
   margin: 0 1rem 1rem 1rem;
   border: 0.125rem solid #aaaaaa;
   border-radius: 0.25rem;
   height: ${FRACTO_RENDER_WIDTH_PX}px;
`;

const InfoWrapper = styled(AppStyles.InlineBlock)`
   margin-top: 0.125rem;
`;

const DataRowWrapper = styled(AppStyles.Block)`
   line-height: 1rem;
`;

const LabelSpan = styled.span`
   ${AppStyles.bold}
   ${AppStyles.italic}
   font-size: 0.85rem;
   color: #888888;
   padding-right: 0.25rem;
`;

const LinkSpan = styled.span`
   ${AppStyles.link}
   ${AppStyles.COOL_BLUE_TEXT}
   font-size: 0.85rem;
`;

export class BailiwickEdit extends Component {

   static propTypes = {
      registry_filename: PropTypes.string.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
      bailiwick_data: {},
      loading: true,
      fracto_values: {},
      highlight_points: []
   }

   componentDidMount() {
      const {registry_filename} = this.props;
      StoreS3.get_file_async(`bailiwicks/${registry_filename}`, "fracto", result => {
         const bailiwick_data = JSON.parse(result);
         console.log("bailiwick_data", bailiwick_data)
         const fracto_values = bailiwick_data.display_settings ? bailiwick_data.display_settings : {
            focal_point: bailiwick_data.core_point,
            scope: 0.05
         }
         this.setState({
            bailiwick_data: bailiwick_data,
            fracto_values: fracto_values,
            loading: false
         })
      })
   }

   data_row = (label_text, value_markup) => {
      const label = <LabelSpan>{label_text}:</LabelSpan>
      return <DataRowWrapper>{[
         label, value_markup
      ]}</DataRowWrapper>
   }

   set_display_settings = () => {
      const {bailiwick_data, fracto_values} = this.state;
      const {registry_filename} = this.props;
      this.setState({loadding: true})
      bailiwick_data.display_settings = fracto_values;
      BailiwickFiles.save_registry(bailiwick_data, `bailiwicks/${registry_filename}`, result => {
         console.log("BailiwickFiles.save_registry returns", result)
         this.setState({loadding: false})
      })
   }

   set_highlight_points = (highlight_points) => {
      console.log("set_highlight_points", highlight_points)
      this.setState({highlight_points: highlight_points})
   }

   load_resources = () => {
      const {registry_filename} = this.props;
      const bailiwick_dirname = registry_filename.replace('/registry.json', '');
      CommonFiles.load_registry_json(`bailiwicks/${bailiwick_dirname}`, data => {
         console.log("CommonFiles.load_registry_json returns", data)
         this.setState({
            bailiwick_data: data,
            fracto_values: data.display_settings
         })
      })
   }

   render() {
      const {bailiwick_data, loading, fracto_values} = this.state;
      const {registry_filename} = this.props;
      if (loading) {
         return "..."
      }

      const point_highlights = bailiwick_data ? [bailiwick_data.core_point ? bailiwick_data.core_point : bailiwick_data.root_point] : [];
      if (bailiwick_data.octave_point) {
         point_highlights.push(bailiwick_data.octave_point);
      }
      const fracto_render = !fracto_values.scope ? '' : <RenderWrapper>
         <FractoRender
            width_px={FRACTO_RENDER_WIDTH_PX}
            aspect_ratio={1.0}
            initial_params={fracto_values}
            on_param_change={values => this.setState({fracto_values: values})}
            point_highlights={point_highlights}
         />
      </RenderWrapper>

      const fracto_locate = render_fracto_locate_cb(fracto_values, FRACTO_RENDER_WIDTH_PX, values => {
         console.log("render_fracto_locate_cb(fracto_values", FRACTO_RENDER_WIDTH_PX, values)
         this.setState({fracto_values: values})
      });

      const link_span = <LinkSpan onClick={e => this.set_display_settings()}>{"set now"}</LinkSpan>;
      const display_settings = this.data_row('display settings', [
         !bailiwick_data.display_settings ? '' :
            FractoLocate.render_coordinates(bailiwick_data.display_settings.focal_point.x, bailiwick_data.display_settings.focal_point.y),
         !bailiwick_data.display_settings ? link_span : [' (', link_span, ')']
      ]);

      console.log("bailiwick_data", bailiwick_data)
      const bailiwick_dirname = registry_filename.replace('/registry.json', '');
      console.log("bailiwick_dirname", bailiwick_dirname)
      const bailiwick_edit_tabs = [
         {
            label: "renderings",
            content: <CommonRenderings
               registry_data={bailiwick_data}
               fracto_values={bailiwick_data.display_settings}
               s3_folder_prefix={`bailiwicks/${bailiwick_dirname}`}
               size_list={[128, 256, 512, 1024, 2048, 4096]}
               on_change={() => this.load_resources()}
            />
         },
         {
            label: "definition",
            content: <BailiwickDefine
               bailiwick_data={bailiwick_data}
               s3_folder_prefix={`bailiwicks/${bailiwick_dirname}`}
               on_change={() => this.load_resources()}
            />
         },
         // {
         //    label: "orbitals",
         //    content: <BailiwickOrbitals
         //       bailiwick_data={bailiwick_data}
         //       s3_folder_prefix={`bailiwicks/${bailiwick_dirname}`}
         //       on_change={() => this.load_resources()}
         //    />
         // },
         {
            label: "tools",
            content: <BailiwickTools
               bailiwick_data={bailiwick_data}
               s3_folder_prefix={`bailiwicks/${bailiwick_dirname}`}
               on_change={() => this.load_resources()}
            />
         }
      ];

      return [
         fracto_render,
         <AppStyles.InlineBlock>{[
            fracto_locate,
            <InfoWrapper>{display_settings}</InfoWrapper>,
            <CoolTabs tab_data={bailiwick_edit_tabs}/>
         ]}</AppStyles.InlineBlock>
      ]
   }
}

export default BailiwickEdit;