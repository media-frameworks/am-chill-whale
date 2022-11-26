import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";

import FractoCopyText from "./FractoCopyText";

const PremisePart = styled(AppStyles.Block)`
   ${AppStyles.centered}
`;

const PremiseLine = styled(AppStyles.Block)`
   ${AppStyles.uppercase}
   letter-spacing: 0.5rem;
   margin-bottom: 0.25rem;
`;

const AbstractWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   width: 40%;
   min-width: 400px;
   padding: 0.5rem 1rem;
   font-size: 1.125rem;
`;

export class FractoContent extends Component {

   render_abstract = () => {
      const abstract_parts = [
         FractoCopyText.ABSTRACT_01,
         FractoCopyText.ABSTRACT_02,
      ]
      const part_styles = [
         {color: "blue"},
         {color: "green"},
      ]
      return abstract_parts.map((part, i) => {
         return <AppStyles.Block style={part_styles[i]}>{part}</AppStyles.Block>
      })
   }

   render() {
      const premise_parts = FractoCopyText.MAIN_PREMISE.split(',');
      const line_styles = [
         {fontSize: "0.95rem", color: "#444444"},
         {fontSize: "0.75rem", fontWeight: "bold", letterSpacing: "0.125rem", color: "#888888"},
         {fontSize: "1rem", color: "black"}
      ]
      const main_premise = premise_parts.map((part, i) => {
         return <PremisePart>
            <PremiseLine
               style={line_styles[i]}>
               {part}
            </PremiseLine>
         </PremisePart>
      })
      const abstract = ''; //this.render_abstract()
      return [
         main_premise,
         <AbstractWrapper>{abstract}</AbstractWrapper>
      ]
   }
}

export default FractoContent;

