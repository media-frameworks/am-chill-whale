import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";
import AppProjectsFrame from "../../app/AppProjectsFrame";

import CoolNotes from "../../common/cool/CoolNotes";
import MediaVideo from "../../common/media/MediaVideo";
import MediaImage from "../../common/media/MediaImage";

const SECTIONS = [
   {title: "chaotic", key: "chaotic"},
   {title: "documented", key: "documented"},
   {title: "reactive", key: "reactive"},
   {title: "composed", key: "composed"},
   {title: "cognitive", key: "cognitive"},
   {title: "recursive", key: "recursive"},
   {title: "generated", key: "generated"},
   {title: "invented", key: "invented"},
   {title: "intermodal", key: "intermodal"},
   {title: "performed", key: "performed"},
   {title: "written", key: "written"},
];

const COMPONENTS = [
   {title: "cool notes", class_name: "CoolNotes", component_type: CoolNotes},
   {title: "cool video", class_name: "MediaVideo", component_type: MediaVideo},
   {title: "cool image", class_name: "MediaImage", component_type: MediaImage},
];

export class AdminManifest extends Component {

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
      const title = "production manifest";
      return <AppStyles.PageWrapper>
         <AppTitleBar title={title} blurb={AppBrand.CATCH_PHRASE}/>
         {AppBrand.link_swatch(admin_back_ref, AppBrand.ADMIN_TITLE, AppBrand.ADMIN_PATH)}
         <AppProjectsFrame
            sections={SECTIONS}
            components={COMPONENTS}
            sections_title={"index of works"}
         />
      </AppStyles.PageWrapper>
   }
}

export default AdminManifest;
