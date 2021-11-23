import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import {MANIFEST_TITLEBAR_HEIGHT_REM} from "./ManifestTitleBar";
import ManifestProjectsBar from "./ManifestProjectsBar";
import ManifestProject from "./ManifestProject";

const NONE_EXPANDED = 'None';

const FrameWrapper = styled.div`
    position: fixed;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM + MANIFEST_TITLEBAR_HEIGHT_REM}rem;
    left: 15%;
    right: 0;
    bottom: 0;
    padding: 0.125rem 1rem 0;
    background-color: #dddddd;
`;

const ManifestProjects = styled.div`
    margin-top: 2.75rem;
`;

export class ManifestFrame extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        s3_key: PropTypes.string.isRequired,
        project_paths: PropTypes.array.isRequired,
        refresh_project_paths: PropTypes.func.isRequired
    }

    state = {
        expanded_project: NONE_EXPANDED
    }

    expand_project = (project_path) => {
        const {expanded_project} = this.state;
        if (expanded_project === project_path) {
            this.setState({expanded_project: NONE_EXPANDED})
        } else {
            this.setState({expanded_project: project_path})
        }
    }

    render() {
        const {expanded_project} = this.state;
        const {title, s3_key, project_paths, refresh_project_paths} = this.props;
        const projectBlocks = project_paths.map(project_path => {
            const is_expanded = project_path === expanded_project;
            const project_block = <ManifestProject
                expanded={is_expanded}
                key={project_path}
                project_path={project_path}/>;
            return is_expanded ? project_block :
                <AppStyles.Clickable
                    onClick={e => this.expand_project(project_path)}>
                    {project_block}
                </AppStyles.Clickable>
        });
        return <FrameWrapper>
            <ManifestProjectsBar
                title={title}
                s3_key={s3_key}
                refresh_project_paths={() => refresh_project_paths()}
            />
            <ManifestProjects>
                {projectBlocks}
            </ManifestProjects>
        </FrameWrapper>
    }
}

export default ManifestFrame;
