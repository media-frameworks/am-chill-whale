import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "../app/AppStyles";
import AppTitleBar from "../app/AppTitleBar";
import AppBrand from "../app/AppBrand";

const WorksLink = styled.div`
    text-align: center;
    margin-top: ${AppStyles.TITLEBAR_HEIGHT_REM + 4}rem;
    font-size: 2.75rem;
    color: #aaaaaa;
    letter-spacing: 1.5rem;
    cursor: pointer;
`;

export class PageMain extends Component {

    static propTypes = {
        routes: PropTypes.array
    }

    render() {
        const {routes} = this.props;
        console.log("routes", routes)
        const title = AppBrand.BRAND_NAME;
        const blurb = AppBrand.CATCH_PHRASE;
        return <AppStyles.PageWrapper>
            <AppTitleBar title={title} blurb={blurb}/>
            <WorksLink
                onClick={e => window.location = '/works'}>
                {AppBrand.WORKS_TITLE}
            </WorksLink>
        </AppStyles.PageWrapper>
    }
}

export default PageMain;
