import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import Complex from "common/math/Complex";
import StoreS3 from "common/StoreS3";

import FractoData from "../../FractoData";
import FractoLocate from "../../FractoLocate";
import FractoUtil from "../../FractoUtil";

import ToolFramework from "./ToolFramework";

const MetaBlock = styled(AppStyles.Block)`
   margin-bottom: 0.25rem;
`;

const MAX_A_TESTS = 100000;
const MAX_PATTERNS = 5000;
// const EPSILON = 0.000001;

export class ToolFills extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
      data_ready: false,
      level_tiles: [],
      extra_meta: [],
      mi_points: [],
      point_index: -1,
      scope: 0,
      tile: {}
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

   find_pattern = (re, im) => {
      const {scope} = this.state
      for (let i = 0; i < MAX_A_TESTS; i++) {
         const angle = Math.random() * 1000;
         const distance = Math.random() * scope - (scope / 2);
         const A = new Complex(
            re + distance * Math.cos(angle),
            im + distance * Math.sin(angle)
         );
         const neg_A = A.scale(-1);
         const x = new Complex(re, im)
         let ongoing = Object.assign({}, A);
         for (let pattern = 1; pattern < MAX_PATTERNS; pattern++) {
            ongoing = ongoing.mul(ongoing).add(x)
            if (isNaN(ongoing.re) || isNaN(ongoing.im)) {
               break;
            }
            const result = ongoing.add(neg_A);
            const magnitude = result.magnitude();
            if (magnitude < scope / 50000) {
               console.log("magnitude, pattern", magnitude, pattern)
               return pattern;
            }
         }
      }
      return -1;
   }

   fill_point = (point_index, ctx, cb) => {
      const {mi_points, tile, success_count} = this.state
      if (point_index >= mi_points.length) {
         cb("completed")
         return;
      }
      const meta_entries = [
         `${point_index+1}/${mi_points.length} attempted, ${success_count} success`,
         FractoLocate.render_coordinates(mi_points[point_index].x, mi_points[point_index].y)
      ]
      this.setState({extra_meta: meta_entries.map(entry => <MetaBlock>{entry}</MetaBlock>)})
      const pattern = this.find_pattern(mi_points[point_index].x, mi_points[point_index].y)
      if (pattern > 0) {
         ctx.fillStyle = FractoUtil.fracto_pattern_color(pattern, 1000000)
         ctx.fillRect(mi_points[point_index].img_x, mi_points[point_index].img_y, 1, 1);
         tile.index[mi_points[point_index].img_x][mi_points[point_index].img_y] = [pattern, 1000000];
         const index_url = `tiles/256/indexed/${tile.short_code}.json`;
         this.setState({success_count: success_count + 1})
         StoreS3.put_file_async(index_url, JSON.stringify(tile.index), "fracto", result => {
            if (!result) {
               console.log("StoreS3.put_file_async failed", index_url);
               return;
            }
            setTimeout(() => this.fill_point(point_index + 1, ctx, cb), 100);
         })
      } else {
         console.log("pattern not found");
         setTimeout(() => this.fill_point(point_index + 1, ctx, cb), 100);
      }
   }

   fill_points = (mi_points, ctx, cb) => {
      this.setState({
         mi_points: mi_points,
         success_count: 0
      });
      setTimeout(() => this.fill_point(0, ctx, cb), 100);
   }

   fills_tile = (tile, ctx, cb) => {
      if (!tile || !tile["index"]) {
         cb(`no indexed tile to fill`)
         return;
      }
      const mi_points = [];
      const size = tile.bounds.right - tile.bounds.left
      for (let img_x = 0; img_x < 256; img_x++) {
         for (let img_y = 0; img_y < 256; img_y++) {
            const [pattern, iterations] = tile["index"][img_x][img_y];
            if (parseInt(pattern) < 0) {
               mi_points.push({
                  x: tile.bounds.left + img_x * size / 256,
                  y: tile.bounds.top - img_y * size / 256,
                  img_x: img_x,
                  img_y: img_y
               })
            }
         }
      }
      const meta_entries = [`0/${mi_points.length} attempted`]
      this.setState({
         tile: tile,
         scope: 5 * size,
         extra_meta: meta_entries.map(entry => <MetaBlock>{entry}</MetaBlock>)
      })
      this.fill_points(mi_points, ctx, cb)
   }

   render() {
      const {level_tiles, data_ready, extra_meta} = this.state;
      const {level} = this.props;
      return <ToolFramework
         level={level}
         level_tiles={level_tiles}
         data_ready={data_ready}
         verb={"fills"}
         tile_action={this.fills_tile}
         extra_meta={extra_meta}
      />
   }

}

export default ToolFills;