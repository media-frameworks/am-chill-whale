import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import CoolButton from "common/cool/CoolButton";
import StoreS3 from "common/StoreS3";

import FractoUtil from "../FractoUtil";
import FractoCalc from "../FractoCalc";

const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";

const DeclarationBlock = styled(AppStyles.InlineBlock)`
   margin-left: 2rem;
`;

const CanvasWrapper = styled(AppStyles.Block)`
   margin: 0.5rem 2rem;
`;

const GoButton = styled.span`
   ${AppStyles.bold}
   ${AppStyles.uppercase}
   padding: 0 0.25rem;
   font-size: 0.75rem;
   color: white;
   background: ${AppColors.HSL_COOL_BLUE};
`;

const StopButton = styled.span`
   ${AppStyles.bold}
   ${AppStyles.uppercase}
   padding: 0 0.25rem;
   font-size: 0.75rem;
   color: white;
   background: maroon;
`;

export class TileProceesor extends Component {

   static propTypes = {
      tiles: PropTypes.array.isRequired
   }

   state = {
      process_index: -1,
      generate_tiles: [],
      processing: false
   }

   componentDidMount() {
      this.tiles_to_process()
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {tiles} = this.props;
      if (prevProps.tiles !== tiles) {
         this.tiles_to_process()
      }
   }

   tiles_to_process = () => {
      const {tiles} = this.props;
      let generate_tiles = []
      tiles.forEach(tile => {
         const half_span = (tile.bounds.right - tile.bounds.left) / 2;
         generate_tiles.push({
            code: `${tile.code}-00`,
            bounds: {
               left: tile.bounds.left,
               top: tile.bounds.top,
               right: tile.bounds.left + half_span,
               bottom: tile.bounds.top - half_span
            }
         });
         generate_tiles.push({
            code: `${tile.code}-01`,
            bounds: {
               left: tile.bounds.left + half_span,
               top: tile.bounds.top,
               right: tile.bounds.right,
               bottom: tile.bounds.top - half_span
            }
         });
         generate_tiles.push({
            code: `${tile.code}-10`,
            bounds: {
               left: tile.bounds.left,
               top: tile.bounds.top - half_span,
               right: tile.bounds.left + half_span,
               bottom: tile.bounds.bottom
            }
         });
         generate_tiles.push({
            code: `${tile.code}-11`,
            bounds: {
               left: tile.bounds.left + half_span,
               top: tile.bounds.top - half_span,
               right: tile.bounds.right,
               bottom: tile.bounds.bottom
            }
         });
      });
      console.log("generate_tiles", generate_tiles)
      this.setState({generate_tiles: generate_tiles,})
   }

   static generate_tile = (tile_data, cb, is_redo = false) => {
      console.log("generating tile...", tile_data.code)
      const short_code = FractoUtil.get_short_code(tile_data.code);
      fetch(`${FRACTO_PHP_URL_BASE}/generate_tile.php?code=${tile_data.code}&short_code=${short_code}`)
         .then(response => response.json())
         .then(result => {
            console.log("fetch returns", result)
            if (!result.tile_data) {
               cb(result)
            } else {
               TileProceesor.render_image(result)
               if (!is_redo && result.all_points.length < 256 * 256) {
                  TileProceesor.complete_tile(result, cb)
               } else {
                  console.log("all points compleed", tile_data.code)
                  cb(result)
               }
            }
         });
   }

   static hash_key = (img_x, img_y) => {
      return `[${img_x},${img_y}]`;
   }

   static complete_tile = (cell, cb) => {

      console.log("completing tile...", cell);
      const points_hash = {};
      cell.all_points.forEach(data => {
         const hash_key = TileProceesor.hash_key(data.img_x, data.img_y);
         points_hash[hash_key] = true;
      });

      const cell_bounds = cell.tile_data.bounds;
      const increment = cell_bounds.size / 256;
      const points_to_complete = [];
      for (let img_x = 0; img_x < 256; img_x++) {
         const x = cell_bounds.left + img_x * increment;
         for (let img_y = 0; img_y < 256; img_y++) {
            const hash_value = TileProceesor.hash_key(img_x, img_y);
            if (points_hash[hash_value]) {
               continue;
            }
            const y = cell_bounds.top - img_y * increment;
            const tile_result = FractoCalc.calc(x, y, 1000000);
            points_to_complete.push(tile_result);
         }
      }

      const url = `${FRACTO_PHP_URL_BASE}/fill_points.php`;
      const body_data = JSON.stringify(points_to_complete);
      fetch(url, {
         body: body_data, // data you send.
         headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
         },
         method: 'POST', // *GET, POST, PUT, DELETE, etc.
         mode: 'cors', // no-cors, cors, *same-origin
      })
         .then(response => response.json())
         .then(result => {
            console.log("fill_points result", result);
            TileProceesor.generate_tile(cell.tile_data, cb, true);
         });
   }

   static canvas_ref = React.createRef();

   static render_image = (tile_data) => {
      const canvas = TileProceesor.canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 256, 256);

      tile_data.all_points.forEach(point => {
         const color = FractoUtil.fracto_pattern_color(point.pattern, point.iterations)
         ctx.fillStyle = color;
         ctx.fillRect(point.img_x, point.img_y, 1, 1);
      });
   }

   static publish_tile = (result, cb) => {

      const blob = FractoUtil.canvas_to_blob(TileProceesor.canvas_ref);
      const file_name_png = `${result.short_code}.png`;
      StoreS3.put_file_async(file_name_png, blob, `fracto/tiles/256/png`, data => {
         console.log("publish png complete", data);
         const image_name = `/tiles/256/png/${result.short_code}.png`;
         StoreS3.remove_from_cache(image_name);
      });

      const json = JSON.stringify(result);
      const file_name_json = `${result.short_code}.json`;
      StoreS3.put_file_async(file_name_json, json, `fracto/tiles/256/json`, data => {
         console.log("publish json complete", data);
         fetch(`${FRACTO_PHP_URL_BASE}/set_tile_status.php?code=${result.code}&status=complete`)
            .then(response => response.json())
            .then(results => {
               console.log("set_tile_status.php returns", results);
               cb(results)
            });
      });

   }

   process_tile = (tile_index) => {
      const {generate_tiles} = this.state;
      this.setState({process_index: tile_index})
      TileProceesor.generate_tile(generate_tiles[tile_index], result => {
         const {processing} = this.state;
         if (generate_tiles.length === tile_index + 1) {
            this.setState({processing: false})
         } else if (result && processing) {
            TileProceesor.publish_tile(result, data => {
               if (data && processing) {
                  this.process_tile(tile_index + 1)
               }
            });
         }
      })
   }

   start_processing = () => {
      this.setState({processing: true})
      this.process_tile(0);
   }

   stop_processing = () => {
      const {processing} = this.state;
      if (!processing) {
         return;
      }
      console.log("stopped")
      this.setState({processing: false})
   }

   render() {
      const {generate_tiles, processing, process_index} = this.state;
      const button_style = {
         marginLeft: "0.5rem",
         padding: "0",
      }
      const go_button_content = <GoButton>go</GoButton>;
      const go_button = processing ? '' : <CoolButton
         content={go_button_content}
         style={button_style}
         on_click={e => this.start_processing()}/>
      const stop_button_content = <StopButton>stop</StopButton>;
      const stop_button = !processing ? '' : <CoolButton
         content={stop_button_content}
         style={button_style}
         on_click={e => this.stop_processing()}/>
      const tile_canvas = !processing ? '' : <CanvasWrapper>
         <canvas ref={TileProceesor.canvas_ref} width={256} height={256}/>
      </CanvasWrapper>
      const progress = !processing ? '' : ` #${process_index}... `
      return [
         <DeclarationBlock>{`${generate_tiles.length} tiles to process:`}</DeclarationBlock>,
         go_button, progress, stop_button,
         tile_canvas
      ]
   }

}

export default TileProceesor;
