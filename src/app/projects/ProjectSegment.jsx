import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../AppImports";

export class ProjectSegment extends Component {

   static propTypes = {
      segment: PropTypes.object.isRequired,
      on_update: PropTypes.func.isRequired,
      component_type: PropTypes.elementType.isRequired,
   }

   state = {
      component: React.createElement(this.props.component_type)
   };

   render() {
      const {component} = this.state;
      return <AppStyles.Block>
         {component}
      </AppStyles.Block>
   }

}

export default ProjectSegment;
