import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCaretRight, faCaretLeft, faCaretUp, faCaretDown} from '@fortawesome/free-solid-svg-icons';

import {AppStyles, AppColors} from "app/AppImports";

const CONTROL_TYPE_UP = "control_up";
const CONTROL_TYPE_DOWN = "control_down";
const CONTROL_TYPE_LEFT = "control_left";
const CONTROL_TYPE_RIGHT = "control_right";

const CONTROL_VALUE_SCOPE = "control_span";
const CONTROL_VALUE_LOCATION = "control_location";

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

const PanelControls = styled(AppStyles.InlineBlock)`
   text-align: left;
   padding: 0.125rem 0.25rem;
`;

const PanelWrapper = styled(AppStyles.Block)`
   background-color: white;
   padding: 0.5rem;
   padding-bottom: 0;
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

const IconControl = styled(AppStyles.InlineBlock)`
   text-align: right;
   font-size: 1.125rem;
   font-color: #666666;
   opacity: 0.125;
   &: hover {
      opacity: 1.0;
   }
`;

const UpDownIconControl = styled(IconControl)`
   margin: 0 0.125rem;   
`;

const LeftRightIconControl = styled(IconControl)`
   margin: 0 0.25rem;   
`;

export class FractoLocate extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      fracto_values: PropTypes.object.isRequired,
      cb: PropTypes.func,
   }

   state = {
      panel_ref: React.createRef(),
      bounds_left: 0
   };

   static render_coordinates = (x, y) => {
      return [
         <NumberSpan>{`${x} + ${y}`}</NumberSpan>,
         <ItalicSpan>i</ItalicSpan>
      ]
   }

   componentDidMount() {
      const {panel_ref} = this.state;
      if (panel_ref.current) {
         const bounds = panel_ref.current.getBoundingClientRect();
         this.setState({bounds_left: bounds.left + bounds.width - 100})
      }
   }

   render_controls = (control_block) => {
      const {bounds_left} = this.state;
      const {fracto_values, cb} = this.props;
      if (!cb) {
         return []
      }
      const location_factor = fracto_values.scope / 8;
      let left_px = bounds_left;
      const controls = control_block.map(block => {
         left_px -= 12;
         const icon_style = {left: `${left_px}px`}
         switch (block.type) {
            case CONTROL_TYPE_UP:
               return <UpDownIconControl
                  style={icon_style}
                  onClick={e => cb({
                     focal_point: {
                        x: fracto_values.focal_point.x,
                        y: block.value_change === CONTROL_VALUE_LOCATION ?
                           fracto_values.focal_point.y - location_factor : fracto_values.focal_point.y
                     },
                     scope: block.value_change === CONTROL_VALUE_SCOPE ?
                        fracto_values.scope * block.change_factor : fracto_values.scope
                  })}>
                  <FontAwesomeIcon icon={faCaretUp}/>
               </UpDownIconControl>
            case CONTROL_TYPE_DOWN:
               return <UpDownIconControl
                  style={icon_style}
                  onClick={e => cb({
                     focal_point: {
                        x: fracto_values.focal_point.x,
                        y: block.value_change === CONTROL_VALUE_LOCATION ?
                           fracto_values.focal_point.y + location_factor : fracto_values.focal_point.y
                     },
                     scope: block.value_change === CONTROL_VALUE_SCOPE ?
                        fracto_values.scope * block.change_factor : fracto_values.scope
                  })}>
                  <FontAwesomeIcon icon={faCaretDown}/>
               </UpDownIconControl>
            case CONTROL_TYPE_LEFT:
               return <LeftRightIconControl
                  style={icon_style}
                  onClick={e => cb({
                     focal_point: {
                        x: fracto_values.focal_point.x + location_factor,
                        y: fracto_values.focal_point.y
                     },
                     scope: fracto_values.scope
                  })}>
                  <FontAwesomeIcon icon={faCaretLeft}/>
               </LeftRightIconControl>
            case CONTROL_TYPE_RIGHT:
               return <LeftRightIconControl
                  style={icon_style}
                  onClick={e => cb({
                     focal_point: {
                        x: fracto_values.focal_point.x - location_factor,
                        y: fracto_values.focal_point.y
                     },
                     scope: fracto_values.scope
                  })}>
                  <FontAwesomeIcon icon={faCaretRight}/>
               </LeftRightIconControl>
            default:
               return [];
         }
      });
      return controls;
   }

   render() {
      const {panel_ref} = this.state;
      const {level, fracto_values} = this.props;
      const panel_data = [
         {
            label: "level",
            value: <NumberSpan>{level}</NumberSpan>,
            controls: [
               {
                  type: CONTROL_TYPE_UP,
                  value_change: CONTROL_VALUE_SCOPE,
                  change_factor: 1.99
               },
               {
                  type: CONTROL_TYPE_DOWN,
                  value_change: CONTROL_VALUE_SCOPE,
                  change_factor: 0.51
               },
            ]
         },
         {
            label: "focal point",
            value: FractoLocate.render_coordinates(fracto_values.focal_point.x, fracto_values.focal_point.y),
            controls: [
               {
                  type: CONTROL_TYPE_UP,
                  value_change: CONTROL_VALUE_LOCATION,
                  change_factor: 2.0
               },
               {
                  type: CONTROL_TYPE_DOWN,
                  value_change: CONTROL_VALUE_LOCATION,
                  change_factor: 0.5
               },
               {
                  type: CONTROL_TYPE_LEFT,
                  value_change: CONTROL_VALUE_LOCATION,
                  change_factor: 2.0
               },
               {
                  type: CONTROL_TYPE_RIGHT,
                  value_change: CONTROL_VALUE_LOCATION,
                  change_factor: 0.5
               },
            ]
         },
         {
            label: "scope",
            value: <NumberSpan>{fracto_values.scope}</NumberSpan>,
            controls: [
               {
                  type: CONTROL_TYPE_UP,
                  value_change: CONTROL_VALUE_SCOPE,
                  change_factor: 0.8
               },
               {
                  type: CONTROL_TYPE_DOWN,
                  value_change: CONTROL_VALUE_SCOPE,
                  change_factor: 1.25
               },
            ]
         },
      ];
      const panel = panel_data.map(datum => {
         const controls = this.render_controls(datum.controls);
         return <PanelEntry>
            <PanelLabel>{datum.label}:</PanelLabel>
            <PanelValue>{datum.value}</PanelValue>
            <PanelControls>{controls}</PanelControls>
         </PanelEntry>
      });
      return <PanelWrapper ref={panel_ref}>{panel}</PanelWrapper>
   }

}

export default FractoLocate;