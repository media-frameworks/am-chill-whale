import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons';

import {AppStyles, AppColors} from "../AppImports";
import StoreS3, {S3_PREFIX} from "../../common/StoreS3";
import Utils from "../../common/Utils";
import {PROJECTS_TITLEBAR_HEIGHT_REM} from "./ProjectsTitleBar"
import CoolInputText from "../../common/cool/CoolInputText";

const ProjectBarWrapper = styled.div`
    position: fixed;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM + PROJECTS_TITLEBAR_HEIGHT_REM}rem;
    left: 15%;
    right: 0;
    padding: 0.125rem 1rem 0;
`;

const CreateProjectButton = styled.div`
    ${AppStyles.inline_block};
    ${AppStyles.pointer};
    ${AppStyles.noselect};
    ${AppColors.COLOR_COOL_BLUE};
    ${AppStyles.COOL_BORDER};
    padding: 0.125rem 0.5rem;
    margin: 0.5rem 0;
    background-color: white;
`;

const IconWrapper = styled.div`
    ${AppStyles.inline};
    ${AppColors.COLOR_COOL_BLUE};
    height: 1.5rem;
    vertical-align: middle;
`;

const CreateProjectText = styled.div`
    ${AppStyles.inline};
    ${AppStyles.COOL_BLUE_TEXT};
    margin-left: 0.5rem;
`;

export class ProjectsFrameBar extends Component {

   static propTypes = {
      title: PropTypes.string.isRequired,
      s3_key: PropTypes.string.isRequired,
      refresh_project_paths: PropTypes.func.isRequired,
   }

   state = {
      new_project_mode: false,
      input_ref: React.createRef()
   }

   create_project = (new_project_name) => {
      const {s3_key, refresh_project_paths} = this.props;
      const name_slug = Utils.text_to_slug(new_project_name);
      const file_name = `${s3_key}/${name_slug}/main.json`;
      const d = new Date();
      const main_json = {
         name: new_project_name,
         s3_path: file_name,
         type: "project",
         created: d.toISOString()
      }
      console.log("new_project_name", new_project_name);
      StoreS3.put_file_async(file_name, JSON.stringify(main_json), S3_PREFIX, result => {
         console.log("put_file_async result", result);
         refresh_project_paths();
      })
   }

   new_project_data = () => {
      return <CoolInputText
         value={''}
         style_extra={{
            fontSize: '1.25rem',
            padding: '0.125rem 0.25rem'
         }}
         placeholder={'enter the new project title'}
         callback={new_value => {
            this.create_project(new_value);
            this.setState({new_project_mode: false});
         }}
      />
   }

   new_project_button = () => {
      return <CreateProjectButton onClick={e => this.setState({new_project_mode: true})}>
         <IconWrapper>
            <FontAwesomeIcon icon={faPlusSquare}/>
         </IconWrapper>
         <CreateProjectText>{"new project"}</CreateProjectText>
      </CreateProjectButton>;
   }

   render() {
      const {new_project_mode} = this.state;
      return <ProjectBarWrapper>
         {new_project_mode ? this.new_project_data() : this.new_project_button()}
      </ProjectBarWrapper>
   }
}

export default ProjectsFrameBar;
