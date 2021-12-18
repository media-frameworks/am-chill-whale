import {css} from "styled-components";

export class AppColors {

    static PAGE_FIELD = "#fcfcfc";
    static TITLEBAR_FIELD_1 = "#fcfcfc";
    static TITLEBAR_FIELD_2 = "#eeeeee";

    static HSL_COOL_BLUE = 'hsla(200, 90%, 50%, 85%)';
    static HSL_LIGHT_COOL_BLUE = 'hsla(200, 90%, 50%, 15%)';
    static HSL_MEDIUM_COOL_BLUE = 'hsla(200, 90%, 50%, 50%)';
    static COLOR_COOL_BLUE = css`
        color: ${AppColors.HSL_COOL_BLUE};
    `;

    static HSL_DEEP_BLUE = 'hsla(200, 90%, 40%, 100%)';
    static HSL_LIGHT_DEEP_BLUE = 'hsla(200, 50%, 50%, 50%)';
    static COLOR_DEEP_BLUE = css`
        color: ${AppColors.HSL_DEEP_BLUE};
    `;
}

export default AppColors;
