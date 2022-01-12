import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons';

import {AppStyles, AppColors} from "../AppImports";
import Utils from "../../common/Utils";
import ProjectSegment from "./ProjectSegment";
import SegmentsMenu from "./segments/SegmentsMenu";
import SegmentTypeModal from "./segments/SegmentTypeModal";

const SEGMENT_CODE_ADD_ABOVE = 1;
const SEGMENT_CODE_ADD_BELOW = 2;
const SEGMENT_CODE_MOVE_UP = 3;
const SEGMENT_CODE_MOVE_DOWN = 4;
const SEGMENT_CODE_DELETE = 5;
const SEGMENT_CODE_ADD_RIGHT = 6;

const SEGMENT_MENU = [
   {label: "add above", code: SEGMENT_CODE_ADD_ABOVE},
   {label: "add below", code: SEGMENT_CODE_ADD_BELOW},
   {label: "move up", code: SEGMENT_CODE_MOVE_UP},
   {label: "move down", code: SEGMENT_CODE_MOVE_DOWN},
   {label: "add right", code: SEGMENT_CODE_ADD_RIGHT},
   {type: "separator"},
   {label: "component", submenu: []},
   {type: "separator"},
   {label: "delete", code: SEGMENT_CODE_DELETE},
]

const SegmentsWrapper = styled.div`
   ${AppStyles.inline_block}
   ${AppStyles.align_top}
   ${AppStyles.noselect}
   min-height: 2rem;
   margin-bottom: 0.25rem;
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
   padding-right: 0.25rem;
`;

const ButtonText = styled.div`
   ${AppStyles.inline_block};
   ${AppStyles.COOL_BLUE_TEXT};
   font-size: 0.85rem;
   font-weight: bold;
   margin: 0 0.25rem;
   vertical-align: top;
`;

const ProjectSegmentWrapper = styled.div`
   ${AppStyles.inline_block}
   border-left: 0.1rem solid #cccccc;
   margin: 0 0.125rem;
`;

const MenuSegmentPairWrapper = styled.div`
   ${AppStyles.block}
`;

const AllSegmentsBlock = styled.div`
   ${AppStyles.block}
   margin-top: 0.5rem;
   padding-left: 1rem;
   border-top: 0.1rem solid #aaaaaa;
`;

export class ProjectSegmentsFrame extends Component {

   static propTypes = {
      data: PropTypes.object.isRequired,
      on_update: PropTypes.func.isRequired,
      components: PropTypes.array.isRequired,
   }

   state = {
      in_type_modal: false,
      segment_index: -1,
   };

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {data, on_update} = this.props;
      let update_needed = false;
      if (!data.segments) {
         data.segments = [];
         update_needed = true;
      }
      if (!data.meta) {
         data.meta = {};
         update_needed = true;
      }
      if (!data.segments.length) {
         data.segments.push(this.empty_segment());
         update_needed = true;
      }
      data.segments.forEach(segment => {
         if (!segment.id) {
            segment.id = Utils.random_id();
            update_needed = true;
         }
      })
      if (update_needed) {
         console.log("ProjectSegmentsFrame update_needed",data)
         on_update(data);
      }
   }

   empty_segment = () => {
      const EMPTY_SEGMENT = {
         id: Utils.random_id(),
         meta: {},
         props: {},
         segments: [],
      };
      return Object.assign({}, EMPTY_SEGMENT);
   }

   segment_split = (segment_index) => {
      const {data, on_update} = this.props;
      if (!data.segments[segment_index].segments) {
         data.segments[segment_index].segments = [];
      }
      const empty_segment = this.empty_segment();
      empty_segment.meta.segment_index = segment_index;
      data.segments[segment_index].segments.push(empty_segment);
      on_update(data);
   }

   segment_operation = (selected, segment_index, component) => {
      const {data, on_update} = this.props;
      const segment_data = data.segments[segment_index];
      const ref = ProjectSegment.segment_ref_map[segment_data.id];
      if (component && component.on_menu_select(selected, segment_data, ref)) {
         on_update(data);
         return;
      }
      let temp;
      console.log("segment_operation", selected);
      switch (selected) {
         case SEGMENT_CODE_ADD_ABOVE :
            data.segments.splice(segment_index, 0, this.empty_segment());
            on_update(data);
            break;
         case SEGMENT_CODE_ADD_BELOW :
            data.segments.splice(segment_index + 1, 0, this.empty_segment());
            on_update(data);
            break;
         case SEGMENT_CODE_MOVE_UP :
            if (!segment_index) {
               break;
            }
            temp = Object.assign({}, segment_data);
            data.segments[segment_index] = data.segments[segment_index - 1];
            data.segments[segment_index - 1] = temp;
            on_update(data);
            break;
         case SEGMENT_CODE_MOVE_DOWN :
            if (segment_index === data.segments.length - 1) {
               break;
            }
            temp = Object.assign({}, segment_data);
            data.segments[segment_index] = data.segments[segment_index + 1];
            data.segments[segment_index + 1] = temp;
            on_update(data);
            break;
         case SEGMENT_CODE_DELETE :
            data.segments.splice(segment_index, 1);
            on_update(data);
            break;
         case SEGMENT_CODE_ADD_RIGHT:
            this.segment_split(segment_index)
            break;
         default:
            break;
      }
   }

   type_selected = (response) => {
      const {segment_index} = this.state;
      const {data, on_update} = this.props;
      if (response) {
         console.log("type_selected", response);
         data.segments[segment_index].type = response;
         on_update(data);
      }
      this.setState({in_type_modal: false});
   }

   component_from_type = (type) => {
      const {components} = this.props;
      if (!type) {
         return false;
      }
      const found_component = components.find(comp => comp.class_name === type);
      if (found_component) {
         return found_component.component_type;
      }
      console.log("component_from_type can't find", type)
      return false;
   }

   render() {
      const {in_type_modal} = this.state;
      const {data, on_update, components} = this.props;
      const segments = !data.segments ? '' : data.segments.map((segment_data, index) => {

         const type_button = segment_data.type ? '' : <SpecifyType
            onClick={e => this.setState({in_type_modal: true, segment_index: index})}>
            <IconWrapper><FontAwesomeIcon icon={faQuestionCircle}/></IconWrapper>
            <ButtonText>what is it</ButtonText>
         </SpecifyType>

         const component = this.component_from_type(segment_data.type)
         const menu_options = SEGMENT_MENU.map(item => {
            if (item.label === "component" && component && segment_data) {
               item.submenu = component.get_menu_options(segment_data);
            }
            return Object.assign ({}, item);
         })
         const segments_menu = <SegmentsMenu
            menu_options={menu_options}
            on_selected={selected => this.segment_operation(selected, index, component)}/>

         const project_segment = !segment_data.type ? '' : <ProjectSegmentWrapper>
            <ProjectSegment
               segment_data={segment_data}
               on_update_props={props => {
                  Object.assign(data.segments[index].props, props);
                  on_update(data);
               }}
               on_update_segment_list={segments => {
                  Object.assign(data.segments[index].segments, segments);
                  on_update(data);
               }}
               components={components}/>
         </ProjectSegmentWrapper>

         return <MenuSegmentPairWrapper
            key={`segment_${segment_data.id}`}>
            {segments_menu}
            {type_button}
            {project_segment}
         </MenuSegmentPairWrapper>
      });
      return <SegmentsWrapper>
         <AllSegmentsBlock>
            {segments}
         </AllSegmentsBlock>
         {in_type_modal && <SegmentTypeModal
            components={components}
            on_response={response => this.type_selected(response)}
         />}
      </SegmentsWrapper>
   }
}

export default ProjectSegmentsFrame;
