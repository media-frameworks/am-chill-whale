import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import FractoImage from "./FractoImage";
import {PHI} from "../../../common/math/constants";

const RE_SCOPE_FACTOR = PHI;
const UPDATE_DELAY = 250;

export class FractoRender extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      aspect_ratio: PropTypes.number,
      on_param_change: PropTypes.func.isRequired,
   }

   static defaultProps = {
      aspect_ratio: 1,
   };

   componentDidMount() {
      const {scope, focal_point} = this.state;
      const {on_param_change} = this.props;
      on_param_change({
         scope: scope,
         focal_point: focal_point
      });
   }

   state = {
      focal_point: {x: -0.75, y: 0.0},
      scope: 4,
      fracto_ref: React.createRef(),
      in_update: true
   };

   get_offset = (el) => {
      var _x = 0;
      var _y = 0;
      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
         _x += el.offsetLeft - el.scrollLeft;
         _y += el.offsetTop - el.scrollTop;
         el = el.offsetParent;
      }
      return {top: _y, left: _x};
   }

   re_position = (e) => {
      const {aspect_ratio, on_param_change} = this.props;
      const {focal_point, scope, fracto_ref, in_update} = this.state;
      if (in_update) {
         console.log("re_scope returning during update");
         return;
      }
      const image_bounds = fracto_ref.current.getBoundingClientRect();
      const image_offset = this.get_offset(e.target)
      if (e.clientX < image_offset.left) {
         return;
      }
      if (e.clientX > image_offset.left + image_bounds.width) {
         return;
      }
      if (e.clientY < image_offset.top) {
         return;
      }
      if (e.clientY > image_offset.top + image_bounds.height) {
         return;
      }
      const x_portion = (e.clientX - image_offset.left) / image_bounds.width;
      const y_portion = (e.clientY - image_offset.top) / image_bounds.height;

      const half_scope = scope / 2;
      const focal_x = (focal_point.x - half_scope) + x_portion * scope;
      const focal_y = (focal_point.y + half_scope * aspect_ratio) - y_portion * scope * aspect_ratio;

      console.log("new center", focal_x, focal_y);
      const new_focal_point = {x: focal_x, y: focal_y}
      this.setState({
         focal_point: new_focal_point,
         in_update: true
      });
      on_param_change({
         scope: scope,
         focal_point: new_focal_point
      });
   }

   re_scope = (e) => {
      const {scope, focal_point, in_update} = this.state;
      const {on_param_change} = this.props;
      if (in_update) {
         console.log("re_scope returning during update");
         return;
      }
      let new_scope = scope;
      if (e.deltaY > 0) {
         new_scope *= RE_SCOPE_FACTOR;
      } else if (e.deltaY < 0) {
         new_scope /= RE_SCOPE_FACTOR;
      }
      this.setState({
         scope: new_scope,
         in_update: true
      });
      on_param_change({
         scope: new_scope,
         focal_point: focal_point
      });
   }

   render() {
      const {focal_point, scope, fracto_ref, in_update} = this.state;
      const {width_px, aspect_ratio} = this.props;
      return <AppStyles.Block
         ref={fracto_ref}>
         <FractoImage
            on_click={e => this.re_position(e)}
            on_zoom={e => this.re_scope(e)}
            on_ready={e => {
               if (in_update) {
                  this.setState({in_update: false})
               }
            }}
            width_px={width_px}
            aspect_ratio={aspect_ratio}
            focal_point={focal_point}
            scope={scope}
         />
      </AppStyles.Block>
   }

}

export default FractoRender;
