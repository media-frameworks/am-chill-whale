import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../AppImports";
import Utils from "../../common/Utils";
import CoolInputText from "../../common/cool/CoolInputText";

const EDIT_MODE_DESCRIPTION = "edit_description";
const EDIT_MODE_PROJECT_NAME = "edit_project_name";
const EDIT_MODE_NONE = "edit_none";

const ProjectNameSpan = styled.span`
    ${AppStyles.bold};
    ${AppStyles.pointer};
    font-size: 1.25rem;
    margin-right: 0.5rem;
 `;

const ProjectDetails = styled.span`
    ${AppStyles.italic};
    font-size: 0.75rem;
    color: #aaaaaa;
 `;

const ProjectDescription = styled.div`
    ${AppStyles.link};
 `;

const DescriptionEdit = styled.div`
    font-family: Arial;
    font-weight: normal;
 `;

export class ProjectMeta extends Component {

   static propTypes = {
      data: PropTypes.object.isRequired,
      on_update: PropTypes.func.isRequired,
      is_expanded: PropTypes.bool.isRequired,
   }

   state = {
      edit_mode: EDIT_MODE_NONE,
      input_ref: React.createRef()
   };

   created_on_text = (data) => {
      if (!data.created) {
         return "in the past";
      }
      return Utils.time_ago(data.created);
   }

   edit_description = () => {
      const {data, on_update} = this.props;
      const description = data.description || '';
      return <DescriptionEdit>
         <CoolInputText
            value={description}
            placeholder={'use your words'}
            style_extra={{
               fontSize: "1.125rem"
            }}
            callback={new_value => {
               if (new_value !== data["description"]) {
                  data["description"] = new_value;
                  on_update(data);
               }
               this.setState({edit_mode: EDIT_MODE_NONE});
            }}
         />
      </DescriptionEdit>
   }

   edit_project_name = () => {
      const {data, on_update} = this.props;
      const project_name = data.name;
      return <CoolInputText
         value={project_name}
         placeholder={'re-name this project'}
         callback={new_value => {
            if (new_value !== data["name"]) {
               data["name"] = new_value;
               on_update(data);
            }
            this.setState({edit_mode: EDIT_MODE_NONE});
         }}
      />
   }

   set_edit_mode = (edit_mode) => {
      this.setState({edit_mode: edit_mode})
   }

   render() {
      const {edit_mode} = this.state;
      const {is_expanded, data} = this.props;
      const name_style = {color: is_expanded ? 'black' : AppColors.HSL_DEEP_BLUE};
      const description = data.description ? data.description : "click to describe this";
      const updated = data['updated'] ? true : false;
      const sections = [
         [
            edit_mode === EDIT_MODE_PROJECT_NAME ? this.edit_project_name() :
               <ProjectNameSpan
                  key={"name_span"} style={name_style}
                  onClick={e => this.setState({edit_mode: EDIT_MODE_PROJECT_NAME})}>
                  {data.name}
               </ProjectNameSpan>,
            (is_expanded && <ProjectDetails title={data['created']} key={"created_span"}>
               {"created "}{Utils.time_ago(data.created)}</ProjectDetails>),
            (is_expanded && updated && <ProjectDetails title={data['updated']} key={"updated_span"}>
               {", updated "}{Utils.time_ago(data.updated)}</ProjectDetails>),
         ],
         edit_mode === EDIT_MODE_DESCRIPTION ? this.edit_description() :
            <ProjectDescription onClick={e => this.setState({edit_mode: EDIT_MODE_DESCRIPTION})}>
               {description}
            </ProjectDescription>,
      ];
      const all_sections = sections.map((section, index) => {
         return <div key={`meta_section_${index}`}>{section}</div>
      })
      return is_expanded ? all_sections : sections[0]
   }
}

export default ProjectMeta;
