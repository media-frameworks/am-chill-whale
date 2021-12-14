import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles} from "./AppImports";
import SectionIndex, {NO_SELECTION} from "../common/SectionIndex";
import ProjectsTitleBar from "./projects/ProjectsTitleBar";
import ProjectsFrame from "./projects/ProjectsFrame";
import StoreS3, {S3_PREFIX} from "../common/StoreS3";

export class AppProjectsFrame extends Component {

    static propTypes = {
        sections: PropTypes.array.isRequired,
        sections_title: PropTypes.string.isRequired,
    }

    state = {
        selected_title: NO_SELECTION,
        selected_key: NO_SELECTION,
        selected_path: NO_SELECTION,
        project_paths: []
    };

    refresh_project_paths = (entry_key) => {
        StoreS3.list_files_async(entry_key, S3_PREFIX, data => {
            const project_paths = data.CommonPrefixes.map(obj => obj.Prefix.substr(S3_PREFIX.length + 1))
            this.setState({project_paths: project_paths});
        })
    }

    selectEntry = (title) => {
        const {selected_title} = this.state;
        const {sections} = this.props;
        const isSelected = selected_title === title;
        if (isSelected) {
            this.setState({
                selected_title: NO_SELECTION,
                selected_key: NO_SELECTION,
            });
        } else {
            const entry = sections.find(entry => entry.title === title);
            this.setState({
                selected_title: entry.title,
                selected_key: entry.key,
            });
            this.refresh_project_paths(entry.key)
        }
    }

    render() {
        const {selected_title, selected_key, project_paths, selected_path} = this.state;
        const {sections, sections_title} = this.props;
        const have_selection = selected_key !== NO_SELECTION;
        return <AppStyles.Block>
            <SectionIndex
                index={sections}
                title={sections_title}
                selected_index={selected_title}
                index_paths={project_paths}
                selected_path={selected_path}
                on_select_index={title => this.selectEntry(title)}
                on_select_path={path => this.setState({selected_path: path})}
            />
            {have_selection && <ProjectsTitleBar
                title={selected_title}
                s3_key={selected_key}
                project_paths={project_paths}
            />}
            {have_selection && <ProjectsFrame
                title={selected_title}
                s3_key={selected_key}
                project_paths={project_paths}
                selected_path={selected_path}
                refresh_project_paths={() => this.refresh_project_paths(selected_key)}
                on_select_path={path => this.setState({selected_path: path})}
            />}
        </AppStyles.Block>
    }
}

export default AppProjectsFrame;
