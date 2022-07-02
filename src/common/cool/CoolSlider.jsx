import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import ReactSlider from 'react-slider'

const StyledSlider = styled(ReactSlider)`
    vertical-align: middle;
    height: 1rem;
    width: inherit;
`;

const StyledThumb = styled.div`
    height: 1rem;
    line-height: 1rem;
    text-align: center;
    font-size: 0.85rem;
    background-color: #333;
    color: #fff;
    cursor: grab;
    padding: 0 0.5rem;
`;

const StyledTrack = styled.div`
    top: 0;
    bottom: 0;
    background-color: ${props => props.index === 2 ? '#f00' : props.index === 1 ? '#ddd' : '#888'};
    border-radius: 0.25rem;
`;

export class CoolSlider extends Component {

   static propTypes = {
      value: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      on_change: PropTypes.func.isRequired,
      step_count: PropTypes.number,
   }

   static defaultProps = {
      step_count: 100
   }

   render() {
      const {value, min, max, on_change, step_count} = this.props;
      const Thumb = (props, state) => <StyledThumb {...props}>{state.valueNow}</StyledThumb>;
      const Track = (props, state) => <StyledTrack {...props} index={state.index}/>;
      return <StyledSlider
         max={max}
         min={min}
         step={(max - min) / step_count}
         value={value}
         renderTrack={Track}
         renderThumb={Thumb}
         onChange={on_change}
      />
   }
}

export default CoolSlider;
