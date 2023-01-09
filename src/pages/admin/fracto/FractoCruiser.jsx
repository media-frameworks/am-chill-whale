import {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

// import {AppStyles} from "app/AppImports";

import {render_title_bar} from "./FractoStyles";

export class FractoCruiser extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      height_px: PropTypes.number.isRequired,
   }

   state = {}

   render() {
      const title_bar = render_title_bar(`fracto cruiser`);
      return [
         title_bar
      ]
   }
}

export default FractoCruiser;
