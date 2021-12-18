import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons';

import {AppStyles, AppColors} from "../AppImports";
import CoolModal from "../../common/CoolModal";
import ProjectSegment from "./ProjectSegment";

const SegmentsWrapper = styled.div`
   ${AppStyles.block}
   ${AppStyles.noselect}
   background-color: white;
   min-height: 2rem;
   border-top: 0.15rem solid #cccccc;
   margin-top: 0.25rem;
`;

const SpecifyType = styled.div`
   ${AppStyles.inline_block};
   ${AppStyles.pointer};
   ${AppStyles.noselect};
   ${AppColors.COLOR_COOL_BLUE};
   padding: 0 0.25rem;
   margin: 0.25rem 0;
   height: 1.5rem;
`;

const IconWrapper = styled.div`
   ${AppStyles.inline_block};
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin: 0;
`;

const ButtonText = styled.div`
   ${AppStyles.inline_block};
   ${AppStyles.COOL_BLUE_TEXT};
   font-size: 0.85rem;
   font-weight: bold;
   margin: 0 0.25rem;
   vertical-align: top;
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
   margin: 0.125rem 0 0 0.125rem;
   &: hover{
      ${AppStyles.medium_box_shadow};
      margin: 0;
   }
`;

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

export class ProjectSegmentsFrame extends Component {

   static propTypes = {
      data: PropTypes.object.isRequired,
      on_update: PropTypes.func.isRequired,
      is_expanded: PropTypes.bool.isRequired,
      components: PropTypes.array.isRequired,
   }

   state = {
      selected_index: 0,
      in_type_modal: false,
      segment_index: -1
   };

   all_components = () => {
      const {segment_index} = this.state;
      const {data, on_update, components} = this.props;
      const all_components = components.map((comp, index) => {
         return <ComponentSelector
            onClick={e => {
               data.segments[segment_index].type = comp.class_name;
               on_update(data);
               this.setState({in_type_modal: false});
            }}>
            {comp.title}
         </ComponentSelector>
      });
      return <AppStyles.Block>
         <ModalHeader>select a component type</ModalHeader>
         {all_components}
      </AppStyles.Block>
   }

   component_from_type = (type) => {
      const {components} = this.props;
      const found_component = components.find(comp => comp.class_name === type);
      if (found_component){
         return found_component.component_type;
      }
      return false;
   }

   render() {
      const {in_type_modal} = this.state;
      const {data, on_update} = this.props;
      const segments = !data.segments ? '' : data.segments.map((segment, index) => {
         const component_type = this.component_from_type(segment.type);
         const type_button = component_type ? '' : <SpecifyType
            onClick={e => this.setState({in_type_modal: true, segment_index: index})}>
            <IconWrapper><FontAwesomeIcon icon={faQuestionCircle}/></IconWrapper>
            <ButtonText>what is it</ButtonText>
         </SpecifyType>
         const project_segment = !component_type ? '' : <ProjectSegment
            key={`segment_${index}_${data.updated}`}
            segment={segment}
            on_update={segment => {
               data.segments[index] = segment;
               on_update(data);
            }}
            component_type={component_type}
         />
         return <AppStyles.Block>
            {type_button}
            {project_segment}
         </AppStyles.Block>
      });
      return <SegmentsWrapper>
         {segments}
         {in_type_modal && <CoolModal
            contents={this.all_components()}
            response={result => this.setState({in_type_modal: false})}
         />}
      </SegmentsWrapper>
   }
}

export default ProjectSegmentsFrame;
