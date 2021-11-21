import {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles, AppBrand, AppTitleBar} from "../app/AppImports";

export class PageWorks extends Component {

    static propTypes = {
        routes: PropTypes.array,
    }

    render() {
        const {routes} = this.props;
        const feature_blocks = routes.map(route => {
            return <AppStyles.FeatureBlock
                onClick={e => window.location = route.path}>
                {route.segment}
            </AppStyles.FeatureBlock>
        })
        return <AppStyles.PageWrapper>
            <AppTitleBar
                title={AppBrand.WORKS_TITLE}
                blurb={AppBrand.CATCH_PHRASE}/>
            <AppStyles.ContentWrapper>
                {feature_blocks}
            </AppStyles.ContentWrapper>
        </AppStyles.PageWrapper>
    }
}

export default PageWorks;
