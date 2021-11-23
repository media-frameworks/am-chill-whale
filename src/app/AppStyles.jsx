import styled, {css} from "styled-components";

import AppColors from "./AppColors";

export class AppStyles {

    static TITLEBAR_HEIGHT_REM = 2.5;

    static pointer = css`
        cursor: pointer;
    `;

    static noselect = css`
        user-select: none;
    `;

    static block = css`
        display: block;
    `;

    static inline = css`
        display: inline;
    `;

    static inline_block = css`
        display: inline-block;
    `;

    static underline = css`
        text-decoration: underline;
    `;

    static uppercase = css`
        text-transform: uppercase;
    `;

    static bold = css`
        font-weight: bold;
    `;

    static italic = css`
        font-style: italic;
    `;

    static monospace = css`
        font-family: Courier;
        font-weight: bold;
    `;

    static LinkSpan = styled.span`
        ${AppStyles.pointer}
        ${AppStyles.noselect}
    `;

    static Clickable = styled.div`
        ${AppStyles.pointer}
        ${AppStyles.noselect}
    `;

    static PageWrapper = styled.div`
        position: absolute;
        font-family: Arial;
        font-size: 1rem;
        overflow: hidden;
        height: 100%;
        margin: 0;
        top: 0;
        left: 0;
        right: 0;
        background-color: ${AppColors.PAGE_FIELD};
        overflow: auto;
    `;

    static ContentWrapper = styled.div`
        margin-top: ${AppStyles.TITLEBAR_HEIGHT_REM}rem;
    `;

    static swatch = css`
        &:hover {
          background: linear-gradient(138deg, 
            rgba(0,0,0,0) 0, 
            rgba(0,0,0,0) 25%, 
            #cccccc 50%, 
            rgba(0,0,0,0) 75%, 
            rgba(0,0,0,0) 100%);
          color: black;
        }
    `;

    static wide_swatch = css`
        &:hover {
          background: linear-gradient(138deg, 
            rgba(0,0,0,0) 0, 
            rgba(0,0,0,0) 15%, 
            #cccccc 50%, 
            rgba(0,0,0,0) 85%, 
            rgba(0,0,0,0) 100%);
          color: black;
        }
    `;

    static narrow_swatch = css`
        &:hover {
          background: linear-gradient(138deg, 
            rgba(0,0,0,0) 0, 
            rgba(0,0,0,0) 35%, 
            #cccccc 50%, 
            rgba(0,0,0,0) 65%, 
            rgba(0,0,0,0) 100%);
          color: black;
        }
    `;

    static tiny_swatch = css`
        &:hover {
          background: linear-gradient(138deg, 
            rgba(0,0,0,0) 0, 
            rgba(0,0,0,0) 42.5%, 
            #cccccc 50%, 
            rgba(0,0,0,0) 57.5%, 
            rgba(0,0,0,0) 100%);
          color: black;
        }
    `;

    static FeatureBlock = styled.div`
        ${AppStyles.pointer}
        ${AppStyles.swatch}
        display: block;
        font-size: 1.25rem;
        color: #888888;
        padding: 1rem 2rem;
        text-align: center;
    `;


}

export default AppStyles;
