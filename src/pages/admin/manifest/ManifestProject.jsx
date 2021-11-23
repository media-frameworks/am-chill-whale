import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../app/AppImports";
import StoreS3, {S3_PREFIX} from "../../../common/StoreS3";

const ProjectWrapper = styled.div`
    ${AppStyles.block}
    ${AppStyles.noselect}
    border: 0.15rem solid #aaaaaa;
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    margin: 0.25rem 0;
    background-color: white;
    min-height: 1.5rem;
`;

const ProjectNameSpan = styled.span`
    ${AppStyles.bold};
    ${AppStyles.pointer};
    font-size: 1.25rem;
 `;

export class ManifestProject extends Component {

    static propTypes = {
        project_path: PropTypes.string.isRequired,
        expanded: PropTypes.bool.isRequired
    }

    state = {
        data: {}
    };

    componentDidMount() {
        const {project_path} = this.props;
        const main_file_path = `${project_path}main.json`;
        StoreS3.get_file_async(main_file_path, S3_PREFIX, data => {
            this.setState({data: JSON.parse(data)});
        });
    }

    render() {
        const {data} = this.state;
        const {project_path, expanded} = this.props;
        const name_style = {color: expanded ? 'black' : AppColors.HSL_DEEP_BLUE};
        return <ProjectWrapper>
            <ProjectNameSpan style={name_style}>{data.name}</ProjectNameSpan>
        </ProjectWrapper>
    }
}

export default ManifestProject;
