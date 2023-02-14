import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";
//
// import AppStyles from "app/AppStyles";
// import StoreS3 from "common/StoreS3";
import ErrorBoundary from "common/ErrorBoundary";

import FractoData from "../../FractoData";

import ToolFramework from "./ToolFramework";

const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";

export class ToolEdge extends Component {

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
      const indexed_tiles = FractoData.get_indexed_tiles(level);
      const level_tiles = indexed_tiles.sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      this.setState({
         data_ready: true,
         level_tiles: level_tiles,
      })
   }

   edge_tile = (tile, ctx, cb) => {
      const {level} = this.props;
      if (!tile || !tile["index"]) {
         cb(`no indexed tile, cannot edge`)
         return;
      }
      for (let img_x = 0; img_x < 256; img_x++) {
         for (let img_y = 0; img_y < 256; img_y++) {
            const [pattern, iterations] = tile["index"][img_x][img_y];
            if (iterations > 2 * level) {
               cb("not on edge");
               return;
            }
         }
      }
      if (tile.bounds.bottom === 0) {
         cb(`will not edge inline tile`)
         return;
      }
      const url = `${FRACTO_PHP_URL_BASE}/empty_tile.php?short_code=${tile.short_code}&confirmed=CONFIRMED`;
      fetch(url)
         .then(response => response.json())
         .then(result => {
            console.log(url, result)
            const tiles_to_empty = result ? result.all_descendants.length : 0;
            cb(`emptied ${tiles_to_empty} tiles on edge`)
         })
   }

   render() {
      const {level_tiles, data_ready} = this.state;
      const {level} = this.props;
      return <ErrorBoundary>
         <ToolFramework
            level={level}
            level_tiles={level_tiles}
            data_ready={data_ready}
            verb={"edge"}
            tile_action={this.edge_tile}
         />
      </ErrorBoundary>
   }

}

export default ToolEdge;