import {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

export class LevelStats extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
   }

   render() {
      const {level} = this.props;
      return `LevelStats ${level}`
   }
}

export default LevelStats;
