import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";
import SectionIndex from "../../common/SectionIndex";
import ManifestTitleBar from "./manifest/ManifestTitleBar";
import ManifestFrame from "./manifest/ManifestFrame";
import StoreS3, {S3_PREFIX} from "../../common/StoreS3";

const NO_SELECTION = "None";

const SECTIONS = [
    {title: "chaotic", key: "chaotic"},
    {title: "documentary", key: "documentary"},
    {title: "reactive", key: "reactive"},
    {title: "composed", key: "composed"},
    {title: "endo-fractal", key: "endo-fractal"},
    {title: "exo-fractal", key: "exo-fractal"},
    {title: "generated", key: "generated"},
    {title: "invented", key: "invented"},
    {title: "intermodal", key: "intermodal"},
    {title: "performed", key: "performed"},
    {title: "written", key: "written"},
];

export class AdminManifest extends Component {

    static propTypes = {
        routes: PropTypes.array,
    }

    state = {
        admin_back_ref: React.createRef(),
        selected_title: NO_SELECTION,
        selected_key: NO_SELECTION,
        project_paths: []
    };

    componentDidMount() {
        const {admin_back_ref} = this.state;
        AppBrand.swatch_fadein(admin_back_ref, AppBrand.COOL_FADE_IN_MS);
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
            StoreS3.list_files_async(entry.key, S3_PREFIX, data => {
                const project_paths = data.CommonPrefixes.map(obj => obj.Prefix.substr(S3_PREFIX.length + 1))
                console.log("project_paths", project_paths);
                this.setState({
                    selected_title: entry.title,
                    selected_key: entry.key,
                    project_paths: project_paths
                });
            })
        }
    }

    render() {
        const {admin_back_ref, selected_title, selected_key, project_paths} = this.state;
        const title = "production manifest";
        return <AppStyles.PageWrapper>
            <AppTitleBar title={title} blurb={AppBrand.CATCH_PHRASE}/>
            {AppBrand.link_swatch(admin_back_ref, AppBrand.ADMIN_TITLE, AppBrand.ADMIN_PATH)}
            <SectionIndex
                index={SECTIONS}
                title={"index of works"}
                selected_title={selected_title}
                onSelect={title => this.selectEntry(title)}
            />
            <ManifestTitleBar title={selected_title} s3_key={selected_key} project_paths={project_paths}/>
            <ManifestFrame title={selected_title} s3_key={selected_key} project_paths={project_paths}/>
        </AppStyles.PageWrapper>
    }
}

export default AdminManifest;
