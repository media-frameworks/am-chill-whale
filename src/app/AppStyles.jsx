import styled from "styled-components";

import AppColors from "./AppColors";

export class AppStyles {

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

}

export default AppStyles;
