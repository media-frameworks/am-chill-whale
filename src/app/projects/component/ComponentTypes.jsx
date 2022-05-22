import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../../AppImports";
import CoolModal from "../../../common/cool/CoolModal";

const ModalHeader = styled.div`
   ${AppStyles.block};
   color: #444444;   
   font-size: 1rem;
   font-weight: bold;
   text-align: center;
   margin-bottom: 0.5rem;
   padding-bottom: 0.25rem;
   border-bottom: 0.15rem solid #cccccc;
`;

const ComponentSelector = styled.div`
   ${AppStyles.inline_block};
   ${AppStyles.uppercase};
   ${AppStyles.pointer};
   ${AppColors.COLOR_DEEP_BLUE};
   border: 0.25rem double ${AppColors.HSL_COOL_BLUE};
   padding: 0.25rem 0.5rem 0.125rem;
   border-radius: 0.25rem;
   font-size: 0.75rem;
   font-weight: bold;
   background-color: ${AppColors.HSL_LIGHT_COOL_BLUE};
   margin: 0.125rem 0.5rem 0 0.125rem;
`;

export class ComponentTypes extends Component {

   static propTypes = {
      components: PropTypes.array.isRequired,
      on_response: PropTypes.func.isRequired,
   }

   state = {
      all_components: []
   };

   componentDidMount() {
      const {components, on_response} = this.props;
      const all_components = components.map((comp, index) => {
         return <ComponentSelector
            onClick={e => on_response(comp.class_name)}>
            {comp.title}
         </ComponentSelector>
      });
      this.setState({all_components: all_components})
   }

   render() {
      const {on_response} = this.props;
      const {all_components} = this.state;
      const contents = <AppStyles.Block>
         <ModalHeader>select a component type</ModalHeader>
         {all_components}
      </AppStyles.Block>
      return <CoolModal
         contents={contents}
         response={result => on_response(result)}
      />
   }
}

export default ComponentTypes;
