import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppBrand, AppTitleBar} from "../app/AppImports";

import Logo from "../res/images/logo.jpg"

const SectionLink = styled.div`
    ${AppStyles.noselect}
    ${AppStyles.pointer}
    text-align: center;
    font-size: 2.0rem;
    color: #aaaaaa;
    letter-spacing: 1rem;
    padding: 0.5rem;
`;

const SwatchSpan = styled.span`
    &:hover {
      background: linear-gradient(138deg, 
        rgba(0,0,0,0) 0, 
        rgba(0,0,0,0) 10%, 
        #cccccc 50%, 
        rgba(0,0,0,0) 90%, 
        rgba(0,0,0,0) 100%);
      color: black;
    }
`;

const LogoBlock = styled.div`
    text-align: center;
`;

const LogoImage = styled.img`
    width: 12rem;
    margin-top: 8.5rem;
    margin-bottom: 2.5rem;
`;

export class PageAdmin extends Component {

    static propTypes = {
        routes: PropTypes.array
    }

    render() {
        const {routes} = this.props;
        const top_link_style = {marginTop: `${AppStyles.TITLEBAR_HEIGHT_REM + 6}rem`};
        const feature_blocks = routes.map((route, not_first) => {
            const padding = Math.floor (route.segment.length / 2) + 1;
            let bumper = '';
            for (let i = 0; i < padding; i++) {
                bumper += '\xa0';
            }
            return <SectionLink
                style={!not_first ? top_link_style : {}}
                onClick={e => window.location = route.path}>
                <SwatchSpan>
                    {bumper}
                    {route.title}
                    {bumper}
                </SwatchSpan>
            </SectionLink>
        })
        return <AppStyles.PageWrapper>
            <AppTitleBar title={AppBrand.BRAND_NAME} blurb={AppBrand.CATCH_PHRASE}/>
            {feature_blocks}
            <LogoBlock><LogoImage src={Logo}/></LogoBlock>
        </AppStyles.PageWrapper>
    }
}

export default PageAdmin;
