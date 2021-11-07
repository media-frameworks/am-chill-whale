import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import Utils from "../common/Utils";

const TITLEBAR_FADE_IN_MS = 250;

const TitleBar = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2.5rem;
    border-bottom: 0.15rem solid #bbbbbb;
    background: linear-gradient(to bottom right, #ffffff, #eeeeee);
    z-index: 100;
    box-shadow: 0.25rem 0.25rem 8rem rgba(0,0,0,15%);
    opacity: 0;
`;

const TitleText = styled.div`
    position: fixed;
    top: 1rem;
    left: 2.5rem;
    font-size: 1.5rem;
    color: #aaaaaa;
    letter-spacing: 0.5rem;
`;

const TitleBlurb = styled.div`
    position: fixed;
    font-family: Courier;
    font-weight: bold;
    top: 0.75rem;
    right: 2.5rem;
    font-size: 1rem;
    color: white;
    letter-spacing: 0.25rem;
    margin-right: 1rem;
    margin-top: 0.75rem;
    text-shadow: 0.25rem 0.25rem 0.5rem #888888;
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
        Utils.animate(titlebar_ref, TITLEBAR_FADE_IN_MS, 0, 1, (value, is_last) => {
            titlebar_ref.current.style.opacity = value;
        });
    }

    render() {
        const {titlebar_ref} = this.state;
        const {title, blurb} = this.props;
        return <TitleBar ref={titlebar_ref}>
            <TitleText>{title}</TitleText>
            <TitleBlurb>{blurb}</TitleBlurb>
        </TitleBar>
    }
}

export default AppTitleBar;
