import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

<<<<<<< HEAD
import {AppStyles, AppBrand, AppTitleBar, AppColors} from "../../app/AppImports";
import SectionIndex, {SECTION_WIDTH_PCT} from "../../common/SectionIndex";

import FractoRender from "./fracto/FractoRender";
import FractoCapture from "./fracto/FractoCapture";
import FractoTessellate from "./fracto/FractoTessellate";
import FractoTone from "./fractone/FractoTone";

import FractonePageBuild from "./fractone/FractonePageBuild";
import FractonePageLoad from "./fractone/FractonePageLoad";
import FractonePagePlay from "./fractone/FractonePagePlay";

const FRACTONE_PAGE_LOAD_AND_TEST = "load_and_test";
const FRACTONE_PAGE_GO_LIVE = "go_live";
const FRACTONE_PAGE_BUILD_INSTRUMENTS = "build_instruments";
const FRACTONE_PAGE_LEGACY = "legacy";
=======
import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";
import SectionIndex, {SECTION_WIDTH_PCT, NO_SELECTION} from "../../common/SectionIndex";

import FractoRender from "./fracto/FractoRender";
import FractoDefine from "./fracto/FractoDefine";
import {ONE_BY_PHI} from "../../common/math/constants.js";
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe

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

<<<<<<< HEAD
const AspectLink = styled(AppStyles.Block)`
   ${AppStyles.italic}
   ${AppStyles.uppercase}
   ${AppStyles.bold}
   font-size: 0.85rem;
   margin: 0.25rem 0;
   &: hover {
      ${AppStyles.underline};
      ${AppColors.COLOR_DEEP_BLUE}
   }
`;

const SECTIONS = [
   {title: "explore", key: "explore"},
   {title: "capture", key: "capture"},
   {title: "tessellate", key: "tessellate"},
   {title: "fractone", key: "fractone"},
=======
const SECTIONS = [
   {title: "explore", key: "explore"},
   {title: "define", key: "define"},
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
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
<<<<<<< HEAD
      fracto_values: {},
      fractone: {
         selected_page: FRACTONE_PAGE_BUILD_INSTRUMENTS
      }
   };

   componentDidMount() {
      const {admin_back_ref} = this.state;
=======
      fracto_values: {}
   };

   componentDidMount() {
      const {admin_back_ref, fracto_ref} = this.state;
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
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
<<<<<<< HEAD
      const {
         admin_back_ref, selected_title, fracto_ref,
         content_wrapper_rect, fracto_values, fractone
      } = this.state;
=======
      const {admin_back_ref, selected_title, fracto_ref,
         content_wrapper_rect, fracto_values} = this.state;
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
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

<<<<<<< HEAD
         case "capture":
            frame_contents = <ContentWrapper>
               <FractoCapture width_px={content_wrapper_rect.width}/>
            </ContentWrapper>;
            break;

         case "tessellate":
            frame_contents = <ContentWrapper>
               <FractoTessellate width_px={content_wrapper_rect.width}/>
            </ContentWrapper>;
            break;

         case "fractone":
            switch (fractone.selected_page) {
               case FRACTONE_PAGE_BUILD_INSTRUMENTS:
                  frame_contents = <ContentWrapper><FractonePageBuild
                     width_px={content_wrapper_rect.width}/>
                  </ContentWrapper>
                  break;
               case FRACTONE_PAGE_LOAD_AND_TEST:
                  frame_contents = <ContentWrapper><FractonePageLoad
                     width_px={content_wrapper_rect.width}/>
                  </ContentWrapper>
                  break;
               case FRACTONE_PAGE_GO_LIVE:
                  frame_contents = <ContentWrapper><FractonePagePlay
                     width_px={content_wrapper_rect.width}/>
                  </ContentWrapper>
                  break;
               default:
                  frame_contents = <ContentWrapper>
                     <FractoTone width_px={content_wrapper_rect.width}/>
                  </ContentWrapper>;
                  break;
            }
            selected_content = <SelectedContentWrapper>
               <AspectLink
                  onClick={e => this.setState({fractone: {selected_page: FRACTONE_PAGE_BUILD_INSTRUMENTS}})}>
                  {"build instruments"}
               </AspectLink>
               <AspectLink
                  onClick={e => this.setState({fractone: {selected_page: FRACTONE_PAGE_LOAD_AND_TEST}})}>
                  {"load & test"}
               </AspectLink>
               <AspectLink
                  onClick={e => this.setState({fractone: {selected_page: FRACTONE_PAGE_GO_LIVE}})}>
                  {"go live!"}
               </AspectLink>
               <AspectLink
                  onClick={e => this.setState({fractone: {selected_page: FRACTONE_PAGE_LEGACY}})}>
                  {"legacy"}
               </AspectLink>
            </SelectedContentWrapper>
            break;

=======
         case "define":
            frame_contents = <ContentWrapper>
               <FractoDefine width_px={content_wrapper_rect.width} />
            </ContentWrapper>;
            break;

>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
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
