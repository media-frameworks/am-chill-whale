import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars} from '@fortawesome/free-solid-svg-icons'

import {AppStyles, AppColors} from "../../../app/AppImports";
import CoolSlider from "../../cool/CoolSlider";
import CoolDropdown from "../../cool/CoolDropdown";

const PHI = (1 + Math.sqrt(5.0)) / 2.0;

const DESIGNER_IMAGE_WIDTH_PX = 640;
const DESIGNER_META_WIDTH_PX = DESIGNER_IMAGE_WIDTH_PX * (PHI - 1.0);

const STEP_CODE_ADD_ABOVE = 1;
const STEP_CODE_ADD_BELOW = 2;
const STEP_CODE_MOVE_UP = 3;
const STEP_CODE_MOVE_DOWN = 4;
const STEP_CODE_DELETE = 5;

const STEP_MENU = [
   {label: "add above", code: STEP_CODE_ADD_ABOVE},
   {label: "add below", code: STEP_CODE_ADD_BELOW},
   {label: "move up", code: STEP_CODE_MOVE_UP},
   {label: "move down", code: STEP_CODE_MOVE_DOWN},
   {type: "separator"},
   {label: "delete", code: STEP_CODE_DELETE},
]

const MetaName = styled.span`
   color: #666666;   
   font-size: 0.75rem;
   font-weight: bold;
   padding: 0 0.25rem;
`;

const MetaValue = styled.span`
   ${AppStyles.monospace}
   color: #666666;   
   font-size: 0.75rem;
   font-weight: bold;
   padding: 0;
`;

const MetaSlider = styled(AppStyles.InlineBlock)`
   padding-left: 1rem;
   width: 12rem;
`;

const MetaPair = styled(AppStyles.InlineBlock)`
   width: 6rem;
`;

const MetaBlock = styled(AppStyles.Block)`
   margin-bottom: 1rem;
   padding-bottom: 0.25rem;
   width: ${DESIGNER_META_WIDTH_PX}px;
   max-height: 12rem;
   overflow-y: scroll;
`;

const StepBlock = styled(AppStyles.Block)`
   margin: 0 0.5rem;
   width: ${DESIGNER_META_WIDTH_PX - 60}px;
   padding: 0.25rem 0.5rem;
`;

const StepIndex = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace};
   ${AppStyles.align_middle};
   ${AppColors.COLOR_DEEP_BLUE};
   font-size: 1.5rem;
   padding-right: 0.5rem;
`;

const StepMetaBlock = styled(AppStyles.InlineBlock)`
   border-left: 0.125rem solid #aaaaaa;
   padding-left: 0.25rem;
`;

const IconWrapper = styled.div`
    ${AppStyles.block};
    font-size: 1rem;
    color: #888888;
    opacity: 0.65;
    &: hover{
      opacity: 1;
    };
 `;

const FontAwesomeIconWrapper = styled(FontAwesomeIcon)`
    margin: 0;
`;

export class RoverDesignSteps extends Component {

   static propTypes = {
      steps_list: PropTypes.array.isRequired,
      selected_step_index: PropTypes.number.isRequired,
      on_update_props: PropTypes.func.isRequired,
      on_selected: PropTypes.func.isRequired,
   }

   state = {
      menu_refs: [],
      step_menu_index: -1
   };

   componentDidMount() {
      this.create_menu_refs();
      RoverDesignSteps.in_update = false;
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      this.create_menu_refs();
      RoverDesignSteps.in_update = false;
   }

   static in_update = true;

   create_menu_refs = () => {
      const {menu_refs} = this.state;
      const {steps_list} = this.props;
      if (menu_refs.length >= steps_list.length) {
         return;
      }
      for (let i = menu_refs.length; i < steps_list.length; i++) {
         menu_refs.push(React.createRef())
      }
      this.setState({menu_refs: menu_refs});
   }

   update_step = (step_index, name, value) => {
      const {steps_list, selected_step_index, on_update_props, on_selected} = this.props;
      if (RoverDesignSteps.in_update) {
         return;
      }
      RoverDesignSteps.in_update = true;
      steps_list[step_index][name] = value;
      on_update_props({steps_list: steps_list});
      if (selected_step_index !== step_index) {
         on_selected(step_index)
      }
   }

   menu_selection = (selected) => {
      const {steps_list, selected_step_index, on_update_props} = this.props;
      switch (selected) {
         case STEP_CODE_ADD_ABOVE:
            console.log("STEP_CODE_ADD_ABOVE");
            let copy_step = Object.assign({}, steps_list[selected_step_index])
            copy_step.center_x -= 0.05;
            copy_step.center_y -= 0.05;
            steps_list.unshift(copy_step);
            on_update_props({steps_list: steps_list});
            break;
         case STEP_CODE_ADD_BELOW:
            console.log("STEP_CODE_ADD_BELOW");
            break;
         case STEP_CODE_MOVE_UP:
            console.log("STEP_CODE_MOVE_UP");
            break;
         case STEP_CODE_MOVE_DOWN:
            console.log("STEP_CODE_MOVE_DOWN");
            break;
         case STEP_CODE_DELETE:
            console.log("STEP_CODE_DELETE");
            break;
         default:
            console.log("unknown code", selected);
            break;
      }
      this.setState({step_menu_index: -1})
   }

   render_step_menu = (step_index) => {
      const {menu_refs} = this.state;
      const menu_options = STEP_MENU.map(item => {
         return Object.assign({}, item);
      })
      const instance = menu_refs[step_index].current;
      const reference_rect = instance.getBoundingClientRect();
      return <CoolDropdown
         items={menu_options}
         reference_rect={{top: reference_rect.top, left: reference_rect.left + 10}}
         callback={selection => this.menu_selection(selection)}
      />
   }

   get_step_menu = (step_index) => {
      const {menu_refs} = this.state;
      return <IconWrapper
         ref={menu_refs[step_index]}
         onClick={e => this.setState({step_menu_index: step_index})}>
         <FontAwesomeIconWrapper icon={faBars}/>
      </IconWrapper>
   }

   select_step = (step_index) => {
      const {on_selected} = this.props;
      on_selected(step_index)
   }

   render() {
      const {step_menu_index} = this.state;
      const {steps_list, selected_step_index, on_selected} = this.props;
      const all_steps = steps_list.map((step, step_index) => {
         const is_selected = selected_step_index === step_index;
         const step_extra_style = {
            backgroundColor: is_selected ? '#eeeeee' : 'white'
         };
         const step_data = [
            {
               name: "width",
               value: step.width,
               slider: <CoolSlider
                  value={step.width} min={0.0} max={1.0}
                  on_change={value => this.update_step(step_index, "width", value)}
               />
            },
            {
               name: "center x",
               value: step.center_x,
               slider: <CoolSlider
                  value={step.center_x} min={0.0} max={1.0}
                  on_change={value => this.update_step(step_index, "center_x", value)}
               />
            },
            {
               name: "center y", value: step.center_y,
               slider: <CoolSlider
                  value={step.center_y} min={0.0} max={1.0}
                  on_change={value => this.update_step(step_index, "center_y", value)}
               />
            },
         ].map((line, line_index) => {
            return <AppStyles.Block
               key={`step_${step_index}_line_${line_index}`}>
               <MetaPair>
                  <MetaName>{`${line.name}:`}</MetaName>
                  <MetaValue>{line.value}</MetaValue>
               </MetaPair>
               <MetaSlider>{line.slider}</MetaSlider>
            </AppStyles.Block>
         });
         return <StepBlock
            onClick={e => on_selected(step_index)}
            style={step_extra_style}>
            <StepIndex>
               {step_index + 1}
               {this.get_step_menu(step_index)}
            </StepIndex>
            <StepMetaBlock>
               {step_data}
            </StepMetaBlock>
         </StepBlock>
      });
      const step_menu = step_menu_index === -1 ? '' : this.render_step_menu(step_menu_index);
      return <MetaBlock>
         {all_steps}
         {step_menu}
      </MetaBlock>
   }

}

export default RoverDesignSteps;
