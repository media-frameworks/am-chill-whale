import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";
//
// import AppStyles from "app/AppStyles";

import FractoData from "../../FractoData";

import ToolFramework, {OPTION_NO_CANVAS} from "./ToolFramework";
import {OPTION_RENDER_LEVEL} from "../../FractoActionWrapper";

export class ToolClassify extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
      data_ready: false,
      level_tiles: []
   }

   componentDidMount() {
      const {level} = this.props;

      const new_tiles = FractoData.get_potential_tiles(level);

      const level_tiles = new_tiles.sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      this.setState({
         data_ready: true,
         level_tiles: level_tiles,
      })
   }

   classify_tile = (tile, ctx, cb) => {
      console.log("classify_tile", tile)
      cb("OK")
   }

   render () {
      const {level_tiles, data_ready} = this.state;
      const {level} = this.props;

      let fracto_options = {};
      fracto_options[OPTION_RENDER_LEVEL] = level - 1;

      let framework_options = {};
      framework_options[OPTION_NO_CANVAS] = true;

      const options = {
         fracto_options: fracto_options,
         framework_options: framework_options
      }
      return <ToolFramework
         level={level}
         level_tiles={level_tiles}
         data_ready={data_ready}
         verb={"classify"}
         tile_action={this.classify_tile}
         options={options}
      />
   }

}

export default ToolClassify;