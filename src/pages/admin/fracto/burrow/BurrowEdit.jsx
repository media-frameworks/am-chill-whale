import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
// import StoreS3 from "common/StoreS3";

const EditWrapper = styled(AppStyles.Block)`
   margin-left: 1rem;
`;

export class BurrowEdit extends Component {

   static propTypes = {
      burrow_name: PropTypes.string.isRequired,
   }

   state = {
   }

   render () {
      const {burrow_name} = this.props;
      return <EditWrapper>
         {burrow_name}
      </EditWrapper>
   }
}

export default BurrowEdit;