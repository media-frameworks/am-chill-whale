import {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../../app/AppImports";
import CoolModal from "../../../cool/CoolModal";
import RoverDesignPreview from "./RoverDesignPreview";
import LinearEquation from "../../../math/LinearEquation";

const RENDER_MODAL_WIDTH_PX = 1200;

const PlayButton = styled.div`
    ${AppStyles.block};
    ${AppStyles.pointer};
    ${AppStyles.noselect};
    ${AppColors.COLOR_COOL_BLUE};
    ${AppStyles.COOL_BORDER};
    padding: 0.125rem 0.5rem;
    margin: 0.5rem auto;
    background-color: white;
    width: 3rem;
    text-align: center;
    &: hover{
      background-color: ${AppColors.HSL_COOL_BLUE};
      color: white;
    }
`;

export class RoverRender extends Component {

   static propTypes = {
      image_id: PropTypes.string.isRequired,
      steps_list: PropTypes.array.isRequired,
      aspect_ratio: PropTypes.number.isRequired,
      on_response_modal: PropTypes.func.isRequired,
   }

   state = {
      step_values: this.props.steps_list[0]
   };

   play = () => {
      const {steps_list} = this.props;
      let position = 0;
      const interval = setInterval(() => {

         const step_parameters = {
            center_x: steps_list.map(step => step.center_x),
            center_y: steps_list.map(step => step.center_y),
            width: steps_list.map(step => step.width),
         }
         const center_x_poly = LinearEquation.solve_standard_polynolial(step_parameters.center_x);
         const center_y_poly = LinearEquation.solve_standard_polynolial(step_parameters.center_y);
         const width_poly = LinearEquation.solve_standard_polynolial(step_parameters.width);

         const step_values = {
            center_x: LinearEquation.render_value(center_x_poly, position),
            center_y: LinearEquation.render_value(center_y_poly, position),
            width: LinearEquation.render_value(width_poly, position),
         };

         this.setState({
            step_values: step_values
         });
         position += 0.002;

         if (position >= steps_list.length - 1) {
            clearInterval(interval);
         }
      }, 25);
   }

   render() {
      const {step_values} = this.state;
      const {image_id, aspect_ratio, on_response_modal} = this.props;
      const render_contents =
         [
            <RoverDesignPreview
               image_id={image_id}
               step_values={step_values}
               aspect_ratio={aspect_ratio}
               preview_height_px={600}
            />,
            <PlayButton onClick={e => this.play()}>play</PlayButton>
         ];
      return <CoolModal
         key={`CoolModal_${image_id}`}
         width={`${RENDER_MODAL_WIDTH_PX}px`} contents={render_contents}
         response={r => on_response_modal(r)}
      />
   }
}

export default RoverRender;

