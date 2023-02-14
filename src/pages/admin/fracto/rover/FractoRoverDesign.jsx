import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import {CoolSelect, CoolModal, CoolButton} from "common/cool/CoolImports";
import {ModalTitle} from "common/cool/CoolModal";

import MediaUtil from "common/media/MediaUtil";
import LinearEquation from "common/math/LinearEquation";
import PolyCurveEditor from "common/math/PolyCurveEditor";
import {PHI} from "common/math/constants.js"

import FractoRender from "../FractoRender";
import FractoValues from "../FractoValues";

import FractoRoverStep from "./FractoRoverStep";
import FractoRoverStepMenu, {
   STEP_CODE_SELECT, STEP_CODE_ADD_ABOVE, STEP_CODE_ADD_BELOW, STEP_CODE_DELETE
} from "./FractoRoverStepMenu";
import FractoRoverTransport from "./FractoRoverTransport";

const DESIGNER_IMAGE_WIDTH_PX = 640;
export const DESIGNER_META_WIDTH_PX = DESIGNER_IMAGE_WIDTH_PX * (PHI - 1.0);

const STEP_PARAM_SCOPE = "scope";
const STEP_PARAM_FOCAL_X = "focal_x";
const STEP_PARAM_FOCAL_Y = "focal_y";
const PARAM_TABS = [
   STEP_PARAM_SCOPE,
   STEP_PARAM_FOCAL_X,
   STEP_PARAM_FOCAL_Y
];

const MetaName = styled(AppStyles.InlineBlock)`
   ${AppStyles.align_middle}
   ${AppStyles.bold}
   ${AppStyles.align_right}
   color: #666666;   
   font-size: 0.85rem;
   padding: 0 0.25rem;
   width: 6rem;
   margin-right: 0.25rem;
`;

const MetaBlock = styled(AppStyles.Block)`
   margin: 0.25rem;
   padding-bottom: 0.25rem;
   min-width: ${DESIGNER_META_WIDTH_PX}px;
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

const SectionWrapper = styled(AppStyles.InlineBlock)`
   margin: 0.25rem 0;
   width: 40rem;
`;

const BlockWrapper = styled(AppStyles.InlineBlock)`
   margin: 0.5rem 1rem 0 0;
`;

const OutlinedWrapper = styled(BlockWrapper)`
   border: 0.15rem solid #888888;
   border-radius: 0.25rem;
`;

const StepBlock = styled(AppStyles.Block)`
   width: fit-content;
   padding: 0.25rem 0.5rem;
   margin-left: 1rem;
   border-radius: 0.25rem;
`;

const TransportWrapper = styled(AppStyles.Block)`
   ${AppStyles.DARK_BORDER}
   border-top: 0;
   width: 500px;
`

const PolyEditWrapper = styled(AppStyles.Block)`
   width: 500px;
   height: 80px;
   margin-left: 0.5rem;
`;

const TabWrapper = styled(AppStyles.Block)`
   margin-top: 1rem;
`;

const TabSpan = styled.span`
   ${AppStyles.italic}
   ${AppStyles.bold}
   ${AppStyles.pointer}
   ${AppColors.COLOR_DEEP_BLUE}
   margin-left: 0.5rem;
`;

export class FractoRoverDesign extends Component {

   static propTypes = {
      steps_list: PropTypes.array,
      aspect_ratio: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
      on_update_props: PropTypes.func.isRequired,
      on_response_modal: PropTypes.func.isRequired,
   }

   static defaultProps = {
      steps_list: [],
   }

   state = {
      fracto_ref: React.createRef(),
      selected_step_index: 0,
      shuttle_position: 0,
      preview_values: {},
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.625}
      },
      selected_step: 0,
      step_param: STEP_PARAM_SCOPE
   };

   componentDidMount() {
      const {steps_list} = this.props;
      if (steps_list.length) {
         this.setState({fracto_values: steps_list[0]})
      }
      this.setState({preview_values: steps_list[0]});
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {aspect_ratio, width_px} = this.props;
      if (prevProps.aspect_ratio !== aspect_ratio || prevProps.width_px !== width_px) {
         this.forceUpdate()
      }
   }

   select_aspect_ratio = (e) => {
      const {on_update_props} = this.props;
      on_update_props({aspect_ratio: e.target.value});
   }

   select_width_px = (e) => {
      const {on_update_props} = this.props;
      on_update_props({width_px: e.target.value});
   }

   render_aspect_ratio = () => {
      const {aspect_ratio} = this.props;
      const options = Object.keys(MediaUtil.ASPECT_RATIO)
         .sort((a, b) => MediaUtil.ASPECT_RATIO[a].value < MediaUtil.ASPECT_RATIO[b].value ? -1 : 1)
         .map((ratio, index) => {
            return MediaUtil.ASPECT_RATIO[ratio];
         });
      return <MetaBlock>
         <MetaName>{"aspect ratio:"}</MetaName>
         <CoolSelect
            options={options}
            value={aspect_ratio}
            on_change={e => this.select_aspect_ratio(e)}/>
      </MetaBlock>
   }

   render_size = () => {
      const {width_px} = this.props;
      const size_options = [
         {label: 800, value: 800, help: "720p"},
         {label: 1200, value: 1200, help: "1080p"},
         {label: 1600, value: 1600, help: "HD"},
      ]
      return <MetaBlock>
         <MetaName>{"width (pixels):"}</MetaName>
         <CoolSelect
            options={size_options}
            value={width_px}
            on_change={e => this.select_width_px(e)}/>
      </MetaBlock>
   }

   shuttle_position_changed = (position) => {
      const {steps_list} = this.props;
      const step_values = {
         focal_x: steps_list.map(step => step.focal_point.x),
         focal_y: steps_list.map(step => step.focal_point.y),
         scope: steps_list.map(step => step.scope),
      }
      const focal_x_poly = LinearEquation.solve_standard_polynolial(step_values.focal_x);
      const focal_y_poly = LinearEquation.solve_standard_polynolial(step_values.focal_y);
      const scope_poly = LinearEquation.solve_standard_polynolial(step_values.scope);

      const focal_x = LinearEquation.render_value(focal_x_poly, position);
      const focal_y = LinearEquation.render_value(focal_y_poly, position);
      const scope = LinearEquation.render_value(scope_poly, position);

      this.setState({
         shuttle_position: position,
         fracto_values: {
            scope: scope,
            focal_point: {x: focal_x, y: focal_y}
         },
      })
   }

   new_sequence = () => {
      const {fracto_values} = this.state;
      const {on_update_props} = this.props;
      on_update_props({steps_list: [fracto_values]})
   }

   step_action = (action, step_index) => {
      const {fracto_values} = this.state;
      const {steps_list, on_update_props} = this.props;
      switch (action) {
         case STEP_CODE_SELECT:
            this.setState({
               fracto_values: steps_list[step_index],
               selected_step: step_index
            });
            break;
         case STEP_CODE_ADD_ABOVE:
            steps_list.splice(step_index, 0, fracto_values);
            on_update_props({steps_list: steps_list});
            break;
         case STEP_CODE_ADD_BELOW:
            steps_list.splice(step_index + 1, 0, fracto_values);
            on_update_props({steps_list: steps_list});
            break;
         case STEP_CODE_DELETE:
            steps_list.splice(step_index, 1);
            on_update_props({steps_list: steps_list});
            break;
         default:
            break;
      }
   }

   render_sections = () => {
      const {fracto_values, selected_step} = this.state;
      const {steps_list, aspect_ratio, width_px} = this.props;
      const sections = [
         {
            title: "settings",
            rendered: [
               this.render_aspect_ratio(),
               this.render_size()
            ]
         },
         {
            title: "currently",
            rendered: <FractoValues fracto_values={fracto_values} width_px={width_px}/>
         },
         steps_list.length ? {
            title: "steps",
            rendered: steps_list.map((step, index) => {
               const step_block_style = {
                  backgroundColor: selected_step === index ? "#aaaaaa" : "white"
               }
               return <StepBlock style={step_block_style}>
                  <FractoRoverStepMenu
                     step_index={index}
                     callback={action => this.step_action(action, index)}
                     selected={selected_step === index}/>
                  <FractoRoverStep
                     key={`fracto_rover_step_${index}`}
                     aspect_ratio={aspect_ratio}
                     fracto_values={step}
                     width_px={width_px}
                     selected={selected_step === index}
                     on_click={() => this.step_action(STEP_CODE_SELECT, index)}/>
               </StepBlock>
            })
         } : {
            title: "start",
            rendered: <AppStyles.InlineBlock style={{
               width: "30rem",
               textAlign: "center",
               margin: "0 auto"
            }}>
               <CoolButton
                  content={"new sequence"}
                  primary={true}
                  on_click={e => this.new_sequence()}
               />
            </AppStyles.InlineBlock>
         }

      ];
      return sections.map((section, section_index) => {
         return [
            <SectionTitle>{section.title}</SectionTitle>,
            <SectionWrapper>{section.rendered}</SectionWrapper>
         ]
      });
   }

   update_step_values = (step_values, step_index) => {
      const {step_param} = this.state;
      const {steps_list, on_update_props} = this.props;
      let new_steps_list = JSON.parse(JSON.stringify(steps_list));
      switch (step_param) {
         case STEP_PARAM_SCOPE:
            new_steps_list.forEach((new_step, index) => {
               new_step.scope = step_values[index];
            })
            break;
         case STEP_PARAM_FOCAL_X:
            new_steps_list.forEach((new_step, index) => {
               new_step.focal_point.x = step_values[index];
            })
            break;
         case STEP_PARAM_FOCAL_Y:
            new_steps_list.forEach((new_step, index) => {
               new_step.focal_point.y = step_values[index];
            })
            break;
         default:
            break;
      }
      this.setState({selected_step: step_index})
      on_update_props({steps_list: new_steps_list});
   }

   render() {
      const {fracto_values, shuttle_position, step_param} = this.state;
      const {steps_list, aspect_ratio, on_response_modal} = this.props;
      const poly_curve_inputs = steps_list.map(step => {
         switch (step_param) {
            case STEP_PARAM_SCOPE:
               return step.scope;
            case STEP_PARAM_FOCAL_X:
               return step.focal_point.x;
            case STEP_PARAM_FOCAL_Y:
               return step.focal_point.y;
            default:
               return -1;
         }
      });
      const poly_curve_tabs = PARAM_TABS.map(tab => {
         return <TabSpan onClick={e => this.setState({step_param: tab})}>{tab}</TabSpan>
      });
      const designer_contents = [
         <ModalTitle>Design Steps</ModalTitle>,
         <AppStyles.Block style={{minHeight: "40rem"}}>
            <AppStyles.InlineBlock>
               <OutlinedWrapper>
                  <FractoRender
                     width_px={500}
                     aspect_ratio={aspect_ratio}
                     initial_params={fracto_values}
                     on_param_change={values => this.setState({fracto_values: values})}
                  />
               </OutlinedWrapper>
               <TransportWrapper>
                  <FractoRoverTransport
                     steps_list={steps_list}
                     shuttle_position={shuttle_position}
                     on_position_change={position => this.shuttle_position_changed(position)}
                  />
               </TransportWrapper>
               <TabWrapper>
                  {poly_curve_tabs}
               </TabWrapper>
               <PolyEditWrapper>
                  <PolyCurveEditor
                     inputs={poly_curve_inputs}
                     on_update={(step_values, step_index) => this.update_step_values(step_values, step_index)}/>
               </PolyEditWrapper>
            </AppStyles.InlineBlock>
            <BlockWrapper>
               {this.render_sections()}
            </BlockWrapper>
         </AppStyles.Block>
      ]
      return <CoolModal
         key={`CoolModal_fracto_rover_design`}
         width={"85%"}
         contents={designer_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default FractoRoverDesign;
