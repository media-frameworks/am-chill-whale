import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";
import SectionIndex, {NO_SELECTION} from "../../common/SectionIndex";
import StoreS3, {S3_PREFIX} from "../../common/StoreS3";

const SECTIONS = [
    {title: "animator", key: "animator"},
];

export class Admin3D extends Component {

    static propTypes = {
        routes: PropTypes.array,
    }

    state = {
        admin_back_ref: React.createRef(),
        selected_title: NO_SELECTION,
        selected_key: NO_SELECTION,
        selected_path: NO_SELECTION,
        project_paths: []
    };

    componentDidMount() {
        const {admin_back_ref} = this.state;
        AppBrand.swatch_fadein(admin_back_ref, AppBrand.COOL_FADE_IN_MS);
    }

    refresh_project_paths = (entry_key) => {
        StoreS3.list_files_async(entry_key, S3_PREFIX, data => {
            const project_paths = data.CommonPrefixes.map(obj => obj.Prefix.substr(S3_PREFIX.length + 1))
            this.setState({project_paths: project_paths});
        })
    }

    selectEntry = (title) => {
        const {selected_title} = this.state;
        const isSelected = selected_title === title;
        if (isSelected) {
            this.setState({
                selected_title: NO_SELECTION,
                selected_key: NO_SELECTION,
            });
        } else {
            const entry = SECTIONS.find(entry => entry.title === title);
            this.setState({
                selected_title: entry.title,
                selected_key: entry.key,
            });
            this.refresh_project_paths(entry.key)
        }
    }

    render() {
        const {admin_back_ref, selected_title, selected_key, project_paths, selected_path} = this.state;
        const title = "render 3D";
        const have_selection = selected_key !== NO_SELECTION;
        return <AppStyles.PageWrapper>
            <AppTitleBar title={title} blurb={AppBrand.CATCH_PHRASE}/>
            {AppBrand.link_swatch(admin_back_ref, AppBrand.ADMIN_TITLE, AppBrand.ADMIN_PATH)}
            <SectionIndex
                index={SECTIONS}
                title={"frameworks"}
                selected_index={selected_title}
                index_paths={project_paths}
                selected_path={selected_path}
                on_select_index={title => this.selectEntry(title)}
                on_select_path={path => this.setState({selected_path: path})}
            />
        </AppStyles.PageWrapper>
    }
}

export default Admin3D;
