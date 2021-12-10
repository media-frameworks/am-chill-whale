import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAngleRight} from '@fortawesome/free-solid-svg-icons'
import {faAngleDown} from '@fortawesome/free-solid-svg-icons'

import {AppStyles} from "../app/AppImports";
import StoreS3, {S3_PREFIX} from "./StoreS3";

export const NO_SELECTION = "None";

const IndexWrapper = styled.div`
    position: fixed;
    left: 0;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    bottom: 0;
    right: 85%;
    background-color: #eeeeee;
    border-right: 0.15rem solid #bbbbbb;
`;

const TitleWrapper = styled.div`
    ${AppStyles.block}
    ${AppStyles.underline}
    padding: 1rem 0.5rem;            
`;

const IndexTitle = styled.span`
    ${AppStyles.noselect}
    font-size: 1.125rem;
    font-weight: bold;
    color: #666666;
`;

const IndexEntry = styled.div`
    ${AppStyles.block}
    ${AppStyles.noselect}
    ${AppStyles.pointer}
    font-size: 1rem;
    margin-left: 0.75rem;
    margin-bottom: 0.5rem;
    color: #666666;
`;

const EntryBasic = css`
    font-size: 1.125rem;
    margin-left: 0.25rem;
    color: #666666;
    vertical-align: top;
`;

const EntryName = styled.div`
    ${AppStyles.inline_block}
    ${EntryBasic}
`;

const EntryIcon = styled.div`
    ${AppStyles.inline_block}
    ${EntryBasic}
    margin-top: 0.125rem;
    width: 0.75rem;
`;

const SubEntry = styled.div`
    ${AppStyles.block}
    ${AppStyles.ellipsis}
    margin-left: 1.25rem;
`;

export class SectionIndex extends Component {

    static propTypes = {
        index: PropTypes.array.isRequired,
        title: PropTypes.string.isRequired,
        selected_index: PropTypes.string.isRequired,
        index_paths: PropTypes.array.isRequired,
        on_select_index: PropTypes.func.isRequired,
        on_select_path: PropTypes.func.isRequired,
        selected_path: PropTypes.string.isRequired,
    }

    list_selected_paths = () => {
        const {index_paths, on_select_path, selected_path} = this.props;
        return index_paths.sort((a, b) => a > b ? 1 : -1)
            .map(path => {
                const project_ref = React.createRef();
                StoreS3.get_file_async(`${path}main.json`, S3_PREFIX, data => {
                    const json = JSON.parse(data);
                    const interval = setInterval(() => {
                        if (project_ref.current) {
                            project_ref.current.innerText = json.name;
                            clearInterval(interval)
                        }
                    }, 100);
                });
                const style = {fontWeight: 'bold', color: '#333333'}
                return <SubEntry
                    style={path === selected_path ? style : {}}
                    key={`subentry_${path}`}
                    onClick={e => on_select_path(path)}
                    ref={project_ref}>...</SubEntry>
            });
    }

    render() {
        const {index, title, selected_index, on_select_index} = this.props;
        const entries = index.sort((a, b) => a.title > b.title ? 1 : -1)
            .map(entry => {
                const isSelected = selected_index === entry.title;
                const icon = isSelected ? <FontAwesomeIcon icon={faAngleDown}/> : <FontAwesomeIcon icon={faAngleRight}/>
                return <IndexEntry
                    key={`index_entry_${entry.key}`}>
                    <EntryIcon onClick={e => on_select_index(entry.title)}>{icon}</EntryIcon>
                    <EntryName onClick={e => on_select_index(entry.title)}>{entry.title}</EntryName>
                    {isSelected ? this.list_selected_paths() : []}
                </IndexEntry>
            });
        return <IndexWrapper>
            <TitleWrapper>
                <IndexTitle>{title}</IndexTitle>
            </TitleWrapper>
            {entries}
        </IndexWrapper>
    }
}

export default SectionIndex;
