import {Component} from 'react';

import AppStyles from "../app/AppStyles";
import AppTitleBar from "../app/AppTitleBar";

export class PageWorks extends Component {
    render() {
        const title= "creative works";
        const blurb= "artifacts for the third millennium";
        return <AppStyles.PageWrapper>
            <AppTitleBar title={title} blurb={blurb} />
        </AppStyles.PageWrapper>
    }
}

export default PageWorks;
