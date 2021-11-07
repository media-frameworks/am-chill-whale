import {Component} from 'react';

import AppStyles from "../app/AppStyles";
import AppTitleBar from "../app/AppTitleBar";
import AppBrand from "../app/AppBrand";

export class PageMain extends Component {
    render() {
        const title = AppBrand.BRAND_NAME;
        const blurb = "artifacts for the third millennium";
        return <AppStyles.PageWrapper>
            <AppTitleBar title={title} blurb={blurb}/>
        </AppStyles.PageWrapper>
    }
}

export default PageMain;
