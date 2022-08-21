import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
// import StoreS3 from "common/StoreS3";

const ImageLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin-right: 0.25rem;
`;

export class BailiwickImages extends Component {

   static propTypes = {
      bailiwick_data: PropTypes.object.isRequired,
   }

   state = {}

   generate_image = (pixels) => {
      const {bailiwick_data} = this.props;
      console.log(`generate_image  ${pixels}`, bailiwick_data);
   }

   render() {
      const image_512_link = <ImageLink
         onClick={e => this.generate_image(512)}>{"512"}</ImageLink>
      const image_1024_link = <ImageLink
         onClick={e => this.generate_image(1024)}>{"1024"}</ImageLink>
      const image_2048_link = <ImageLink
         onClick={e => this.generate_image(2048)}>{"2048"}</ImageLink>
      return [
         image_512_link,
         image_1024_link,
         image_2048_link,
      ]
   }
}

export default BailiwickImages;
