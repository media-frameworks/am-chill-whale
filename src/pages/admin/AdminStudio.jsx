import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";
import CoolSplitter, {SPLITTER_TYPE_HORIZONTAL} from "../../common/cool/CoolSplitter";
import SectionIndex, {SECTION_WIDTH_PCT} from "../../common/SectionIndex";
import StudioToneBar from "./studio/StudioToneBar";
import StudioTimeline from "./studio/StudioTimeline";

const SECTIONS = [
   {title: "create", key: "create"},
];

const SPLITTER_BAR_WIDTH_PX = 5;

const ContentWrapper = styled(AppStyles.Block)`
    ${AppStyles.fixed}
    right: 0;
    left: ${SECTION_WIDTH_PCT}%;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    bottom: 0;
    background-color: #eeeeee;
`;

const SettingsWrapper = styled(AppStyles.Block)`
    margin-left: 1.25rem;
`;

export class AdminStudio extends Component {

   static propTypes = {
      routes: PropTypes.array,
   }

   state = {
      admin_back_ref: React.createRef(),
      wrapper_ref: React.createRef(),
      outer_ref: React.createRef(),
      content_bounds: {},
      splitter_position: 0,
      section_splitter_pos: 200
   };

   componentDidMount() {
      const {admin_back_ref} = this.state;
      AppBrand.swatch_fadein(admin_back_ref, AppBrand.COOL_FADE_IN_MS);
      window.addEventListener("resize", this.resize_wrapper);
      this.resize_wrapper();
   }

   componentWillUnmount() {
      window.removeEventListener("resize", this.resize_wrapper);
   }

   resize_wrapper = (e) => {
      const {wrapper_ref, splitter_position} = this.state;
      const wrapper = wrapper_ref.current;
      if (wrapper) {
         const content_bounds = wrapper.getBoundingClientRect();
         this.setState({
            content_bounds: content_bounds,
            splitter_position: splitter_position ? splitter_position : content_bounds.height / 2,
         });
      }
   }

   render() {
      const {admin_back_ref, wrapper_ref, outer_ref, content_bounds,
         splitter_position, section_splitter_pos} = this.state;
      const title = "sound studio";
      const selected_content = <SettingsWrapper>settings</SettingsWrapper>
      const wrapper_style = {
         left: `${section_splitter_pos}px`
      }
      const frame_contents = <ContentWrapper
         style={wrapper_style}
         ref={wrapper_ref}>
         <StudioToneBar
            width_px={content_bounds.width}
            height_px={splitter_position}
            levels={6}/>
         <CoolSplitter
            type={SPLITTER_TYPE_HORIZONTAL}
            name={"admin-studio-main"}
            bar_width_px={SPLITTER_BAR_WIDTH_PX}
            container_bounds={content_bounds}
            position={splitter_position}
            on_change={pos => this.setState({splitter_position: pos})}
         />
         <StudioTimeline
            width_px={content_bounds.width}
            height_px={content_bounds.height - splitter_position - SPLITTER_BAR_WIDTH_PX}
            settings={{}}
            tracks={[]}
         />
      </ContentWrapper>
      return <AppStyles.PageWrapper ref={outer_ref}>
         <AppTitleBar title={title} blurb={AppBrand.CATCH_PHRASE}/>
         {AppBrand.link_swatch(admin_back_ref, AppBrand.ADMIN_TITLE, AppBrand.ADMIN_PATH)}
         {frame_contents}
         <SectionIndex
            index={SECTIONS}
            width_px={section_splitter_pos}
            title={"tone gallery"}
            selected_index={"create"}
            on_select_index={title => this.setState({selected_title: title})}
            on_resize={pos => this.setState({section_splitter_pos: pos})}
            selected_content={selected_content}
         />
      </AppStyles.PageWrapper>
   }
}

export default AdminStudio;
