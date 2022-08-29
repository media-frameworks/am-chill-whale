import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";

import {render_title_bar, render_main_link} from "../FractoStyles";

import CommonCreateDraft from "../common/CommonCreateDraft";
import CommonFiles from "../common/CommonFiles";

import ObservatoryEdit from "./ObservatoryEdit";

const S3_FIELD_STUDIES_PREFIX = 'https://mikehallstudio.s3.amazonaws.com/fracto/studies';
const THUMBNAIL_SIZE_PX = 200;

const FieldStudiesWrapper = styled(AppStyles.Block)`
   margin: 1rem;
`;

const FieldStudyCard = styled(AppStyles.InlineBlock)`
   ${AppStyles.centered}
   ${AppStyles.pointer}
   font-weight: bold;
   color: #444444;
   padding: 0.5rem;
   border-radius: 0.5rem;
   &:hover {
      background-color: #eeeeee;
   }
`;

const ImageWrapper = styled(AppStyles.Block)`
   border-radius: 0.5rem;
`;

const FieldStudyEditWrapper = styled(AppStyles.Block)`
   width: 100%;
`;

export class ObservatoryFieldStudies extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      in_new_field_study: false,
      field_study_files: [],
      selected_field_study: -1
   }

   componentDidMount() {
      this.load_field_studies();
   }

   load_field_studies = () => {
      CommonFiles.load_registry_json("studies", files => {
         console.log("CommonFiles.load_registry_json returns", files)
         this.setState({field_study_files: files})
      })
   }

   response_modal = (field_study_name) => {
      this.setState({
         in_new_field_study: false,
         selected_field_study: field_study_name
      });
      this.load_field_studies();
   }

   render() {
      const {in_new_field_study, field_study_files, selected_field_study} = this.state;
      const {width_px} = this.props;

      const title_bar = render_title_bar("fractal observatory");
      const main_link = render_main_link("new field study", e => this.setState({in_new_field_study: true}));

      const field_study_modal = !in_new_field_study ? '' : <CommonCreateDraft
         modal_title={"new field study"}
         base_folder={"studies"}
         on_response_modal={field_study_name => this.response_modal(field_study_name)}
      />;

      const field_study_names = Object.keys(field_study_files);
      const field_studies = field_study_names.sort().map(field_study_name => {
         const study_dirname = field_study_files[field_study_name];
         const image_link = `${S3_FIELD_STUDIES_PREFIX}/${study_dirname}/png/render_256.png`;
         return selected_field_study === field_study_name ? <FieldStudyEditWrapper>
            <ObservatoryEdit width_px={width_px} study_dirname={study_dirname}/>
         </FieldStudyEditWrapper> : <FieldStudyCard
            onClick={e => this.setState({selected_field_study: field_study_name})}>
            <ImageWrapper><img
               src={image_link}
               style={{borderRadius: "0.25rem", imageRendering: "pixelated"}}
               alt={"no alt for you"}
               width={`${THUMBNAIL_SIZE_PX}px`}
               height={`${THUMBNAIL_SIZE_PX}px`}
            />
            </ImageWrapper>
            {field_study_name}
         </FieldStudyCard>
      })

      return [
         title_bar, main_link, field_study_modal,
         <FieldStudiesWrapper>{field_studies}</FieldStudiesWrapper>
      ]
   }

}

export default ObservatoryFieldStudies;