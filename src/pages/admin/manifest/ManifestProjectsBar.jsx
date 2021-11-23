import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons';

import {AppStyles, AppColors} from "../../../app/AppImports";
import StoreS3, {S3_PREFIX} from "../../../common/StoreS3";
import Utils from "../../../common/Utils";
import {MANIFEST_TITLEBAR_HEIGHT_REM} from "./ManifestTitleBar"

const COOL_BORDER = css`
    border: 0.125rem solid ${AppColors.HSL_COOL_BLUE};
    border-radius: 0.25rem;
`;

const COOL_BLUE_TEXT = css`
    ${AppColors.COLOR_COOL_BLUE};
    font-size: 1rem;
    padding: 0.125rem 0;
`;

const ProjectBarWrapper = styled.div`
    position: fixed;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM + MANIFEST_TITLEBAR_HEIGHT_REM}rem;
    left: 15%;
    right: 0;
    padding: 0.125rem 1rem 0;
`;

const CreateProjectButton = styled.div`
    ${AppStyles.inline_block};
    ${AppStyles.pointer};
    ${AppStyles.noselect};
    ${AppColors.COLOR_COOL_BLUE};
    ${COOL_BORDER};
    padding: 0 0.5rem;
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
    ${COOL_BLUE_TEXT};
    margin-left: 0.5rem;
`;

const InputText = styled.input`
    ${COOL_BORDER};
    ${COOL_BLUE_TEXT};
    ${AppStyles.monospace};
    width: 15rem;
    outline: none;
    margin: 0.5rem 0;
    padding: 0 0.5rem;
`;

export class ManifestProjectsBar extends Component {

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

    new_project = () => {
        const {input_ref} = this.state;
        this.setState({new_project_mode: true});
        const key_handler = (key) => {
            if (key.code === "Escape") {
                this.setState({new_project_mode: false});
                document.removeEventListener("keydown", key_handler);
            }
            if (key.code === "Enter" || key.code === "NumpadEnter") {
                if (!input_ref.current) {
                    document.removeEventListener("keydown", key_handler);
                } else {
                    const project_name = input_ref.current.value;
                    this.create_project(project_name);
                    this.setState({new_project_mode: false});
                }
            }
        }
        document.addEventListener("keydown", key_handler);
    }

    new_project_data = () => {
        const {input_ref} = this.state;
        return <InputText ref={input_ref} autoFocus/>
    }

    new_project_button = () => {
        return <CreateProjectButton onClick={e => this.new_project()}>
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

export default ManifestProjectsBar;
