import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../AppImports";
import {PROJECTS_TITLEBAR_HEIGHT_REM} from "./ProjectsTitleBar";
import ProjectsFrameBar from "./ProjectsFrameBar";
import ProjectMeta from "./ProjectMeta";

const NONE_EXPANDED = 'None';

const FrameWrapper = styled.div`
    position: fixed;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM + PROJECTS_TITLEBAR_HEIGHT_REM}rem;
    left: 15%;
    right: 0;
    bottom: 0;
    padding: 0.125rem 1rem 0;
    background-color: #dddddd;
`;

const ProjectsBlock = styled.div`
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
        props_handler: PropTypes.element.isRequired,
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
        const {selected_path, props_handler} = this.props;
        const {title, s3_key, project_paths, refresh_project_paths} = this.props;
        const projectBlocks = project_paths.map(project_path => {
            const is_expanded = project_path === selected_path;
            const project_block = <ProjectMeta
                expanded={is_expanded}
                key={project_path}
                project_path={project_path}
                props_handler={props_handler}/>;
            return is_expanded ? project_block :
                <AppStyles.Clickable
                    key={`project_${project_path}`}
                    onClick={e => this.select_path(project_path)}>
                    {project_block}
                </AppStyles.Clickable>
        });
        return <FrameWrapper>
            <ProjectsFrameBar
                title={title}
                s3_key={s3_key}
                refresh_project_paths={() => refresh_project_paths()}/>
            <ProjectsBlock>{projectBlocks}</ProjectsBlock>
        </FrameWrapper>
    }
}

export default ProjectsFrame;
