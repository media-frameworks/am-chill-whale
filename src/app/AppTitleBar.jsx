import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppBrand from "./AppBrand";
import AppColors from "./AppColors";
import AppStyles from "./AppStyles";

const TitleBar = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    border-bottom: 0.15rem solid #aaaaaa;
    background: linear-gradient(120deg, ${AppColors.TITLEBAR_FIELD_1}, ${AppColors.TITLEBAR_FIELD_2}); 
    z-index: 100;
    box-shadow: 0.25rem 0.25rem 8rem rgba(0,0,0,15%);
    opacity: 0;
`;

const TitleText = styled.div`
    ${AppStyles.noselect}
    position: fixed;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM - 1}rem;
    left: 2.5rem;
    font-size: 1rem;
    color: #888888;
    letter-spacing: 0.75rem;
    text-transform: uppercase;
`;

const TitleBlurb = styled.div`
    ${AppStyles.noselect}
    position: fixed;
    font-family: Courier;
    font-weight: bold;
    top: ${AppStyles.TITLEBAR_HEIGHT_REM - 1.75}rem;
    right: 2.5rem;
    font-size: 0.75rem;
    color: white;
    letter-spacing: 0.25rem;
    margin-right: 1rem;
    margin-top: 0.75rem;
    text-shadow: 0.25rem 0.25rem 0.5rem #888888;
`;

const Smoll = styled.span`
    font-size: 0.65rem;
    margin: 0 0.65rem;
    vertical-align: middle;
    color: white;
`;

export class AppTitleBar extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        blurb: PropTypes.string.isRequired,
    }

    state = {
        titlebar_ref: React.createRef()
    }

    componentDidMount() {
        const {titlebar_ref} = this.state;
        AppBrand.swatch_fadein(titlebar_ref, AppBrand.COOL_FADE_IN_MS);
    }

    brand_label = () => {
        const {link_path} = this.props;
        return <AppBrand.UpperSwatch>
            <AppStyles.LinkSpan
                onClick={e => window.location = link_path}>
                <Smoll>an</Smoll>{AppBrand.BRAND_NAME}<Smoll>gig</Smoll>
            </AppStyles.LinkSpan>
        </AppBrand.UpperSwatch>
    }

    render() {
        const {titlebar_ref} = this.state;
        const {title, blurb} = this.props;
        const branding = title === AppBrand.BRAND_NAME ? '' : this.brand_label();
        return <TitleBar ref={titlebar_ref}>
            <TitleText>{title}</TitleText>
            <TitleBlurb>{blurb}</TitleBlurb>
            {branding}
        </TitleBar>
    }
}

export default AppTitleBar;
