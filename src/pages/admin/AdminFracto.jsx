import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppBrand, AppTitleBar, AppColors} from "app/AppImports";
import SectionIndex, {
   SECTION_WIDTH_PCT, INITIAL_SPLITTER_POS_PX
} from "common/SectionIndex";
import CoolModal from "common/cool/CoolModal";

import FractoRender from "./fracto/FractoRender";
import FractoCruiser from "./fracto/FractoCruiser";
import SequenceCollection from "./fracto/sequence/SequenceCollection";
import FractoData from "./fracto/FractoData";

import LevelDirectory from "./fracto/levels/LevelDirectory";
import BailiwickRegistry from "./fracto/bailiwick/BailiwickRegistry";
import ObservatoryFieldStudies from "./fracto/observatory/ObservatoryFieldStudies";
import BurrowCollection from "./fracto/burrows/BurrowCollection";
import TestHarness from "./fracto/test/TestHarness";

import FractoTone from "./fractone/FractoTone";
import FractonePageBuild from "./fractone/FractonePageBuild";
import FractonePageLoad from "./fractone/FractonePageLoad";
import FractonePagePlay from "./fractone/FractonePagePlay";
import FractoneSelector from "./fractone/FractoneSelector";

import Logo from "res/images/logo.jpg"

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
   {title: "fractone", key: "fractone"},
   {title: "elevations", key: "elevations"},
   {title: "bailiwicks", key: "bailiwicks"},
   {title: "sequencer", key: "sequencer"},
   {title: "burrows", key: "burrows"},
   {title: "observatory", key: "observatory"},
   {title: "test harness", key: "testharness"},
   {title: "cruiser", key: "cruiser"},
];

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
`;

const MessageText = styled(AppStyles.Block)`
   ${AppStyles.italic}
   padding-top: 0.5rem;
   font-size: 1.125rem;
`;

const LogoImage = styled.img`
    width: 100px;
    padding-bottom: 0.5rem;
`;

const LoadingWaitWrapper = styled(AppStyles.Block)`
   border: 0.5rem double ${AppColors.HSL_COOL_BLUE};
   margin: 0;
`;

export class AdminFracto extends Component {

   static propTypes = {
      routes: PropTypes.array,
   }

   state = {
      selected_title: "elevations",
      content_width: window.innerWidth * 0.85,
      admin_back_ref: React.createRef(),
      fracto_ref: React.createRef(),
      content_wrapper_rect: {},
      fracto_values: {},
      fractone: {
         selected_page: FRACTONE_PAGE_BUILD_INSTRUMENTS
      },
      fractone_instrument: '',
      section_splitter_pos: INITIAL_SPLITTER_POS_PX,
      data_ready: false
   };

   static bin_counts = {};
   static loading_completed = true;
   static loading_potentials = true;
   static loading_indexed = true;

   componentDidMount() {
      window.addEventListener("resize", this.update_window_dimensions);
      this.set_content_wrapper_rect();

      if (!this.state.data_ready) {
         setTimeout(() => {
            FractoData.load_bin_counts_async(returns => {
               console.log("FractoData.load_bin_counts_async", returns)
               AdminFracto.bin_counts = returns;
            });
            FractoData.load_potentials_async(returns => {
               console.log("FractoData.load_potentials_async", returns)
               AdminFracto.loading_potentials = !returns;
            });
            FractoData.load_completed_async(returns => {
               console.log("FractoData.load_completed_async", returns)
               AdminFracto.loading_completed = !returns;
            });
            FractoData.load_indexed_async(returns => {
               console.log("FractoData.load_indexed_async", returns)
               AdminFracto.loading_indexed = !returns;
            });
            FractoData.load_error_async(returns => {
               console.log("FractoData.load_error_async", returns)
            });
            FractoData.load_ready_async(returns => {
               console.log("FractoData.load_ready_async", returns)
            })
         }, 500);

         const interval = setInterval(() => {
            console.log("waiting for tile data...", AdminFracto.loading_completed, AdminFracto.loading_potentials, AdminFracto.loading_indexed)
            if (!AdminFracto.loading_completed && !AdminFracto.loading_potentials && !AdminFracto.loading_indexed) {
               console.log("data_ready", true)
               this.setState({data_ready: true})
               clearInterval(interval);
            }
         }, 1000)
      }
   }

   update_window_dimensions = (e) => {
      const {section_splitter_pos} = this.state;
      this.setState({
         content_wrapper_rect: {
            width: e.currentTarget.innerWidth - 5 - section_splitter_pos,
            height: e.currentTarget.innerHeight - 5
         }
      });
   }

   set_content_wrapper_rect = () => {
      const {fracto_ref, content_wrapper_rect} = this.state;
      if (fracto_ref.current) {
         const new_content_wrapper_rect = fracto_ref.current.getBoundingClientRect();
         if (content_wrapper_rect.width !== new_content_wrapper_rect.width ||
            content_wrapper_rect.height !== new_content_wrapper_rect.height) {
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

   title_selected = (title) => {
      this.setState({selected_title: title});
      localStorage.setItem("selected_title", title)
   }

   render() {
      const {
         admin_back_ref, selected_title, fracto_ref, section_splitter_pos,
         content_wrapper_rect, fracto_values, fractone, fractone_instrument, data_ready
      } = this.state;
      const title = "fracto";
      let frame_contents = [];
      let selected_content = [];
      const wrapperStyle = {
         left: `${section_splitter_pos}px`
      }
      switch (selected_title) {

         case "explore" :
            frame_contents = <ContentWrapper style={wrapperStyle} ref={fracto_ref}>
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

         default:
         case "elevations":
            frame_contents = <ContentWrapper style={wrapperStyle}>
               <LevelDirectory width_px={content_wrapper_rect.width}/>
            </ContentWrapper>;
            break;

         case "bailiwicks":
            frame_contents = <ContentWrapper style={wrapperStyle}>
               <BailiwickRegistry width_px={content_wrapper_rect.width}/>
            </ContentWrapper>;
            break;

         case "sequencer":
            frame_contents = <ContentWrapper style={wrapperStyle}>
               <SequenceCollection width_px={content_wrapper_rect.width}/>
            </ContentWrapper>;
            break;

         case "burrows":
            frame_contents = <ContentWrapper style={wrapperStyle}>
               <BurrowCollection width_px={content_wrapper_rect.width}/>
            </ContentWrapper>;
            break;

         case "observatory":
            frame_contents = <ContentWrapper style={wrapperStyle}>
               <ObservatoryFieldStudies width_px={content_wrapper_rect.width}/>
            </ContentWrapper>;
            break;

         case "test harness":
            frame_contents = <ContentWrapper style={wrapperStyle}>
               <TestHarness width_px={content_wrapper_rect.width}/>
            </ContentWrapper>;
            break;

         case "cruiser":
            frame_contents = <ContentWrapper
               style={wrapperStyle}>
               <FractoCruiser
                  width_px={content_wrapper_rect.width}
                  height_px={content_wrapper_rect.height}
               />
            </ContentWrapper>;
            break;

         case "fractone":
            console.log("fractone_instrument", fractone_instrument)
            switch (fractone.selected_page) {
               case FRACTONE_PAGE_BUILD_INSTRUMENTS:
                  frame_contents = <ContentWrapper style={wrapperStyle}><FractonePageBuild
                     width_px={content_wrapper_rect.width}/>
                  </ContentWrapper>
                  break;
               case FRACTONE_PAGE_LOAD_AND_TEST:
                  frame_contents = <ContentWrapper style={wrapperStyle}><FractonePageLoad
                     prefix={fractone_instrument}
                     width_px={content_wrapper_rect.width}/>
                  </ContentWrapper>
                  break;
               case FRACTONE_PAGE_GO_LIVE:
                  frame_contents = <ContentWrapper style={wrapperStyle}><FractonePagePlay
                     width_px={content_wrapper_rect.width}/>
                  </ContentWrapper>
                  break;
               default:
                  frame_contents = <ContentWrapper style={wrapperStyle}>
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

      }

      const modal_contents = data_ready ? '' : <LoadingWaitWrapper>
         <CenteredBlock><MessageText>{"Loading tile data, please look busy..."}</MessageText></CenteredBlock>
         <CenteredBlock><LogoImage
            width={100}
            src={Logo}
            alt={"am-chill-whale"}
         />
         </CenteredBlock>
      </LoadingWaitWrapper>
      const loading_modal = data_ready ? '' : <CoolModal
         width={"24rem"}
         settings={{no_escape: true}}
         contents={modal_contents}
      />

      return <AppStyles.PageWrapper>
         <AppTitleBar title={title} blurb={AppBrand.CATCH_PHRASE}/>
         {AppBrand.link_swatch(admin_back_ref, AppBrand.ADMIN_TITLE, AppBrand.ADMIN_PATH)}
         {frame_contents}
         {loading_modal}
         <SectionIndex
            index={SECTIONS}
            width_px={section_splitter_pos}
            title={"fractal graphics"}
            selected_index={selected_title}
            on_select_index={title => this.title_selected({title})}
            on_resize={pos => this.resize_regions(pos)}
            selected_content={selected_content}
         />
      </AppStyles.PageWrapper>
   }
}

export default AdminFracto;
