import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import StoreS3 from "common/StoreS3";
import CoolModal from "common/cool/CoolModal";
import CoolButton from "common/cool/CoolButton";

import {render_modal_title} from "../FractoStyles";
import {get_level_cells} from "../FractoData";
import FractoUtil from "../FractoUtil";

const START_AT = 49000;
const MAXIMUM_COUNT = 1000000;

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 0.5rem 1rem 0;
`;

export class LevelIndexTiles extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      on_response_modal: PropTypes.func.isRequired,
   }

   state = {
      level_tiles: [],
      ready: false,
      tile_index: -1,
      did_cancel: false,
      short_code: '',
      tile_points: [],
      ctx: null
   }

   static canvas_ref = React.createRef();

   componentDidMount() {
      const {level} = this.props;

      const canvas = LevelIndexTiles.canvas_ref.current
      const ctx = canvas.getContext('2d');

      const level_tiles = get_level_cells(level)
         .sort((a,b) => a.bounds.left === b.bounds.left ? b.bounds.top - a.bounds.top : a.bounds.left - b.bounds.left)
      const tile_points = new Array(256).fill(0).map(() => new Array(256).fill(0));
      this.setState({
         ctx: ctx,
         level_tiles: level_tiles,
         tile_points: tile_points,
         ready: true
      })
      setTimeout(() => {
         this.process_tile(START_AT)
      }, 1000);
   }

   data_to_canvas = () => {
      const {tile_points, ctx} = this.state;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 256, 256);
      for (let img_x = 0; img_x < 256; img_x++) {
         const y_values = tile_points[img_x];
         for (let img_y = 0; img_y < 256; img_y++){
            const data_values = y_values[img_y];
            ctx.fillStyle = FractoUtil.fracto_pattern_color(data_values[0], data_values[1])
            ctx.fillRect(img_x, img_y, 1, 1);
         }
      }
   }

   process_tile = (tile_index) => {
      const {level_tiles, did_cancel, tile_points} = this.state;
      const {on_response_modal} = this.props;

      if (level_tiles.length === tile_index || did_cancel || (tile_index - START_AT > MAXIMUM_COUNT)) {
         this.setState({
            tile_index: tile_index,
            short_code: ''
         });
         return;
      }

      const tile = level_tiles[tile_index];
      const short_code = FractoUtil.get_short_code(tile.code);
      this.setState({
         tile_index: tile_index,
         short_code: short_code
      });
      console.log("tile",tile)

      const json_name = `tiles/256/json/${short_code}.json`;
      StoreS3.get_file_async(json_name, "fracto", json_str => {
         console.log("StoreS3.get_file_async", json_name);
         if (json_str) {
            const tile_data = JSON.parse(json_str);
            // console.log("tile_data", tile_data);
            for (let data_index = 0; data_index < tile_data.all_points.length; data_index++) {
               const point = tile_data.all_points[data_index];
               if (point.img_x > 255 || point.img_y > 255) {
                  continue;
               }
               if (point.img_x < 0 || point.img_y < 0) {
                  continue;
               }
               tile_points[point.img_x][point.img_y] = [point.pattern, parseInt(point.iterations)]
            }
            // console.log("tile_points", tile_points);
            const index_name = `tiles/256/indexed/${short_code}.json`;
            StoreS3.put_file_async(index_name, JSON.stringify(tile_points), "fracto", result => {
               console.log("StoreS3.put_file_async", index_name, result)
               this.data_to_canvas()
               setTimeout(() => {
                  this.process_tile(tile_index + 1)
               }, 1000);
            })

         } else {
            console.log("file error");
            setTimeout(() => {
               this.process_tile(tile_index + 1)
            }, 100);
         }
      }, false)
   }

   render() {
      const {tile_index, level_tiles, did_cancel, short_code} = this.state;
      const {level, on_response_modal} = this.props;

      const title = render_modal_title(`index tiles for level ${level}`);
      const cancel_button = <CoolButton
         primary={1}
         content={"cancel"}
         on_click={r => {
            this.setState({did_cancel: true});
            on_response_modal(-1);
         }}
      />

      const done = level_tiles.length === tile_index;
      const progress = <CenteredBlock>
         {!done ? `${tile_index} of ${level_tiles.length} tiles indexed` : "Done!"}
      </CenteredBlock>

      const canvas = <canvas
         ref={LevelIndexTiles.canvas_ref}
         width={256}
         height={256}
      />

      return <CoolModal
         width={"600px"}
         contents={[
            title, progress,
            <CenteredBlock>{canvas}</CenteredBlock>,
            <CenteredBlock>{short_code}</CenteredBlock>,
            <CenteredBlock>{cancel_button}</CenteredBlock>
         ]}
         response={r => on_response_modal(r)}
         settings={{no_escape: true}}
      />
   }

}

export default LevelIndexTiles;
