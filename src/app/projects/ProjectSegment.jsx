/* eslint-disable react/forbid-foreign-prop-types */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../AppImports";
import ProjectSegmentsFrame from "./ProjectSegmentsFrame";

const ProjectBlockWrapper = styled.div`
   ${AppStyles.block}
`;

const ComponentWrapper = styled.div`
   ${AppStyles.inline_block}
   ${AppStyles.align_top}
`;

export class ProjectSegment extends Component {

   static propTypes = {
      segment_data: PropTypes.object.isRequired,
      on_update_props: PropTypes.func.isRequired,
      on_update_segment_list: PropTypes.func.isRequired,
      components: PropTypes.array.isRequired,
   }

   state = {
      component: null,
      component_type: null
   };

   componentDidMount() {
      const {segment_data} = this.props;
      const component_type = this.component_from_type(segment_data.type);
      this.setState({component_type: component_type})
      this.marshal_component(segment_data.props);
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {segment_data} = this.props;
      if (prevProps.segment_data.props !== segment_data.props) {
         this.marshal_component(segment_data.props)
      }
   }

   component_from_type = (type) => {
      const {components} = this.props;
      const found_component = components.find(comp => comp.class_name === type);
      if (found_component) {
         return found_component.component_type;
      }
      return false;
   }

   marshal_component = (component_props) => {
      const {component_type} = this.state;
      if (!component_type) {
         return
      }
      const {on_update_props} = this.props;
      if (!component_props) {
         return
      }
      const intf = ProjectSegment.query_interface(component_type);
      let props = {on_update_props: on_update_props}
      intf.forEach(i => {
         if (component_props[i.name]) {
            props[i.name] = component_props[i.name];
         }
      });
      this.setState({
         component: React.createElement(component_type, props),
      })
   }

   static query_interface = (component_type) => {
      const component = React.createElement(component_type)
      const {propTypes} = component.type;
      const prop_keys = Object.keys(propTypes);
      return prop_keys.map(key => {
         const prop_meta = {
            name: key,
            type: propTypes[key].type,
            required: propTypes[key].required,
         }
         if (propTypes[key].arg) {
            prop_meta['arg'] = propTypes[key].arg;
         }
         return prop_meta;
      });
   }

   update_sub_segment = (data, index) => {
      const {segment_data, on_update_segment_list} = this.props;
      segment_data.segments[index] = data;
      on_update_segment_list(segment_data.segments)
   }

   render() {
      const {component} = this.state;
      const {segment_data, components} = this.props;
      const first_block = <ComponentWrapper>
         {component}
      </ComponentWrapper>;
      const sub_blocks = !segment_data.segments ? [] : segment_data.segments.map((sub_segment, index) => {
         return <ProjectSegmentsFrame
            data={sub_segment}
            on_update={data => this.update_sub_segment(data, index)}
            is_expanded={true}
            components={components}
         />
      });
      return <ProjectBlockWrapper>
         {first_block}
         {sub_blocks}
      </ProjectBlockWrapper>
   }

}

export default ProjectSegment;
