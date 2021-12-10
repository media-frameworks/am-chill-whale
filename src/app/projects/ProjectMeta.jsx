import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../AppImports";
import StoreS3, {S3_PREFIX} from "../../common/StoreS3";
import Utils from "../../common/Utils";
import CoolInputText from "../../common/CoolInputText";

const EDIT_MODE_DESCRIPTION = "edit_description";
const EDIT_MODE_PROJECT_NAME = "edit_project_name";
const EDIT_MODE_NONE = "edit_none";

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
        project_path: PropTypes.string.isRequired,
        expanded: PropTypes.bool.isRequired,
        props_handler: PropTypes.element.isRequired,
    }

    state = {
        data: {},
        edit_mode: EDIT_MODE_NONE,
        input_ref: React.createRef()
    };

    componentDidMount() {
        const {project_path} = this.props;
        const main_file_path = `${project_path}main.json`;
        StoreS3.get_file_async(main_file_path, S3_PREFIX, data => {
            this.setState({data: JSON.parse(data)});
        });
    }

    created_on_text = (data) => {
        if (!data.created) {
            return "in the past";
        }
        return Utils.time_ago(data.created);
    }

    update_data = (data) => {
        data["updated"] = Utils.now_string();
        StoreS3.put_file_async(data.s3_path, JSON.stringify(data), S3_PREFIX, result => {
            console.log("update_data", result, data);
            this.setState({data: data});
        })
    }

    edit_description = () => {
        const {data} = this.state;
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
                        this.update_data(data);
                    }
                    this.setState({edit_mode: EDIT_MODE_NONE});
                }}
            />
        </DescriptionEdit>
    }

    edit_project_name = () => {
        const {data} = this.state;
        const project_name = data.name;
        return <CoolInputText
            value={project_name}
            placeholder={'re-name this project'}
            callback={new_value => {
                if (new_value !== data["name"]) {
                    data["name"] = new_value;
                    this.update_data(data);
                }
                this.setState({edit_mode: EDIT_MODE_NONE});
            }}
        />
    }

    set_edit_mode = (edit_mode) => {
        this.setState({edit_mode: edit_mode})
    }

    render() {
        const {data, edit_mode} = this.state;
        const {expanded, props_handler} = this.props;
        console.log("ProjectMeta", this.props, this.state)
        const name_style = {color: expanded ? 'black' : AppColors.HSL_DEEP_BLUE};
        const description = data.description ? data.description : "click to describe this";
        const updated = data['updated'] ? true : false;
        const project_props = React.createElement(props_handler, {
            data: data,
            callback: data => this.update_data(data)
        })
        const sections = [
            [
                edit_mode === EDIT_MODE_PROJECT_NAME ? this.edit_project_name() :
                    <ProjectNameSpan
                        key={"name_span"} style={name_style}
                        onClick={e => this.setState({edit_mode: EDIT_MODE_PROJECT_NAME})}>
                        {data.name}
                    </ProjectNameSpan>,
                (expanded && <ProjectDetails title={data['created']} key={"created_span"}>
                    {"created "}{Utils.time_ago(data.created)}</ProjectDetails>),
                (expanded && updated && <ProjectDetails title={data['updated']} key={"updated_span"}>
                    {", updated "}{Utils.time_ago(data.updated)}</ProjectDetails>),
            ],
            edit_mode === EDIT_MODE_DESCRIPTION ? this.edit_description() :
                <ProjectDescription onClick={e => this.setState({edit_mode: EDIT_MODE_DESCRIPTION})}>
                    {description}
                </ProjectDescription>,
            project_props,
        ];
        const all_sections = sections.map((section, index) => {
            return <div key={`section_${index}`}>{section}</div>
        })
        console.log("all_sections", all_sections)
        return <ProjectWrapper>
            {expanded ? all_sections : sections[0]}
        </ProjectWrapper>
    }
}

export default ProjectMeta;
