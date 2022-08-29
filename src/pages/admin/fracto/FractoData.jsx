import LEVEL_02 from "data/fracto/json_100/level_02_complete.json";
import LEVEL_03 from "data/fracto/json_100/level_03_complete.json";
import LEVEL_04 from "data/fracto/json_100/level_04_complete.json";
import LEVEL_05 from "data/fracto/json_100/level_05_complete.json";
import LEVEL_06 from "data/fracto/json_100/level_06_complete.json";
import LEVEL_07 from "data/fracto/json_100/level_07_complete.json";
import LEVEL_08 from "data/fracto/json_100/level_08_complete.json";
import LEVEL_09 from "data/fracto/json_100/level_09_complete.json";
import LEVEL_10 from "data/fracto/json_100/level_10_complete.json";
import LEVEL_11 from "data/fracto/json_100/level_11_complete.json";
import LEVEL_12 from "data/fracto/json_100/level_12_complete.json";
import LEVEL_13 from "data/fracto/json_100/level_13_complete.json";
import LEVEL_14 from "data/fracto/json_100/level_14_complete.json";
import LEVEL_15 from "data/fracto/json_100/level_15_complete.json";
import LEVEL_16 from "data/fracto/json_100/level_16_complete.json";
import LEVEL_17 from "data/fracto/json_100/level_17_complete.json";
import LEVEL_18 from "data/fracto/json_100/level_18_complete.json";
import LEVEL_19 from "data/fracto/json_100/level_19_complete.json";
import LEVEL_20 from "data/fracto/json_100/level_20_complete.json";
import LEVEL_21 from "data/fracto/json_100/level_21_complete.json";
import LEVEL_22 from "data/fracto/json_100/level_22_complete.json";
import LEVEL_23 from "data/fracto/json_100/level_23_complete.json";
import LEVEL_24 from "data/fracto/json_100/level_24_complete.json";
import LEVEL_25 from "data/fracto/json_100/level_25_complete.json";
import LEVEL_26 from "data/fracto/json_100/level_26_complete.json";
import LEVEL_27 from "data/fracto/json_100/level_27_complete.json";
import LEVEL_28 from "data/fracto/json_100/level_28_complete.json";
import LEVEL_29 from "data/fracto/json_100/level_29_complete.json";
import LEVEL_30 from "data/fracto/json_100/level_30_complete.json";

import LEVEL_02_empty from "data/fracto/json_100/level_02_empty.json";
import LEVEL_03_empty from "data/fracto/json_100/level_03_empty.json";
import LEVEL_04_empty from "data/fracto/json_100/level_04_empty.json";
import LEVEL_05_empty from "data/fracto/json_100/level_05_empty.json";
import LEVEL_06_empty from "data/fracto/json_100/level_06_empty.json";
import LEVEL_07_empty from "data/fracto/json_100/level_07_empty.json";
import LEVEL_08_empty from "data/fracto/json_100/level_08_empty.json";
import LEVEL_09_empty from "data/fracto/json_100/level_09_empty.json";
import LEVEL_10_empty from "data/fracto/json_100/level_10_empty.json";
import LEVEL_11_empty from "data/fracto/json_100/level_11_empty.json";
import LEVEL_12_empty from "data/fracto/json_100/level_12_empty.json";
import LEVEL_13_empty from "data/fracto/json_100/level_13_empty.json";
import LEVEL_14_empty from "data/fracto/json_100/level_14_empty.json";
import LEVEL_15_empty from "data/fracto/json_100/level_15_empty.json";
import LEVEL_16_empty from "data/fracto/json_100/level_16_empty.json";
import LEVEL_17_empty from "data/fracto/json_100/level_17_empty.json";
import LEVEL_18_empty from "data/fracto/json_100/level_18_empty.json";
import LEVEL_19_empty from "data/fracto/json_100/level_19_empty.json";
import LEVEL_20_empty from "data/fracto/json_100/level_20_empty.json";
import LEVEL_21_empty from "data/fracto/json_100/level_21_empty.json";
import LEVEL_22_empty from "data/fracto/json_100/level_22_empty.json";
import LEVEL_23_empty from "data/fracto/json_100/level_23_empty.json";
import LEVEL_24_empty from "data/fracto/json_100/level_24_empty.json";
import LEVEL_25_empty from "data/fracto/json_100/level_25_empty.json";
import LEVEL_26_empty from "data/fracto/json_100/level_26_empty.json";
import LEVEL_27_empty from "data/fracto/json_100/level_27_empty.json";
import LEVEL_28_empty from "data/fracto/json_100/level_28_empty.json";
import LEVEL_29_empty from "data/fracto/json_100/level_29_empty.json";
import LEVEL_30_empty from "data/fracto/json_100/level_30_empty.json";

export const MAX_LEVEL = 30;

const LEVEL_SCOPES = [
   {cells: [], scope: 2.0},
   {cells: [], scope: 1.0},
   {cells: LEVEL_02, empties: LEVEL_02_empty, scope: 0.5},
   {cells: LEVEL_03, empties: LEVEL_03_empty, scope: 0.25},
   {cells: LEVEL_04, empties: LEVEL_04_empty, scope: 0.125},
   {cells: LEVEL_05, empties: LEVEL_05_empty, scope: 0.0625},
   {cells: LEVEL_06, empties: LEVEL_06_empty, scope: 0.03125},
   {cells: LEVEL_07, empties: LEVEL_07_empty, scope: 0.015625},
   {cells: LEVEL_08, empties: LEVEL_08_empty, scope: 0.0078125},
   {cells: LEVEL_09, empties: LEVEL_09_empty, scope: 0.00390625},
   {cells: LEVEL_10, empties: LEVEL_10_empty, scope: 0.001953125},
   {cells: LEVEL_11, empties: LEVEL_11_empty, scope: 0.0009765625},
   {cells: LEVEL_12, empties: LEVEL_12_empty, scope: 0.00048828125},
   {cells: LEVEL_13, empties: LEVEL_13_empty, scope: 0.000244140625},
   {cells: LEVEL_14, empties: LEVEL_14_empty, scope: 0.0001220703125},
   {cells: LEVEL_15, empties: LEVEL_15_empty, scope: 0.00006103515625},
   {cells: LEVEL_16, empties: LEVEL_16_empty, scope: 0.000030517578125},
   {cells: LEVEL_17, empties: LEVEL_17_empty, scope: 0.0000152587890625},
   {cells: LEVEL_18, empties: LEVEL_18_empty, scope: 0.00000762939453125},
   {cells: LEVEL_19, empties: LEVEL_19_empty, scope: 0.000003814697265625},
   {cells: LEVEL_20, empties: LEVEL_20_empty, scope: 0.0000019073486328125},
   {cells: LEVEL_21, empties: LEVEL_21_empty, scope: 0.00000095367431640625},
   {cells: LEVEL_22, empties: LEVEL_22_empty, scope: 0.000000476837158203125},
   {cells: LEVEL_23, empties: LEVEL_23_empty, scope: 0.0000002384185791015625},
   {cells: LEVEL_24, empties: LEVEL_24_empty, scope: 0.00000011920928955078125},
   {cells: LEVEL_25, empties: LEVEL_25_empty, scope: 0.000000059604644775390625},
   {cells: LEVEL_26, empties: LEVEL_26_empty, scope: 0.0000000298023223876953125},
   {cells: LEVEL_27, empties: LEVEL_27_empty, scope: 0.00000001490116119384765625},
   {cells: LEVEL_28, empties: LEVEL_28_empty, scope: 0.000000007450580596923828125},
   {cells: LEVEL_29, empties: LEVEL_29_empty, scope: 0.0000000037252902984619140625},
   {cells: LEVEL_30, empties: LEVEL_30_empty, scope: 0.00000000186264514923095703125},
];

export const get_ideal_level = (width_px, scope) => {

   const ideal_tiles_across = Math.ceil(1.99 * width_px / 256);
   const ideal_tile_scope = scope / ideal_tiles_across;

   let ideal_level = -1;
   for (let i = 0; i <= MAX_LEVEL; i++) {
      if (LEVEL_SCOPES[i].scope < ideal_tile_scope) {
         ideal_level = i;
         break;
      }
   }
   return ideal_level;
}

const cached_level_tiles = {};

export const GET_COMPLETED_TILES_ONLY = 1;
export const GET_EMPTY_TILES_ONLY = 2;
export const GET_ALL_TILES = 3;

export const get_level_tiles = (width_px, scope, flag = GET_ALL_TILES) => {
   const ideal_level = get_ideal_level(width_px, scope);
   const cache_key = `level_${ideal_level}`
   if (flag === GET_COMPLETED_TILES_ONLY) {
      return LEVEL_SCOPES[ideal_level].cells;
   }
   if (flag === GET_EMPTY_TILES_ONLY) {
      return LEVEL_SCOPES[ideal_level].empties;
   }
   if (!cached_level_tiles[cache_key]) {
      cached_level_tiles[cache_key] = LEVEL_SCOPES[ideal_level].cells.concat(LEVEL_SCOPES[ideal_level].empties);
   }
   return cached_level_tiles[cache_key];
}

export const get_level_cells = (level) => {
   return LEVEL_SCOPES[level].cells;
}