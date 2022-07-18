import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import StoreS3 from "common/StoreS3";
import {AppStyles} from "app/AppImports";

import BailiwickFiles from "./BailiwickFiles";
import BailiwickEditTabs from "./BailiwickEditTabs";

import FractoRender from "../FractoRender";
import FractoLocate from "../FractoLocate";
import FractoImage from "../FractoImage";
import FractoUtil from "../FractoUtil";

const FRACTO_RENDER_WIDTH_PX = 350;

const RenderWrapper = styled(AppStyles.InlineBlock)`
   margin: 0 0.5rem 1rem 1rem;
   border: 0.125rem solid #aaaaaa;
   border-radius: 0.25rem;
   height: ${FRACTO_RENDER_WIDTH_PX}px;
`;

const LocateWrapper = styled(AppStyles.Block)`
   border: 0.125rem solid #aaaaaa;
   border-radius: 0.25rem;
   overflow: hidden;
`;

const InfoWrapper = styled(AppStyles.InlineBlock)`
   margin-top: 0.125rem;
`;

const DataRowWrapper = styled(AppStyles.Block)`
   line-height: 1rem;
`;

const TabsWrapper = styled(AppStyles.Block)`
   margin-top: 0.25rem;
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
      registry_filename: PropTypes.object.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
      bailiwick_data: {},
      loading: true,
      fracto_values: {}
   }

   componentDidMount() {
      const {registry_filename} = this.props;
      StoreS3.get_file_async(`bailiwicks/${registry_filename}`, "fracto", result => {
         const bailiwick_data = JSON.parse(result);
         console.log("bailiwick_data", bailiwick_data)
         const fracto_values = !bailiwick_data.display_settings ? {
            focal_point: {
               x: bailiwick_data.core_point.x,
               y: bailiwick_data.core_point.y
            },
            scope: 0.01
         } : bailiwick_data.display_settings
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

   render() {
      const {bailiwick_data, loading, fracto_values} = this.state;
      if (loading) {
         return "..."
      }

      const fracto_render = !fracto_values.scope ? '' : <RenderWrapper>
         <FractoRender
            width_px={FRACTO_RENDER_WIDTH_PX}
            aspect_ratio={1.0}
            initial_params={fracto_values}
            on_param_change={values => this.setState({fracto_values: values})}
         />
      </RenderWrapper>

      const level = FractoImage.find_best_level(fracto_values.scope);
      const fracto_locate = <LocateWrapper>
         <FractoLocate level={level} fracto_values={fracto_values}/>
      </LocateWrapper>

      const focal_point = this.data_row('core point',
         FractoLocate.render_coordinates(bailiwick_data.core_point.x, bailiwick_data.core_point.y));
      const link_span = <LinkSpan onClick={e => this.set_display_settings()}>{"set now"}</LinkSpan>;
      const display_settings = this.data_row('display settings', [
         !bailiwick_data.display_settings ? '' :
            FractoLocate.render_coordinates(bailiwick_data.display_settings.focal_point.x, bailiwick_data.display_settings.focal_point.y),
         !bailiwick_data.display_settings ? link_span : [' (', link_span, ')']
      ]);

      return [
         fracto_render,
         <AppStyles.InlineBlock>{[
            fracto_locate,
            <InfoWrapper>{[
               focal_point,
               display_settings,
            ]}</InfoWrapper>,
            <TabsWrapper><BailiwickEditTabs bailiwick_data={bailiwick_data} /></TabsWrapper>
         ]}</AppStyles.InlineBlock>
      ]
   }
}

export default BailiwickEdit;