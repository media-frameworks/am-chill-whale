import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";
import AppProjectsFrame from "../../app/AppProjectsFrame";

import ThreeDFluidMotion from "./threed/ThreeDFluidMotion";
import ThreeDFractopography from "./threed/ThreeDFractopography";

const SECTIONS = [
   {title: "animator", key: "animator"},
   {title: "holodeck", key: "holodeck"},
];

const COMPONENTS = [
   {title: "fluid motion test", class_name: "ThreeDFluidMotion", component_type: ThreeDFluidMotion},
   {title: "fractopography", class_name: "ThreeDFractopography", component_type: ThreeDFractopography},
];

export class AdminThreeD extends Component {

   static propTypes = {
      routes: PropTypes.array,
   }

   state = {
      admin_back_ref: React.createRef(),
   };

   componentDidMount() {
      const {admin_back_ref} = this.state;
      AppBrand.swatch_fadein(admin_back_ref, AppBrand.COOL_FADE_IN_MS);
   }

   render() {
      const {admin_back_ref} = this.state;
      const title = "render 3d";
      return <AppStyles.PageWrapper>
         <AppTitleBar title={title} blurb={AppBrand.CATCH_PHRASE}/>
         {AppBrand.link_swatch(admin_back_ref, AppBrand.ADMIN_TITLE, AppBrand.ADMIN_PATH)}
         <AppProjectsFrame
            sections={SECTIONS}
            components={COMPONENTS}
            sections_title={"frameworks"}
         />
      </AppStyles.PageWrapper>
   }
}

export default AdminThreeD;
