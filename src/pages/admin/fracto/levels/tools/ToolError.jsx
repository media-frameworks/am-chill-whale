import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";
//
// import AppStyles from "app/AppStyles";
// import StoreS3 from "common/StoreS3";

import FractoData from "../../FractoData";

import ToolFramework from "./ToolFramework";

export class ToolError extends Component {

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
      const error_tiles = FractoData.get_error_tiles(level);
      const level_tiles = error_tiles.sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      this.setState({
         data_ready: true,
         level_tiles: level_tiles,
      })
   }

   error_tile = (tile, ctx, cb) => {
      console.log("error_tile", tile)
      cb("OK")
   }

   render() {
      const {level_tiles, data_ready} = this.state;
      const {level} = this.props;
      return <ToolFramework
         level={level}
         level_tiles={level_tiles}
         data_ready={data_ready}
         verb={"error"}
         tile_action={this.error_tile}
      />
   }

}

export default ToolError;