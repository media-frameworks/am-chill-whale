import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppBrand, AppTitleBar, AppColors} from "../../app/AppImports";
import SectionIndex, {SECTION_WIDTH_PCT, INITIAL_SPLITTER_POS_PX} from "../../common/SectionIndex";

import FractoRender from "./fracto/FractoRender";
import FractoCapture from "./fracto/FractoCapture";
import FractoTessellate from "./fracto/FractoTessellate";
import FractoTone from "./fractone/FractoTone";

import FractonePageBuild from "./fractone/FractonePageBuild";
import FractonePageLoad from "./fractone/FractonePageLoad";
import FractonePagePlay from "./fractone/FractonePagePlay";
import FractoneSelector from "./fractone/FractoneSelector";

const FRACTONE_PAGE_LOAD_AND_TEST = "load_and_test";
const FRACTONE_PAGE_GO_LIVE = "go_live";
const FRACTONE_PAGE_BUILD_INSTRUMENTS = "build_instruments";
const FRACTONE_PAGE_LEGACY = "legacy";

const ContentWrapper = styled(AppStyles.Block)`
    ${AppStyles.fixed}
    right: 0;
    left: ${SECTION_WIDTH_PCT}%;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    bottom: 0;
    overflow: scroll;
`;

const SelectedContentWrapper = styled(AppStyles.Block)`
    margin-left: 1.25rem;
`;

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
      fracto_values: {},
      fractone: {
         selected_page: FRACTONE_PAGE_BUILD_INSTRUMENTS
      },
      fractone_instrument: '',
      section_splitter_pos: INITIAL_SPLITTER_POS_PX
   };

   componentDidMount() {
      const {admin_back_ref} = this.state;
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

   resize_regions = (pos) => {
      const {content_wrapper_rect} = this.state;
      content_wrapper_rect.width = window.innerWidth - pos - 5;
      this.setState({
         section_splitter_pos: pos,
         content_wrapper_rect: content_wrapper_rect
      })
   }

   render() {
      const {
         admin_back_ref, selected_title, fracto_ref, section_splitter_pos,
         content_wrapper_rect, fracto_values, fractone, fractone_instrument
      } = this.state;
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
            console.log("fractone_instrument", fractone_instrument)
            switch (fractone.selected_page) {
               case FRACTONE_PAGE_BUILD_INSTRUMENTS:
                  frame_contents = <ContentWrapper><FractonePageBuild
                     width_px={content_wrapper_rect.width}/>
                  </ContentWrapper>
                  break;
               case FRACTONE_PAGE_LOAD_AND_TEST:
                  frame_contents = <ContentWrapper><FractonePageLoad
                     prefix={fractone_instrument}
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
            const fractone_selector = <FractoneSelector
               width_px={120}
               on_selected={prefix => this.setState({fractone_instrument: prefix})}
            />
            selected_content = <SelectedContentWrapper>
               <AspectLink
                  onClick={e => this.setState({fractone: {selected_page: FRACTONE_PAGE_BUILD_INSTRUMENTS}})}>
                  {"build instruments"}
               </AspectLink>
               <AspectLink
                  onClick={e => this.setState({fractone: {selected_page: FRACTONE_PAGE_LOAD_AND_TEST}})}>
                  {"load & test"}
               </AspectLink>
               {(fractone.selected_page === FRACTONE_PAGE_LOAD_AND_TEST) && fractone_selector}
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
            width_px={section_splitter_pos}
            title={"fractal graphics"}
            selected_index={selected_title}
            on_select_index={title => this.setState({selected_title: title})}
            on_resize={pos => this.resize_regions(pos)}
            selected_content={selected_content}
         />
      </AppStyles.PageWrapper>
   }
}

export default AdminFracto;
