/* eslint-disable react/forbid-foreign-prop-types */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

import {AppStyles} from "../AppImports";

export class ProjectSegment extends Component {

   static propTypes = {
      component_type: PropTypes.elementType.isRequired,
      component_props: PropTypes.object.isRequired,
      on_update: PropTypes.func.isRequired,
   }

   state = {
      component: null,
   };

   componentDidMount() {
      const {component_props} = this.props;
      this.marshal_component(component_props);
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {component_props} = this.props;
      if (prevProps.component_props !== component_props) {
         this.marshal_component(component_props)
      }
   }

   marshal_component = (component_props) => {
      const {on_update, component_type} = this.props;
      if (!component_props) {
         return
      }
      const intf = ProjectSegment.query_interface(component_type);
      let props = {on_update: on_update}
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

   render() {
      const {component} = this.state;
      return <AppStyles.Block>
         {component}
      </AppStyles.Block>
   }

}

export default ProjectSegment;
