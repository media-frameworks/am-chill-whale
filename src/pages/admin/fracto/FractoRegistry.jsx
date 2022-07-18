import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import moment from 'moment';

import {AppStyles, AppColors} from "app/AppImports";
import BailiwickDiscover from "./bailiwick/BailiwickDiscover";
import BailiwickEdit from "./bailiwick/BailiwickEdit";
import BailiwickFiles from "./bailiwick/BailiwickFiles";
import FractoLocate from "./FractoLocate";
import StoreS3 from "common/StoreS3";
import FractoUtil from "./FractoUtil";

const FRACTO_COLOR_ITERATIONS = 200;

const TitleBar = styled(AppStyles.Block)`
   background: linear-gradient(120deg, #999999, #eeeeee);
   height: 1.125rem;
   width: 100%;
   border-bottom: 0.15rem solid #666666;
`;

const TitleSpan = styled.span`
   ${AppStyles.uppercase}
   ${AppStyles.noselect}
   ${AppStyles.bold}
   font-size: 1.125rem;
   letter-spacing: 0.5rem;
   margin-left: 1rem;
   color: white;
   text-shadow: 0.01rem 0.01rem 0.2rem black;
`;

const DiscoverLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin: 0.5rem 1rem 0;
`;

const UpdateLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.bold}
   ${AppStyles.underline}
   color: ${AppColors.COLOR_DEEP_BLUE};
   font-size: 0.75rem;
   margin-left: 0.5rem;
   opacity: 0;
   &:hover {
      opacity: 0.5;
   }
`;

const BailiwicksWrapper = styled(AppStyles.Block)`
   margin: 1rem 2rem;
`;

const ModifiedDate = styled.span`
   ${AppStyles.italic}
   color: #aaaaaa;
   padding-right: 1rem;
`;

const BailiwickRow = styled(AppStyles.Block)`
   ${AppStyles.pointer}
   font-size: 1rem;
   padding: 0.25rem 1rem;
   border-radius: 0.5rem;
   &:hover {
      background-color: #eeeeee;
   }
`;

const BailiwickFilename = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   ${AppStyles.link}
   ${AppStyles.COOL_BLUE_TEXT};
   font-size: 1rem;   
   margin-right: 1rem;
`;

const PatternBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   ${AppStyles.monospace}
   font-size: 1.25rem;
   border: 0.1rem solid #666666;
   border-radius: 0.25rem;
   color: white;
   padding: 0.125rem 0.125rem 0;
   line-height: 1rem;
   margin-top: 0.25rem;
   margin-right: 1rem;
`;

export class FractoRegistry extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      discover_mode: false,
      bailiwick_files: [],
      editing_bailiwick: null
   }

   componentDidMount() {
      this.load_registry();
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      // this.load_registry();
   }

   load_registry = () => {
      BailiwickFiles.load_registry(bailiwick_files => {
         this.setState({bailiwick_files: bailiwick_files})
      })
   }

   response_modal = (r) => {
      console.log("response_modal", r);
      this.setState({discover_mode: false});
   }

   update_bailiwick = (b_f) => {
      const key = b_f.registry_filename.replace("/registry.json", '');
      StoreS3.get_file_async("bailiwicks/registry.json", "fracto", result => {
         if (!result) {
            console.log("update_bailiwick error getting main registry", result);
            return;
         }
         const all_bailiwicks = JSON.parse(result);
         StoreS3.get_file_async(`bailiwicks/${b_f.registry_filename}`, "fracto", result => {
            if (!result) {
               console.log("update_bailiwick error getting target registry", result);
               return;
            }
            const target_bailiwick = JSON.parse(result);
            all_bailiwicks[key]["pattern"] = target_bailiwick.pattern;
            BailiwickFiles.save_registry(all_bailiwicks, "bailiwicks/registry.json", result => {
               console.log("update_bailiwick result", result)
            })
         })
      });
   }

   render() {
      const {discover_mode, bailiwick_files, selected_bailiwick} = this.state;
      const {width_px} = this.props;
      const title_bar = <TitleBar><TitleSpan>registry of bailiwicks</TitleSpan></TitleBar>
      const discover_link = <DiscoverLink
         onClick={e => this.setState({discover_mode: true})}>
         discover now
      </DiscoverLink>
      const discover_modal = !discover_mode ? '' : <BailiwickDiscover
         bailiwick_files={bailiwick_files}
         on_response_modal={r => this.response_modal(r)}/>;
      const bailiwicks = bailiwick_files
         .sort((a, b) => {
            if (a.pattern !== b.pattern) {
               return a.pattern - b.pattern;
            }
            if (a.core_point.x === b.core_point.x) {
               return a.core_point.y - b.core_point.y;
            }
            return a.core_point.x - b.core_point.x;
         })
         .map((b_f, i) => {
            const pattern_color = FractoUtil.fracto_pattern_color(b_f.pattern, FRACTO_COLOR_ITERATIONS);
            return [
               <BailiwickRow>
                  <PatternBlock
                     style={{backgroundColor: pattern_color}}>
                     {b_f.pattern}
                  </PatternBlock>
                  <BailiwickFilename
                     title={"click to edit"}
                     onClick={e => this.setState({selected_bailiwick: i === selected_bailiwick ? -1 : i})}>
                     {FractoLocate.render_coordinates(b_f.core_point.x, b_f.core_point.y)}
                  </BailiwickFilename>
                  <UpdateLink
                     title={"click to remove"}
                     onClick={e => this.update_bailiwick(b_f)}>update</UpdateLink>
               </BailiwickRow>,
               i !== selected_bailiwick ? '' : <BailiwickEdit
                  registry_filename={b_f.registry_filename}
                  width_px={width_px - 100}
               />
            ]
         })
      const bailiwicks_syle = {width: `${width_px - 70}px`}
      return [
         title_bar,
         discover_link,
         discover_modal,
         <BailiwicksWrapper
            style={bailiwicks_syle}>
            {bailiwicks}
         </BailiwicksWrapper>
      ]
   }
}

export default FractoRegistry;
