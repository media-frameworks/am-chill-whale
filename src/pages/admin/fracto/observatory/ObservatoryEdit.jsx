import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import Magnifier from "react-magnifier";

import {AppStyles} from "app/AppImports";
import CoolTabs from "common/cool/CoolTabs";

import FractoCommon from "../FractoCommon";
import CommonFiles from "../common/CommonFiles";

const S3_FRACTO_PREFIX = 'https://mikehallstudio.s3.amazonaws.com/fracto';

const MAGNIFIER_WIDTH_PX = 220;
const EDIT_IMAGE_WIDTH_PX = 650;

const EditStudyWrapper = styled(AppStyles.Block)`
   margin: 0.5rem;
   padding: 0.5rem;
   border: 0.35rem double #aaaaaa;
   border-radius: 0.5rem;
`;

const StudyTitleWrapper = styled(AppStyles.Block)`
   width: 100%;
   font-size: 1.5rem;
`;

const TabsWrapper = styled(AppStyles.InlineBlock)`
   margin-left: 1rem;
`;

const StudyTitleSpan = styled.div`
   ${AppStyles.inline_block}
   ${AppStyles.uppercase}
   ${AppStyles.monospace}
   height: 2rem;
`;

const StudyNameSpan = styled.div`
   ${AppStyles.inline_block}
   ${AppStyles.bold}
   padding-left: 0.5rem;
   height: 2rem;
`;

const ArchiveLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   ${AppStyles.pointer}
   color: maroon;
   font-size: 0.75rem;
   margin-left: 0.5rem;
   margin-top: 0.25rem;
   opacity: 0;
   &:hover {
      opacity: 1.0;
   }
`;

export class ObservatoryEdit extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      study_dirname: PropTypes.string.isRequired,
   }

   state = {
      field_study_data: {},
      in_archive_confirm: false
   }

   componentDidMount() {
      this.load_resources()
   }

   archive_study = () => {
      const {field_study_data} = this.state;
      console.log("confirmed archive_study", field_study_data.name);
      CommonFiles.load_registry_json("studies", registry => {
         console.log("CommonFiles.load_registry_json returns", registry)
         delete (registry[field_study_data.name]);
         CommonFiles.save_registry_json("studies", registry, result => {
            console.log(`CommonFiles.save_registry_json returns`, result);
         })
      })
   }

   load_resources = () => {
      const {study_dirname} = this.props;
      CommonFiles.load_registry_json(`studies/${study_dirname}`, field_study => {
         console.log("CommonFiles.load_registry_json returns", field_study)
         this.setState({field_study_data: field_study})
      })
   }

   render() {
      const {field_study_data, in_archive_confirm} = this.state;
      const {width_px, study_dirname} = this.props;

      const image_link = `${S3_FRACTO_PREFIX}/studies/${study_dirname}/png/render_2048.png`;
      const main_image = !field_study_data["png_files"] ? "" :
         <Magnifier
            src={image_link}
            width={`${EDIT_IMAGE_WIDTH_PX}px`}
            zoomFactor={2.0}
            style={{imageRendering: "pixelated"}}
            mgWidth={MAGNIFIER_WIDTH_PX}
            mgHeight={MAGNIFIER_WIDTH_PX}
         />

      const title = !field_study_data.name ? '' : <StudyTitleWrapper>
         <StudyTitleSpan>{"Field Study: "}</StudyTitleSpan>
         <StudyNameSpan>{field_study_data.name}</StudyNameSpan>
         <ArchiveLink
            onClick={e => this.setState({in_archive_confirm: true})}>
            {"archive"}
         </ArchiveLink>
      </StudyTitleWrapper>;
      const archive_confirm = !in_archive_confirm ? '' : FractoCommon.modal_confirm(`archive "${field_study_data.name}"?`, ["no", "yes"], r => {
         if (r === 1) {
            this.archive_study()
         }
         this.setState({in_archive_confirm: false})
      })

      const tab_data = [
         // {
         //    label: "renderings",
         //    content: <CommonRenderings
         //       registry_data={field_study_data}
         //       fracto_values={field_study_data.fracto_values}
         //       s3_folder_prefix={`studies/${study_dirname}`}
         //       size_list={[128, 256, 512, 1024, 2048]}
         //       on_change={() => this.load_resources()}/>
         // },
         {label: "patterns", content: "patterns content"},
         {label: "exhibits", content: "exhibits content"},
         {label: "commentary", content: "commentary content"},
      ]
      const all_tabs = <CoolTabs tab_data={tab_data}/>

      return <EditStudyWrapper>{[
         title,
         main_image,
         <TabsWrapper style={{width: `${width_px - EDIT_IMAGE_WIDTH_PX - 120}px`}}>{all_tabs}</TabsWrapper>,
         archive_confirm
      ]}</EditStudyWrapper>
   }
}

export default ObservatoryEdit;
