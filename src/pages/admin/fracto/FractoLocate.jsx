import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../app/AppImports";

const PanelEntry = styled(AppStyles.Block)`
   margin: 0 0.5rem;
`;

const PanelLabel = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   text-align: right;
   padding: 0.125rem 0.25rem;
   width: 6rem;
   font-size: 0.85rem;   
   background-color: ${AppColors.HSL_LIGHT_COOL_BLUE};
   margin-top: 0.125rem;
`;

const PanelValue = styled(AppStyles.InlineBlock)`
   text-align: left;
   padding: 0.125rem 0.25rem;
`;

const PanelWrapper = styled(AppStyles.InlineBlock)`
   background-color: white;
   max-width: 500px;
   float: left;
   padding: 0.25rem;
`;

const NumberSpan = styled.span`
   ${AppStyles.monospace}
   font-size: 0.85rem;
`;

const ItalicSpan = styled.span`
   ${AppStyles.bold}
   ${AppStyles.italic}
   font-family: Arial;
   font-size: 0.85rem;
`;

export class FractoLocate extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      fracto_values: PropTypes.object.isRequired,
   }

   static render_coordinates = (x, y) => {
      return [
         <NumberSpan>{`${x} + ${y}`}</NumberSpan>,
         <ItalicSpan>i</ItalicSpan>
      ]
   }

   render() {
      const {level, fracto_values} = this.props;
      const panel_data = [
         {
            label: "level",
            value: <NumberSpan>{level}</NumberSpan>},
         {
            label: "focal point",
            value: FractoLocate.render_coordinates(fracto_values.focal_point.x, fracto_values.focal_point.y)
         },
         {
            label: "scope",
            value: <NumberSpan>{fracto_values.scope}</NumberSpan>
         },
      ];
      const panel = panel_data.map(datum => {
         return <PanelEntry>
            <PanelLabel>{datum.label}:</PanelLabel>
            <PanelValue>{datum.value}</PanelValue>
         </PanelEntry>
      });
      return <PanelWrapper>{panel}</PanelWrapper>
   }

}

export default FractoLocate;