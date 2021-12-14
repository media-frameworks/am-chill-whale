import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../AppImports";
import Utils from "../../common/Utils";
import StoreS3, {S3_PREFIX} from "../../common/StoreS3";
import ProjectMeta from "./ProjectMeta";
import ProjectSegmentsFrame from "./ProjectSegmentsFrame";

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

export class ProjectBlock extends Component {

    static propTypes = {
        project_path: PropTypes.string.isRequired,
        is_expanded: PropTypes.bool.isRequired,
    }

    state = {
        data: {}
    };

    componentDidMount() {
        const {project_path} = this.props;
        StoreS3.get_file_async(`${project_path}main.json`, S3_PREFIX, data => {
            this.setState({data: JSON.parse(data)});
        });
    }

    update_data = (data) => {
        data["updated"] = Utils.now_string();
        StoreS3.put_file_async(data.s3_path, JSON.stringify(data), S3_PREFIX, result => {
            console.log("update_data", result, data);
            this.setState({data: data});
        })
    }

    render() {
        const {data} = this.state;
        const {is_expanded} = this.props;
        return <ProjectWrapper>
            <ProjectMeta
                data={data}
                is_expanded={is_expanded}
                on_update={data => this.update_data(data)}/>
            {is_expanded && <ProjectSegmentsFrame
                data={data}
                is_expanded={is_expanded}
                on_update={data => this.update_data(data)}/>}
        </ProjectWrapper>;
    }
}

export default ProjectBlock;
