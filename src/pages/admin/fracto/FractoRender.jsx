import React, {Component} from 'react';
import PropTypes from 'prop-types';
<<<<<<< HEAD
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import FractoImage from "./FractoImage";

const RE_SCOPE_FACTOR = 1.25;
const DEFAULT_SCOPE = 4;
const DEFAULT_FOCAL_POINT = {x: -0.75, y: 0.0};

const TileBox = styled.div`
   position: fixed;
   border: 0.125rem solid red;
   pointer-events: none;
`;
=======
// import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import FractoImage from "./FractoImage";
import {PHI} from "../../../common/math/constants";

const RE_SCOPE_FACTOR = PHI;
const UPDATE_DELAY = 250;
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe

export class FractoRender extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
<<<<<<< HEAD
      on_param_change: PropTypes.func.isRequired,
      aspect_ratio: PropTypes.number,
      initial_params: PropTypes.object,
      tile_outline: PropTypes.object,
=======
      aspect_ratio: PropTypes.number,
      on_param_change: PropTypes.func.isRequired,
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
   }

   static defaultProps = {
      aspect_ratio: 1,
<<<<<<< HEAD
      initial_params: {
         scope: DEFAULT_SCOPE,
         focal_point: DEFAULT_FOCAL_POINT
      },
      tile_outline: {}
   };

   componentDidMount() {
      const {initial_params, on_param_change} = this.props;
      this.setState({
         scope: initial_params.scope,
         focal_point: {
            x: initial_params.focal_point.x,
            y: initial_params.focal_point.y
         }
      })
      on_param_change(initial_params);
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {initial_params} = this.props;
      if (initial_params.focal_point.x !== prevProps.initial_params.focal_point.x ||
         initial_params.focal_point.y !== prevProps.initial_params.focal_point.y) {
         const new_focal_point = {
            x: initial_params.focal_point.x,
            y: initial_params.focal_point.y
         };
         this.setState({focal_point: new_focal_point});
      }
   }

   state = {
      focal_point: DEFAULT_FOCAL_POINT,
      scope: DEFAULT_SCOPE,
=======
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
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
      fracto_ref: React.createRef(),
      in_update: true
   };

<<<<<<< HEAD
   static get_offset = (el) => {
=======
   get_offset = (el) => {
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
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
<<<<<<< HEAD
         console.log("re_position returning during update");
         return;
      }
      const image_bounds = fracto_ref.current.getBoundingClientRect();
      const image_offset = FractoRender.get_offset(e.target)
=======
         console.log("re_scope returning during update");
         return;
      }
      const image_bounds = fracto_ref.current.getBoundingClientRect();
      const image_offset = this.get_offset(e.target)
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
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
<<<<<<< HEAD
      const {width_px, aspect_ratio, tile_outline} = this.props;
=======
      const {width_px, aspect_ratio} = this.props;
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
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
<<<<<<< HEAD
         <TileBox style={tile_outline}/>
=======
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
      </AppStyles.Block>
   }

}

export default FractoRender;
