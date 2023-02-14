import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

// import {AppStyles} from "../../../../app/AppImports";
import CoolSlider from "common/cool/CoolSlider";

export class FractoRoverTransport extends Component {

   static propTypes = {
      steps_list: PropTypes.array.isRequired,
      shuttle_position: PropTypes.number.isRequired,
      on_position_change: PropTypes.func.isRequired,
   }

   render() {
      const {steps_list, shuttle_position, on_position_change} = this.props;
      return <CoolSlider
         value={shuttle_position + 1.0}
         min={1.0}
         max={steps_list.length}
         on_change={value => on_position_change(value - 1.0)}
      />
   }
}

export default FractoRoverTransport;
