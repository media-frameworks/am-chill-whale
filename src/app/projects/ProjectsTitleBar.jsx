import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from "styled-components";

import {AppStyles} from "../AppStyles";

export const PROJECTS_TITLEBAR_HEIGHT_REM = 1.5;

const TitleBarWrapper = styled.div`
    position: fixed;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    height: ${PROJECTS_TITLEBAR_HEIGHT_REM}rem;
    left: 15%;
    right: 0;
    padding: 0.125rem 1rem 0;
    background: linear-gradient(120deg, #666666, #cccccc);
`;

const TEXT_SHADOW_TIGHT = css`
    text-shadow: 0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 80%);
`;

const TitleSpan = styled.span`
    ${AppStyles.uppercase}
    ${AppStyles.noselect}
    ${TEXT_SHADOW_TIGHT}
    letter-spacing: 0.25rem;
    font-size: 0.75rem;
    color: white;
`;

const StatusSpan = styled.span`
    ${AppStyles.italic}
    ${AppStyles.noselect}
    ${TEXT_SHADOW_TIGHT}
    font-size: 0.65rem;
    color: #dddddd;
    padding-left: 1rem;
`;

export class ManifestTitleBar extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        s3_key: PropTypes.string.isRequired,
        project_paths: PropTypes.array.isRequired,
    }

    render() {
        const {title, project_paths} = this.props;
        return <TitleBarWrapper>
            <TitleSpan>{`${title} works`}</TitleSpan>
            <StatusSpan>{`${project_paths.length} projects`}</StatusSpan>
        </TitleBarWrapper>
    }
}

export default ManifestTitleBar;
