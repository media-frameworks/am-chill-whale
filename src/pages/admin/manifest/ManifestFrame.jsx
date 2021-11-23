import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import {MANIFEST_TITLEBAR_HEIGHT_REM} from "./ManifestTitleBar";
import ManifestProjectsBar from "./ManifestProjectsBar";
import ManifestProject from "./ManifestProject";

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
    }

    render() {
        const {title, s3_key, project_paths} = this.props;
        const projectBlocks = project_paths.map (project_path => {
            return <ManifestProject key={project_path} project_path={project_path} />
        });
        return <FrameWrapper>
            <ManifestProjectsBar title={title} s3_key={s3_key}/>
            <ManifestProjects>
                {projectBlocks}
            </ManifestProjects>
        </FrameWrapper>
    }
}

export default ManifestFrame;
