import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../AppImports";
import {PROJECTS_TITLEBAR_HEIGHT_REM} from "./ProjectsTitleBar";
import ProjectsFrameBar from "./ProjectsFrameBar";
import ProjectBlock from "./ProjectBlock";

const NONE_EXPANDED = 'None';

const FrameWrapper = styled.div`
    position: fixed;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM + PROJECTS_TITLEBAR_HEIGHT_REM}rem;
    left: 15%;
    right: 0;
    bottom: 0;
    padding: 0.125rem 1rem 0;
    background-color: #dddddd;
    overflow-y: auto;
`;

const AllProjects = styled.div`
    margin-top: 3.25rem;
`;

export class ProjectsFrame extends Component {

   static propTypes = {
      title: PropTypes.string.isRequired,
      s3_key: PropTypes.string.isRequired,
      project_paths: PropTypes.array.isRequired,
      selected_path: PropTypes.string.isRequired,
      on_select_path: PropTypes.func.isRequired,
      refresh_project_paths: PropTypes.func.isRequired,
      components: PropTypes.array.isRequired,
   }

   select_path = (project_path) => {
      const {selected_path, on_select_path} = this.props;
      if (selected_path === project_path) {
         on_select_path(NONE_EXPANDED);
      } else {
         on_select_path(project_path);
      }
   }

   render() {
      const {title, s3_key, project_paths, selected_path, refresh_project_paths, components} = this.props;
      const projectBlocks = project_paths.map(project_path => {
         const is_expanded = project_path === selected_path;
         const project_block = <ProjectBlock
            key={`project_block_${project_path}`}
            project_path={project_path}
            is_expanded={is_expanded}
            components={components}
            refresh_project_paths={() => refresh_project_paths()}
         />
         return is_expanded ? project_block :
            <AppStyles.Clickable
               key={`clickable_${project_path}`}
               onClick={e => this.select_path(project_path)}>
               {project_block}
            </AppStyles.Clickable>
      });
      return <FrameWrapper>
         <ProjectsFrameBar
            title={title}
            s3_key={s3_key}
            refresh_project_paths={() => refresh_project_paths()}/>
         <AllProjects>{projectBlocks}</AllProjects>
      </FrameWrapper>
   }
}

export default ProjectsFrame;
