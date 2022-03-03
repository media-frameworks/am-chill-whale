import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import styled from "styled-components";

import ReactSlider from 'react-slider'

// import {AppStyles} from "../../../app/AppImports";
import FractoPaneCell from "./FractoPaneCell";

const BASE_SIZE = 360;
const CONTENT_WIDTH = "65%";
const CONTENT_HEIGHT = "85%";
const ZOOM_WIDTH = "2.5%";
const SIDEBAR_WIDTH = "14.5%";
const MARGIN_WIDTH = "8.75%";
const BORDER_RADIUS = "0.35rem";
const SLIDER_RIGHT = "26%";

const FRACTO_EXPLORE = 10001;

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: ${CONTENT_WIDTH} ${ZOOM_WIDTH} ${SIDEBAR_WIDTH}
    width: 82.5%;
    margin: 0 ${MARGIN_WIDTH} 0; 
`;

const StyledThumb = styled.div`
    width: 1.5rem;
    height: 1.5rem;
    line-height: 1.5rem;
    text-align: center;
    margin: 0 0.35rem;
    background-color: #666666;
    border-radius: 0.25rem;
    color: #eeeeee;
    cursor: grab;
    padding: 0px 5px;
    text-shadow: 0.25rem 0.25rem 0.25rem rgba(0,0,0,0.25);
`;

const StyledTrack = styled.div`
    left: 1rem;
    right: 0;
    width: 0.75rem;
    background-color: ${props => props.index === 2 ? '#f00' : props.index === 1 ? '#ddd' : '#ccc'};
`;

const StyledSlider = styled(ReactSlider)`
    position: absolute !important;
    right: ${SLIDER_RIGHT};
    height: ${CONTENT_HEIGHT};
`;

const Graphics = styled.div`
    width: ${CONTENT_WIDTH};
    height: ${CONTENT_HEIGHT};
    overflow: scroll;
    position: absolute;
    border 2px solid lightgrey;    
    border-radius: ${BORDER_RADIUS};
    box-shadow: 0.25rem 0.25rem 1.0rem rgba(0,0,0,0.15);
`;

export class FractoPanes extends Component {

   state = {
      factor: 1,
      hScroll: 0,
      vScroll: 0,
      viewport: {
         top: 1.0,
         right: 1.0,
         bottom: -1.0,
         left: -2.0
      },
      scroller_ref: React.createRef()
   };

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "explore", code: FRACTO_EXPLORE},
      ];
   }

   static on_menu_select = (code, segment_data) => {
      console.log("on_menu_select", code)
      switch (code) {
         case FRACTO_EXPLORE:
            console.log("FRACTO_EXPLORE")
            return true;
         default:
            return false;
      }
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {scroller_ref, vScroll, hScroll} = this.state;
      scroller_ref.current.scrollTop = vScroll;
      scroller_ref.current.scrollLeft = hScroll;
   }

   onScroll(e) {
      const {factor} = this.state;
      const viewport = {
         top: 1.0 - e.target.scrollTop / (factor * BASE_SIZE),
         right: (e.target.scrollLeft + e.target.clientWidth) / (factor * BASE_SIZE) - 2.0,
         bottom: 1.0 - (e.target.scrollTop + e.target.clientHeight) / (factor * BASE_SIZE),
         left: e.target.scrollLeft / (factor * BASE_SIZE) - 2.0
      };
      this.setState({
         viewport: viewport,
         hScroll: e.target.scrollLeft,
         vScroll: e.target.scrollTop
      });
   }

   onZoom(changed_factor) {
      const {factor, vScroll, hScroll} = this.state;
      const newFactor = Math.pow(2.0, changed_factor - 1);
      const scalar = newFactor / factor;
      const newHScroll = scalar * (hScroll + 200);
      const newVScroll = scalar * (vScroll + 150);
      this.setState({
         factor: newFactor,
         hScroll: newHScroll,
         vScroll: newVScroll
      });
   }

   render() {
      const {factor, scroller_ref, viewport} = this.state;
      const size = BASE_SIZE * factor;
      const Thumb = (props, state) => <StyledThumb {...props}>{state.valueNow}</StyledThumb>;
      const Track = (props, state) => <StyledTrack {...props} index={state.index}/>;
      return <Wrapper>
         <Graphics ref={scroller_ref}>
            <FractoPaneCell
               cellId={"00-10"} viewport={viewport}
               bounds={{top: 1.0, right: -1.0, bottom: 0.0, left: -2.0}}
               top={0} left={0} size={size}/>
            <FractoPaneCell
               cellId={"00-11"} viewport={viewport}
               bounds={{top: 1.0, right: 0.0, bottom: 0.0, left: -1.0}}
               top={0} left={size} size={size}/>
            <FractoPaneCell
               cellId={"01-10"} viewport={viewport}
               bounds={{top: 1.0, right: 1.0, bottom: 0.0, left: 0.0}}
               top={0} left={2 * size} size={size}/>
            <FractoPaneCell
               cellId={"00-10"} inverted={true} viewport={viewport}
               bounds={{top: 0.0, right: -1.0, bottom: -1.0, left: -2.0}}
               top={size - 1} left={0} size={size}/>
            <FractoPaneCell
               cellId={"00-11"} inverted={true} viewport={viewport}
               bounds={{top: 0.0, right: 0.0, bottom: -1.0, left: -1.0}}
               top={size - 1} left={size} size={size}/>
            <FractoPaneCell
               cellId={"01-10"} inverted={true} viewport={viewport}
               bounds={{top: 0.0, right: 1.0, bottom: -1.0, left: 0.0}}
               top={size - 1} left={2 * size} size={size}/>
         </Graphics>
         <StyledSlider
            max={16}
            min={1}
            step={0.5}
            invert
            defaultValue={1}
            renderTrack={Track}
            renderThumb={Thumb}
            orientation={"vertical"}
            onChange={(factor) => this.onZoom(factor)}
         />
      </Wrapper>
   }
}

export default FractoPanes;
