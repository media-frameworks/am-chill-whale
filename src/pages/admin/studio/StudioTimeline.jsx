import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

// import {Synth, now} from 'tone';

import {AppStyles} from "../../../app/AppImports";

const MARGIN_PX = 7;

const TimelineWrapper = styled(AppStyles.Block)`
   ${AppStyles.noselect}
   margin: ${MARGIN_PX}px auto 0;
   background-color: white;
   border: 0.15rem solid #888888;
   border-radius: 3px;
`;

export class StudioTimeline extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      height_px: PropTypes.number.isRequired,
      settings: PropTypes.object.isRequired,
      tracks: PropTypes.array.isRequired,
   }

   state = {
   };

   componentDidMount() {
   }

   render() {
      const {width_px, height_px} = this.props;
      const full_width_px = width_px - 2 * MARGIN_PX;
      const full_height_px = height_px - 2 * MARGIN_PX;
      const wrapper_style = {
         width: `${full_width_px}px`,
         height: `${full_height_px}px`,
      };
      return <TimelineWrapper
         style={wrapper_style}>
         {"timeline"}
      </TimelineWrapper>
   }
}

export default StudioTimeline;
