import styled, {css} from "styled-components";

import Utils from "../common/Utils";
import AppStyles from "./AppStyles";

export class AppBrand {

    static BRAND_NAME = 'am chill whale';
    static CATCH_PHRASE = 'artifacts for the third millennium';

    static WORKS_TITLE = 'creative works';
    static WORKS_PATH = '/works';

    static ADMIN_TITLE = 'administer';
    static ADMIN_PATH = '/admin';

    static COOL_FADE_IN_MS = 750;

    static MidSwatch = css`
      position: fixed;
      color: white;
      text-align: center;
      width: 100%;
      letter-spacing: 0.25rem;
      z-index: 100;
    `;

    static UpperSwatch = styled.div`
      ${AppBrand.MidSwatch}
      top: 0;
      height: 1.5rem;
      font-size: 1.25rem;
      background: linear-gradient(120deg, 
        rgba(0,0,0,0) 0, 
        rgba(0,0,0,0) 35%, 
        #cccccc 50%, 
        rgba(0,0,0,0) 65%, 
        rgba(0,0,0,0) 100%);
    `;

    static LowerSwatch = styled.div`
      ${AppBrand.MidSwatch}
      top: 1.5rem;
      height: 1rem;
      font-size: 0.85rem;
      opacity: 0;
      background: linear-gradient(-120deg, 
        rgba(0,0,0,0) 0, 
        rgba(0,0,0,0) 35%, 
        #cccccc 50%, 
        rgba(0,0,0,0) 65%, 
        rgba(0,0,0,0) 100%);
    `;

    static swatch_fadein = (ref, fadein_ms) => {
        Utils.animate(ref, fadein_ms, 0, 1, (value, is_last) => {
            ref.current.style.opacity = value;
            ref.current.style.letterSpacing = `${0.5 + 0.25 * (1.0 - value)}rem`;
        });
    }

    static link_swatch = (ref, title, link) => {
        return <AppBrand.LowerSwatch ref={ref}>
            <AppStyles.LinkSpan onClick={e => window.location = link}>
                {title}
            </AppStyles.LinkSpan>
        </AppBrand.LowerSwatch>
    }

}

export default AppBrand;
