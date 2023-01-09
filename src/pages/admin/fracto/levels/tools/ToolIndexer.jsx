import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import StoreS3 from "common/StoreS3";
import {CoolModal, CoolButton} from "common/cool/CoolImports";

import {
   render_main_link,
   render_modal_title,
   render_short_code
} from "../../FractoStyles";
import FractoData from "../../FractoData";
import FractoUtil from "../../FractoUtil";
import FractoCalc from "../../FractoCalc";
import FractoActionWrapper, {
   OPTION_TILE_OUTLINE,
   OPTION_RENDER_LEVEL
} from "../../FractoActionWrapper";
import FractoActiveImage from "../../FractoActiveImage";

import ToolSelectTile from "./ToolSelectTile"
import ToolUtils from "./ToolUtils"

const CADENCE_MS = 500;

const StartAtPrompt = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   font-size: 1rem;
   margin-right: 0.5rem;
   vertical-align: middle;
   line-height: 2rem;
`;

const LinkWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.align_right}  
   line-height: 2rem;
   vertical-align: middle;
   width: 8rem;
`;

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 0.5rem 1rem 0;
`;

const NavigationWrapper = styled(AppStyles.Block)`
   margin: 0.5rem 1rem 0;
`;

export class ToolIndexer extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   static fracto_ref = React.createRef();
   static canvas_ref = React.createRef();

   state = {
      in_modal: false,
      data_ready: false,
      level_tiles: [],
      tile_index: -1,
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.25}
      },
      status: '',
      automate: false
   }

   componentDidMount() {
      this.load_level_tiles();
   }

   load_level_tiles = () => {
      const {level} = this.props;
      console.log("get_completed_tiles", level)

      const completed_tiles = FractoData.get_completed_tiles(level);
      const level_tiles = completed_tiles.sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      this.setState({
         data_ready: true,
         level_tiles: level_tiles,
      })
   }

   move_tile = (short_code, from, to) => {
      ToolUtils.tile_to_bin(short_code, from, to, result => {
         console.log("ToolUtils.tile_to_bin", short_code, to, result);
         this.setState({status: `moved from ${from} to ${to} (${result.result})`})
      })
   }

   index_tile = (new_tile_index) => {
      const {level_tiles, automate} = this.state
      const tile = level_tiles[new_tile_index];
      if (!tile) {
         console.log("index_tile can't load tile", new_tile_index, level_tiles);
         return;
      }
      console.log("index_tile", new_tile_index, tile);
      const half_scope = (tile.bounds.right - tile.bounds.left) / 2;
      const fracto_values = {
         focal_point: {
            x: tile.bounds.left + half_scope,
            y: tile.bounds.top - half_scope
         },
         scope: half_scope * 10
      }
      this.setState({
         tile_index: new_tile_index,
         fracto_values: fracto_values,
      });

      const canvas = ToolIndexer.canvas_ref.current
      const ctx = canvas.getContext('2d');

      const index_name = `tiles/256/indexed/${tile.short_code}.json`;
      StoreS3.get_file_async(index_name, "fracto", json_str => {
         console.log("StoreS3.get_file_async", index_name);
         if (json_str || 0) {
            const tile_data = JSON.parse(json_str);
            FractoUtil.data_to_canvas(tile_data, ctx)
            console.log("tile is currently indexed", index_name);
            this.move_tile(tile.short_code, "complete", "indexed")
            if (automate) {
               setTimeout(() => {
                  this.index_tile(new_tile_index + 1)
               }, CADENCE_MS)
            }
         } else {
            delete FractoActiveImage.tile_cache[tile.short_code]
            StoreS3.remove_from_cache(index_name);
            const json_name = `tiles/256/json/${tile.short_code}.json`;
            StoreS3.get_file_async(json_name, "fracto", json_str => {
               console.log("StoreS3.get_file_async", json_name);
               if (json_str) {
                  const tile_data = JSON.parse(json_str);
                  console.log("tile_data", tile_data);
                  const tile_points = new Array(256).fill(0).map(() => new Array(256).fill([0, 0]));
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
                  FractoUtil.data_to_canvas(tile_points, ctx)
                  StoreS3.put_file_async(index_name, JSON.stringify(tile_points), "fracto", result => {
                     console.log("StoreS3.put_file_async", index_name, result)
                     this.move_tile(tile.short_code, "complete", "indexed")
                     if (automate) {
                        setTimeout(() => {
                           this.index_tile(new_tile_index + 1)
                        }, CADENCE_MS);
                     }
                  })

               } else {
                  console.log("json file error", json_name);
                  this.move_tile(tile.short_code, "complete", "new")
                  if (automate) {
                     setTimeout(() => {
                        this.index_tile(new_tile_index + 1)
                     }, CADENCE_MS)
                  }
               }
            }, false)
         }
      }, false)

   }

   run_modal = () => {
      this.setState({in_modal: true})
      setTimeout(() => {
         this.index_tile(0);
      }, CADENCE_MS)
   }

   run_indexer = () => {
      const {tile_index, automate} = this.state;
      this.setState({automate: !automate})
      if (!automate) {
         setTimeout(() => {
            this.index_tile(tile_index);
         }, CADENCE_MS)
      }
   }

   repair_tile = (tile_index) => {
      const {level_tiles} = this.state;
      console.log("repair_tile", tile_index);

      const tile = level_tiles[tile_index];
      const half_scope = (tile.bounds.right - tile.bounds.left) / 2;
      const fracto_values = {
         focal_point: {
            x: tile.bounds.left + half_scope,
            y: tile.bounds.top - half_scope
         },
         scope: half_scope * 10
      }
      this.setState({
         tile_index: tile_index,
         fracto_values: fracto_values,
      });

      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;

      const canvas = ToolIndexer.canvas_ref.current
      const ctx = canvas.getContext('2d');

      const tile_points = new Array(256).fill(0).map(() => new Array(256).fill([0, 0]));
      for (let img_x = 0; img_x < 256; img_x++) {
         const x = tile.bounds.left + img_x * increment;
         for (let img_y = 0; img_y < 256; img_y++) {
            const y = tile.bounds.top - img_y * increment;
            const values = FractoCalc.calc(x, y);
            ctx.fillStyle = FractoUtil.fracto_pattern_color(values.pattern, values.iteration)
            ctx.fillRect(img_x, img_y, 1, 1);
            tile_points[img_x][img_y] = [values.pattern, values.iteration];
         }
      }
      const index_url = `tiles/256/indexed/${tile.short_code}.json`;
      delete FractoActiveImage.tile_cache[tile.short_code]
      StoreS3.remove_from_cache(index_url);
      StoreS3.put_file_async(index_url, JSON.stringify(tile_points), "fracto", result => {
         console.log("StoreS3.put_file_async", index_url, result);
         this.setState({status: `repair complete (${result})`, automate: true})
         setTimeout(() => {
            this.repair_tile(tile_index + 1);
         }, CADENCE_MS)
      })
   }

   render_modal_content = () => {
      const {level_tiles, tile_index, status, automate} = this.state;
      let selected_short_code = '-';
      if (tile_index >= 0) {
         const tile = level_tiles[tile_index];
         selected_short_code = render_short_code(tile.short_code);
      }
      const canvas = <canvas
         ref={ToolIndexer.canvas_ref}
         width={256}
         height={256}
      />
      const button_bar = [
         <CoolButton
            primary={tile_index >= 100 && !automate}
            disabled={automate}
            content={"-1000"}
            on_click={r => this.index_tile(tile_index - 1000)}
         />,
         <CoolButton
            primary={tile_index >= 100 && !automate}
            disabled={automate}
            content={"-100"}
            on_click={r => this.index_tile(tile_index - 100)}
         />,
         <CoolButton
            primary={tile_index >= 10 && !automate}
            disabled={automate}
            content={"-10"}
            on_click={r => this.index_tile(tile_index - 10)}
         />,
         <CoolButton
            primary={tile_index >= 1 && !automate}
            disabled={automate}
            content={"-1"}
            on_click={r => this.index_tile(tile_index - 1)}
         />,
         <CoolButton
            primary={1}
            content={automate ? "pause" : "go"}
            on_click={r => this.run_indexer()}
         />,
         <CoolButton
            primary={tile_index < (level_tiles.length - 2) && !automate}
            disabled={automate}
            content={"+1"}
            on_click={r => this.index_tile(tile_index + 1)}
         />,
         <CoolButton
            primary={tile_index < (level_tiles.length - 11) && !automate}
            disabled={automate}
            content={"+10"}
            on_click={r => this.index_tile(tile_index + 10)}
         />,
         <CoolButton
            primary={tile_index < (level_tiles.length - 100) && !automate}
            disabled={automate}
            content={"+100"}
            on_click={r => this.index_tile(tile_index + 101)}
         />,
         <CoolButton
            primary={tile_index < (level_tiles.length - 100) && !automate}
            disabled={automate}
            content={"+1000"}
            on_click={r => this.index_tile(tile_index + 1001)}
         />,
      ]
      const repair_button = automate ? '' : <CenteredBlock><CoolButton
         primary={1}
         content={"repair"}
         on_click={r => this.repair_tile(tile_index)}
      /></CenteredBlock>;
      return <AppStyles.Block>{[
         <CenteredBlock>{selected_short_code}</CenteredBlock>,
         <CenteredBlock>{status}</CenteredBlock>,
         repair_button,
         <CenteredBlock>{canvas}</CenteredBlock>,
         <CenteredBlock>{button_bar}</CenteredBlock>,
      ]}</AppStyles.Block>
   }

   render() {
      const {in_modal, data_ready, fracto_values, tile_index, level_tiles} = this.state;
      const {level, width_px} = this.props;

      const fracto_content = this.render_modal_content();
      const tile = level_tiles.length && tile_index >= 0 ? level_tiles[tile_index] : null
      let fracto_options = {};
      if (tile) {
         fracto_options[OPTION_TILE_OUTLINE] = tile.bounds;
         fracto_options[OPTION_RENDER_LEVEL] = level;
      }
      const fracto_action = <FractoActionWrapper
         fracto_values={fracto_values}
         content={fracto_content}
         // on_update={values => this.setState({fracto_values: values})}
         options={fracto_options}
      />

      const title = render_modal_title(`index tiles for level ${level}`);
      const done = level_tiles.length === tile_index;
      const progress = <CenteredBlock key={"progress"}>
         {!done ? `${tile_index} of ${level_tiles.length + 1} tiles indexed` : "Done!"}
      </CenteredBlock>
      const cancel_button = <CoolButton
         content={"cancel"}
         on_click={r => this.setState({in_modal: false})}
         style={{marginBottom: "0.5rem"}}
      />

      const modal = !in_modal || !data_ready ? '' : <CoolModal
         width={"1200px"}
         contents={[
            title, progress,
            <NavigationWrapper>{fracto_action}</NavigationWrapper>,
            <CenteredBlock key={"cancel"}>{cancel_button}</CenteredBlock>,
         ]}
         settings={{no_escape: true}}
      />

      const main_link = render_main_link("index", e => this.run_modal());
      return [
         <LinkWrapper>{main_link}</LinkWrapper>,
         <StartAtPrompt>start at:</StartAtPrompt>,
         <ToolSelectTile level={level} width_px={width_px}/>,
         modal
      ]
   }
}

export default ToolIndexer;
