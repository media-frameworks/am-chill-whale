import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import StoreS3 from "common/StoreS3";
import {CoolModal, CoolButton, CoolTabs} from "common/cool/CoolImports";

import {
   render_main_link,
   render_modal_title,
   render_short_code
} from "../../FractoStyles";
import FractoActionWrapper, {OPTION_TILE_OUTLINE, OPTION_RENDER_LEVEL} from "../../FractoActionWrapper";
import FractoUtil from "../../FractoUtil";
import FractoCalc from "../../FractoCalc";
import FractoProfile from "../../FractoProfile";
import FractoLayeredCanvas from "../../FractoLayeredCanvas";

import ToolSelectTile from "./ToolSelectTile"
import ToolUtils from "./ToolUtils"
import FrameworkMetaBlock from "./framework/FrameworkMetaBlock"

const CADENCE_MS = 1000;

const NAV_BUTTON_STYLE = {
   fontFamily: "monospace",
   fontSize: "0.85rem",
   fontWeight: "bold",
   padding: "0.25rem 0.5rem",
   margin: "0 0.05rem"
}

export const OPTION_NO_CANVAS = "no_canvas";

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
   margin: 0.25rem 1rem 0;
`;

const NavigationWrapper = styled(AppStyles.Block)`
   ${AppStyles.align_left}
   margin: 0.5rem 0 0;
`;

const TabContentWrapper = styled(AppStyles.Block)`
   ${AppStyles.align_left}
   margin: 0.25rem 1rem;
`;

const CanvasWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.align_left}
`;

const TabsWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.align_left}
   margin-left: 0.5rem;
`;

export class ToolFramework extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      level_tiles: PropTypes.array.isRequired,
      data_ready: PropTypes.bool.isRequired,
      verb: PropTypes.string.isRequired,
      tile_action: PropTypes.func.isRequired,
      options: PropTypes.object,
      extra_meta: PropTypes.array
   }

   static defaultProps = {
      options: {
         fracto_options: {},
         framework_options: {}
      },
      extra_meta: []
   }

   static fracto_ref = React.createRef();
   static canvas_ref = React.createRef();

   state = {
      in_modal: false,
      tile_index: -1,
      fracto_values: null,
      status: '',
      automate: false,
      tile_meta: null,
      ctx: null,
      tab_index: 0
   }

   static move_tile = (short_code, from, to) => {
      ToolUtils.tile_to_bin(short_code, from, to, result => {
         console.log("ToolUtils.tile_to_bin", short_code, to, result);
         this.setState({status: `moved from ${from} to ${to} (${result.result})`})
      })
   }

   componentDidMount() {
   }

   run_modal = () => {
      const {level, level_tiles, verb} = this.props
      const tile_index_str = localStorage.getItem(`level_${level}_${verb}_tile_index`);
      let tile_index = tile_index_str ? parseInt(tile_index_str) : 0;
      if (tile_index >= level_tiles.length) {
         tile_index = 0;
      }
      this.setState({in_modal: true})
      this.update_tile_index(tile_index, tile => {
         this.update_tile(tile);
      })
   }

   run_tool = () => {
      const {tile_index, automate} = this.state;
      this.setState({automate: !automate, tab_index: 1})
      if (!automate) {
         setTimeout(() => {
            this.tile_action(tile_index);
         }, CADENCE_MS)
      }
   }

   update_tile_index = (new_tile_index, cb) => {
      const {level, level_tiles, verb} = this.props;
      if (new_tile_index > level_tiles.length) {
         console.log("bad index", new_tile_index, level_tiles.length);
         cb(null);
         return;
      }
      const tile = level_tiles[new_tile_index];
      if (!tile) {
         console.log("can't load tile", new_tile_index, level_tiles.length);
         cb(null);
         return;
      }
      if (isNaN(tile.bounds.right) || isNaN(tile.bounds.left) || isNaN(tile.bounds.top) || isNaN(tile.bounds.bottom)) {
         console.log("bad numbers in tile bounds", tile.bounds);
         this.update_tile_index(new_tile_index + 1, cb)
         // cb(null);
         return;
      }
      console.log("update_tile_index tile", tile)
      const half_scope = (tile.bounds.right - tile.bounds.left) / 2;
      const fracto_values = {
         focal_point: {
            x: tile.bounds.left + half_scope,
            y: tile.bounds.top - half_scope
         },
         scope: half_scope * 8
      }
      this.setState({
         tile_index: new_tile_index,
         fracto_values: fracto_values,
      });
      localStorage.setItem(`level_${level}_${verb}_tile_index`, String(new_tile_index));

      const index_name = `tiles/256/indexed/${tile.short_code}.json`;
      StoreS3.get_file_async(index_name, "fracto", json_str => {
         console.log("StoreS3.get_file_async", index_name);
         if (json_str) {
            const tile_data = JSON.parse(json_str);
            tile['index'] = tile_data;
         } else {
            this.setState({status: "tile not found..."});
            tile['index'] = [];
         }
         cb(tile);
      }, false);

      const meta_name = `tiles/256/meta/${tile.short_code}.json`;
      StoreS3.get_file_async(meta_name, "fracto", json_str => {
         console.log("StoreS3.get_file_async", meta_name);
         if (json_str) {
            const tile_meta = JSON.parse(json_str);
            this.setState({tile_meta: tile_meta});
         } else {
            this.setState({tile_meta: null})
         }
      }, false);

   }

   tile_action = (new_tile_index) => {
      const {tile_action} = this.props

      this.update_tile_index(new_tile_index, tile => {
         if (!tile) {
            return;
         }
         const ctx = this.update_tile(tile);
         tile_action(tile, ctx, status => {
            const automate = status === "STOP" ? false : this.state.automate;
            this.setState({status: status, automate: automate});
            if (automate) {
               setTimeout(() => {
                  this.tile_action(new_tile_index + 1);
               }, CADENCE_MS)
            }
         })
      });
   }

   update_tile = (tile) => {
      const {options} = this.props
      if (!tile) {
         return;
      }
      let ctx = this.state.ctx;
      if (!ctx) {
         const canvas = ToolFramework.canvas_ref.current
         ctx = canvas.getContext('2d');
         this.setState({ctx: ctx})
      }
      const framework_options = options.framework_options || {};
      if (!(OPTION_NO_CANVAS in framework_options)) {
         FractoUtil.data_to_canvas(tile.index, ctx)
      }
      return ctx;
   }

   navigate_tile = (tile_index) => {
      this.update_tile_index(tile_index, tile => this.update_tile(tile))
   }

   render_button = (number, label) => {
      const {tile_index, automate} = this.state;
      const {level_tiles} = this.props;
      const result_number = tile_index + number;
      return <CoolButton
         primary={result_number >= 0 && result_number < level_tiles.length}
         disabled={automate}
         content={label}
         style={NAV_BUTTON_STYLE}
         on_click={r => this.navigate_tile(result_number)}
      />
   }

   repair_tile = (tile_index) => {
      const {ctx} = this.state

      const {level_tiles} = this.props
      const tile = level_tiles[tile_index]
      const tile_points = new Array(256).fill(0).map(() => new Array(256).fill([0, 0]));
      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;
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
      delete FractoLayeredCanvas.tile_cache[tile.short_code]
      StoreS3.remove_from_cache(index_url);
      StoreS3.put_file_async(index_url, JSON.stringify(tile_points), "fracto", result => {
         console.log("StoreS3.put_file_async", index_url, result);
         this.setState({status: `repair complete (${result})`})
         if (!this.state.automate) {
            return;
         }
         setTimeout(() => {
            this.update_tile_index(tile_index + 1, tile => {
               if (tile) {
                  this.repair_tile(tile_index + 1);
               }
            });
         }, CADENCE_MS)
      })
   }

   next_top = () => {
      const {tile_index} = this.state;
      const {level_tiles} = this.props;
      const base_tile = level_tiles[tile_index];

      let target_index = tile_index;
      while (target_index < level_tiles.length) {
         target_index += 1;
         const target_tile = level_tiles[target_index];
         if (target_tile.bounds.left !== base_tile.bounds.left) {
            this.navigate_tile(target_index);
            return;
         }
      }
      this.navigate_tile(level_tiles.length - 1);
   }

   previous_top = () => {
      const {tile_index} = this.state;
      const {level_tiles} = this.props;
      const base_tile = level_tiles[tile_index];

      let target_index = tile_index;
      let target_leftmost = 0;
      while (target_index >= 0) {
         target_index -= 1;
         const target_tile = level_tiles[target_index];
         if (target_tile.bounds.left !== base_tile.bounds.left && target_leftmost === 0) {
            target_leftmost = target_tile.bounds.left;
         }
         if (target_leftmost && target_tile.bounds.left !== target_leftmost) {
            this.navigate_tile(target_index + 1);
            return;
         }
      }
      this.navigate_tile(0);
   }

   render_modal_content = () => {
      const {tile_index, status, automate, tile_meta, tab_index} = this.state;
      const {level_tiles, extra_meta} = this.props
      let selected_short_code = '-';
      let tile_short_code = null;
      let tile = null;
      if (tile_index >= 0) {
         tile = level_tiles[tile_index];
         if (tile) {
            selected_short_code = render_short_code(tile.short_code);
            tile_short_code = tile.short_code;
         }
      }
      const canvas = <CanvasWrapper>
         <canvas
            ref={ToolFramework.canvas_ref}
            width={256}
            height={256}
         />
      </CanvasWrapper>
      const info_block = !tile_short_code ? '' : <TabsWrapper><CoolTabs
         style={{width: "20rem"}}
         tab_data={[
            {
               label: "meta",
               content: <TabContentWrapper>
                  <FrameworkMetaBlock tile_meta={tile_meta} short_code={tile_short_code}/>
               </TabContentWrapper>
            },
            {
               label: "action",
               content: <TabContentWrapper>{extra_meta ? extra_meta : ''}</TabContentWrapper>
            },
            {
               label: "orbitals",
               content: <FractoProfile tile_data={tile} width_px={350}/>
            },
         ]}
         initial_selection={tab_index}
      /></TabsWrapper>
      const nav_buttons = [
         this.render_button(-100000, "-100k"),
         this.render_button(-10000, "-10k"),
         this.render_button(-1000, "-1k"),
         this.render_button(-100, "-100"),
         this.render_button(-10, "-10"),
         this.render_button(-1, "-1"),
         <CoolButton
            primary={1}
            content={automate ? "pause" : "go"}
            style={{margin: "0 0.25rem"}}
            on_click={r => this.run_tool()}
         />,
         this.render_button(1, "+1"),
         this.render_button(10, "+10"),
         this.render_button(100, "+100"),
         this.render_button(1000, "+1k"),
         this.render_button(10000, "+10k"),
         this.render_button(100000, "+100k"),
      ]
      const top_row_buttons = [
         <CoolButton
            primary={1}
            disabled={automate}
            content={"prev. top"}
            style={NAV_BUTTON_STYLE}
            on_click={r => this.previous_top()}
         />,
         <CoolButton
            primary={1}
            disabled={automate}
            content={"first"}
            style={NAV_BUTTON_STYLE}
            on_click={r => this.navigate_tile(0)}
         />,
         <CoolButton
            primary={1}
            disabled={automate}
            content={"next top"}
            style={NAV_BUTTON_STYLE}
            on_click={r => this.next_top()}
         />,
      ]
      const repair_button = automate ? '' : <CenteredBlock><CoolButton
         primary={1}
         content={"repair"}
         on_click={r => {
            this.setState({automate: true});
            this.repair_tile(tile_index);
         }}
      /></CenteredBlock>;
      return <AppStyles.Block>{[
         <CenteredBlock>{selected_short_code}</CenteredBlock>,
         <CenteredBlock>{status}</CenteredBlock>,
         repair_button,
         <CenteredBlock>{canvas}{info_block}</CenteredBlock>,
         <CenteredBlock>{top_row_buttons}</CenteredBlock>,
         <CenteredBlock>{nav_buttons}</CenteredBlock>,
      ]}</AppStyles.Block>
   }

   render() {
      const {in_modal, fracto_values, tile_index} = this.state;
      const {level, level_tiles, data_ready, verb, options} = this.props;

      const fracto_content = this.render_modal_content();
      const tile = level_tiles.length && tile_index >= 0 ? level_tiles[tile_index] : null
      let fracto_options = options.fracto_options || {};
      if (tile) {
         fracto_options[OPTION_TILE_OUTLINE] = tile.bounds;
         if (fracto_options[OPTION_RENDER_LEVEL]) {
            fracto_options[OPTION_RENDER_LEVEL] = level;
         }
      }
      const fracto_action = fracto_values === null ? '' : <FractoActionWrapper
         fracto_values={fracto_values}
         content={fracto_content}
         options={fracto_options}
      />

      const title = render_modal_title(`${verb} tiles for level ${level}`);
      const done = level_tiles.length - 1 === tile_index;
      const progress = <CenteredBlock key={"progress"}>
         {!done ? `${verb} ${tile_index + 1} of ${level_tiles.length + 1} tiles` : "Done!"}
      </CenteredBlock>
      const cancel_button = <CoolButton
         content={"cancel"}
         on_click={r => this.setState({in_modal: false, automate: false})}
         style={{margin: "0.5rem"}}
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

      const main_link = render_main_link(verb, e => this.run_modal());
      return [
         <LinkWrapper>{main_link}</LinkWrapper>,
         <StartAtPrompt>start at:</StartAtPrompt>,
         <ToolSelectTile level={level}/>,
         modal
      ]
   }
}

export default ToolFramework;
