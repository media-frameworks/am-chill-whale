import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../../app/AppImports";
import CoolModal from "../../../../common/cool/CoolModal";
import MediaUtil from "../../../../common/media/MediaUtil";
import LinearEquation from "../../../../common/math/LinearEquation";
import {PHI} from "../../../../common/math/constants.js"

import RoverDesignSteps from "../../../../common/media/rover/RoverDesignSteps";
import RoverDesignTransport from "../../../../common/media/rover/RoverDesignTransport";

const DESIGNER_IMAGE_WIDTH_PX = 640;
export const DESIGNER_META_WIDTH_PX = DESIGNER_IMAGE_WIDTH_PX * (PHI - 1.0);

const MetaName = styled.span`
   color: #666666;   
   font-size: 0.85rem;
   font-weight: bold;
   padding: 0 0.25rem;
`;

const MetaBlock = styled(AppStyles.Block)`
   margin: 0.25rem;
   padding-bottom: 0.25rem;
   width: ${DESIGNER_META_WIDTH_PX}px;
`;

const SectionTitle = styled(AppStyles.Block)`
   ${AppStyles.uppercase}
   ${AppStyles.centered}
   ${AppStyles.bold}
   font-size: 0.85rem;
   margin: 0.25rem 0.25rem;
   padding-top: 0.25rem;
   border-top: 0.125rem solid ${AppColors.HSL_COOL_BLUE};
`;

export class FractoRoverDesign extends Component {

   static propTypes = {
      steps_list: PropTypes.array.isRequired,
      aspect_ratio: PropTypes.number.isRequired,
      on_update_props: PropTypes.func.isRequired,
      on_response_modal: PropTypes.func.isRequired,
   }

   state = {
      fracto_ref: React.createRef(),
      selected_step_index: 0,
      shuttle_position: 0,
      preview_values: {}
   };

   componentDidMount() {
      const {steps_list} = this.props;
      this.setState({preview_values: steps_list[0]});
   }

   select_aspect_ratio = (e) => {
      const {on_update_props} = this.props;
      on_update_props({aspect_ratio: Number.parseFloat(e.target.value)});
   }

   aspect_ratio = () => {
      const {aspect_ratio} = this.props;
      const options = MediaUtil.ASPECT_RATIO
         .sort((a, b) => a.value < b.value ? -1 : 1)
         .map((ratio, index) => {
            return <option key={`option_${index}`} value={ratio.value}>
               {`${ratio.label} (${ratio.help})`}
            </option>
         });
      return <MetaBlock>
         <MetaName>{"aspect ratio:"}</MetaName>
         <select
            value={aspect_ratio}
            onChange={e => this.select_aspect_ratio(e)}>
            {options}
         </select>
      </MetaBlock>
   }

   shuttle_position_changed = (position) => {
      const {steps_list} = this.props;
      const step_values = {
         center_x: steps_list.map(step => step.center_x),
         center_y: steps_list.map(step => step.center_y),
         width: steps_list.map(step => step.width),
      }
      const center_x_poly = LinearEquation.solve_standard_polynolial(step_values.center_x);
      const center_y_poly = LinearEquation.solve_standard_polynolial(step_values.center_y);
      const width_poly = LinearEquation.solve_standard_polynolial(step_values.width);

      const preview_values = {
         center_x: LinearEquation.render_value(center_x_poly, position),
         center_y: LinearEquation.render_value(center_y_poly, position),
         width: LinearEquation.render_value(width_poly, position),
      };

      this.setState({
         shuttle_position: position,
         preview_values: preview_values
      })
   }

   designer_contents = () => {
      const {selected_step_index, shuttle_position} = this.state;
      const {steps_list, on_update_props} = this.props;
      const sections = [
         {title: "settings", rendered: this.aspect_ratio()},
         {
            title: "steps",
            rendered: <RoverDesignSteps
               steps_list={steps_list}
               selected_step_index={selected_step_index}
               on_update_props={on_update_props}
               on_selected={step_index => this.setState({
                  selected_step_index: step_index,
                  shuttle_position: step_index,
                  preview_values: steps_list[step_index]
               })}
            />
         }
      ];
      const all_sections = sections.map((section, section_index) => {
         return [
            <SectionTitle>{section.title}</SectionTitle>,
            section.rendered
         ]
      });
      return [
         <RoverDesignTransport
            steps_list={steps_list}
            shuttle_position={shuttle_position}
            on_position_change={position => this.shuttle_position_changed(position)}
         />,
         <AppStyles.Block>
            <AppStyles.InlineBlock>
               {all_sections}
            </AppStyles.InlineBlock>`
         </AppStyles.Block>
      ]
   }

   render() {
      const {image_id, on_response_modal} = this.props;
      const designer_contents = this.designer_contents();
      return <CoolModal
         key={`CoolModal_${image_id}`}
         width={"95%"}
         contents={designer_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default FractoRoverDesign;
