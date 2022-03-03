import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";
import SectionIndex, {SECTION_WIDTH_PCT, NO_SELECTION} from "../../common/SectionIndex";

import FractoRender from "./fracto/FractoRender";
import FractoDefine from "./fracto/FractoDefine";
import {ONE_BY_PHI} from "../../common/math/constants.js";

const ContentWrapper = styled(AppStyles.Block)`
    ${AppStyles.fixed}
    right: 0;
    left: ${SECTION_WIDTH_PCT}%;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    bottom: 0;
`;

const SelectedContentWrapper = styled(AppStyles.Block)`
    margin-left: 1.25rem;
`;

const SECTIONS = [
   {title: "explore", key: "explore"},
   {title: "define", key: "define"},
];

export class AdminFracto extends Component {

   static propTypes = {
      routes: PropTypes.array,
   }

   state = {
      selected_title: "explore",
      content_width: window.innerWidth * 0.85,
      admin_back_ref: React.createRef(),
      fracto_ref: React.createRef(),
      content_wrapper_rect: {},
      fracto_values: {}
   };

   componentDidMount() {
      const {admin_back_ref, fracto_ref} = this.state;
      AppBrand.swatch_fadein(admin_back_ref, AppBrand.COOL_FADE_IN_MS);
      this.set_content_wrapper_rect();
   }

   set_content_wrapper_rect = () => {
      const {fracto_ref, content_wrapper_rect} = this.state;
      if (fracto_ref.current) {
         const new_content_wrapper_rect = fracto_ref.current.getBoundingClientRect();
         if (content_wrapper_rect.width !== new_content_wrapper_rect.width) {
            this.setState({content_wrapper_rect: new_content_wrapper_rect});
         }
      }
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      this.set_content_wrapper_rect();
   }

   render_name_values = (name, value) => {
      return `${name} = ${value}`;
   }

   render() {
      const {admin_back_ref, selected_title, fracto_ref,
         content_wrapper_rect, fracto_values} = this.state;
      const title = "fracto";
      let frame_contents = [];
      let selected_content = [];
      switch (selected_title) {

         case "explore" :
            console.log("content_wrapper_rect", content_wrapper_rect);
            frame_contents = <ContentWrapper ref={fracto_ref}>
               <FractoRender
                  width_px={content_wrapper_rect.width}
                  aspect_ratio={content_wrapper_rect.height / content_wrapper_rect.width}
                  on_param_change={values => this.setState({fracto_values: values})}
               />
            </ContentWrapper>
            const scope_value = Math.floor(fracto_values.scope * 1000000) / 1000000
            selected_content = <SelectedContentWrapper>
               {this.render_name_values("scope", scope_value)}
            </SelectedContentWrapper>
            break;

         case "define":
            frame_contents = <ContentWrapper>
               <FractoDefine width_px={content_wrapper_rect.width} />
            </ContentWrapper>;
            break;

         default:
            frame_contents = [`unknown: ${selected_title}`];
            break;
      }
      return <AppStyles.PageWrapper>
         <AppTitleBar title={title} blurb={AppBrand.CATCH_PHRASE}/>
         {AppBrand.link_swatch(admin_back_ref, AppBrand.ADMIN_TITLE, AppBrand.ADMIN_PATH)}
         {frame_contents}
         <SectionIndex
            index={SECTIONS}
            title={"fractal graphics"}
            selected_index={selected_title}
            on_select_index={title => this.setState({selected_title: title})}
            selected_content={selected_content}
         />
      </AppStyles.PageWrapper>
   }
}

export default AdminFracto;
