import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
// import styled from "styled-components";

// import {AppStyles} from "../../../../app/AppImports";
import CoolSlider from "../../../cool/CoolSlider";

export class RoverDesignTransport extends Component {

   static propTypes = {
      steps_list: PropTypes.array.isRequired,
      shuttle_position: PropTypes.number.isRequired,
      on_position_change: PropTypes.func.isRequired,
   }

   render() {
      const {steps_list, shuttle_position, on_position_change} = this.props;
      return <CoolSlider
         value={shuttle_position} min={0.0} max={steps_list.length - 1}
         on_change={value => on_position_change(value)}
      />
   }
}

export default RoverDesignTransport;
