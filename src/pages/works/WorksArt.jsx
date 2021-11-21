import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";

export class WorksArt extends Component {

    static propTypes = {
        routes: PropTypes.array,
    }

    state = {
        works_back_ref: React.createRef()
    };

    componentDidMount() {
        const {works_back_ref} = this.state;
        AppBrand.swatch_fadein(works_back_ref, AppBrand.COOL_FADE_IN_MS);
    }

    render() {
        const {works_back_ref} = this.state;
        const {routes} = this.props;
        const feature_blocks = routes.map(route => {
            return <AppStyles.FeatureBlock
                onClick={e => window.location = route.path}>
                {route.segment}
            </AppStyles.FeatureBlock>
        })
        const title = "graphic arts";
        const blurb = AppBrand.CATCH_PHRASE;
        return <AppStyles.PageWrapper>
            <AppTitleBar title={title} blurb={blurb}/>
            {AppBrand.link_swatch(works_back_ref, AppBrand.WORKS_TITLE, AppBrand.WORKS_PATH)}
            <AppStyles.ContentWrapper>
                {feature_blocks}
            </AppStyles.ContentWrapper>
        </AppStyles.PageWrapper>
    }
}

export default WorksArt;
