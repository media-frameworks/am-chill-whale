import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";

import FractoCommon from "../FractoCommon";
import {get_ideal_level, get_level_tiles, GET_COMPLETED_TILES_ONLY} from "../FractoData";
import FractoSieve from "../FractoSieve";

import CommonRenderModal from "./CommonRenderModal";
import CommonTilesGenerate from "./CommonTilesGenerate";

const S3_FRACTO_PREFIX = 'https://mikehallstudio.s3.amazonaws.com/fracto';

const COLUMN_WIDTH_REM = 5;
const CELL_HEIGHT_REM = 3;

const TableWrapper = styled(AppStyles.Block)`
   margin: 0.5rem 1rem;
`;

const ColumnHeader = styled(AppStyles.InlineBlock)`
   ${AppStyles.centered}
   padding: 0 1rem 0;
   width: ${COLUMN_WIDTH_REM}rem;
   border-bottom: 0.15rem solid ${AppColors.HSL_COOL_BLUE};
   border-right: 0.15rem solid #dddddd;
`;

const HeaderSpan = styled.span`
   ${AppStyles.monospace}
   color: #666666;
`;

const TableRow = styled(AppStyles.Block)`
   width: ${COLUMN_WIDTH_REM * 7.25}rem;
   height: ${CELL_HEIGHT_REM}rem;
   &:hover {
      background-color: #eeeeee;
   }
`;

const TableCell = styled(AppStyles.InlineBlock)`
   ${AppStyles.centered}
   padding: 0.5rem 1rem;
   width: ${COLUMN_WIDTH_REM}rem;
   height: ${CELL_HEIGHT_REM}rem;
   border-right: 0.15rem solid #dddddd;
`;

const ViewLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppColors.COLOR_COOL_BLUE}
   font-size: 1.25rem;   
`;

const DimensionLink = styled.span`
   ${AppStyles.link}
   ${AppColors.COLOR_DEEP_BLUE}
   font-size: 1.25rem;   
`;

const CellExtra = styled(AppStyles.Block)`
   ${AppStyles.monospace}
   ${AppStyles.centered}
   font-size: 0.75rem;
   color: #888888;
`;

const RenderLevelSpan = styled.span`
   ${AppStyles.link}
   ${AppColors.COLOR_COOL_BLUE}
   &:hover {
      ${AppStyles.underline}
      ${AppStyles.italic}
   }
`;

export class CommonRenderings extends Component {

   static propTypes = {
      registry_data: PropTypes.object.isRequired,
      fracto_values: PropTypes.object.isRequired,
      s3_folder_prefix: PropTypes.string.isRequired,
      size_list: PropTypes.array.isRequired,
      on_change: PropTypes.func.isRequired
   }

   state = {
      render_dimension: 0,
      in_view_image: 0,
      render_level_dimension: false,
      generate_tiles: []
   }

   render_response = (r) => {
      const {on_change} = this.props;
      this.setState({render_dimension: 0, render_level_dimension: 0})
      if (r) {
         on_change()
      }
   }

   format_filesize = (filesize) => {
      if (filesize < 1024) {
         return `${filesize} B`;
      }
      if (filesize < 1024 * 1024) {
         const rounded = Math.floor((100 * filesize) / 1024) / 100;
         return `${rounded} KB`;
      }
      const rounded = Math.floor((100 * filesize) / (1024 * 1024)) / 100;
      return `${rounded} MB`;
   }

   setup_render_dimension = (width_px) => {
      const {fracto_values} = this.props;
      const level_tiles = get_level_tiles(width_px, fracto_values.scope);
      const generate_tiles = FractoSieve.find_tiles(level_tiles, fracto_values.focal_point, 1.0, fracto_values.scope);
      this.setState({
         render_level_dimension: width_px,
         generate_tiles: generate_tiles
      })
   }

   render() {
      const {render_dimension, in_view_image, render_level_dimension, generate_tiles} = this.state;
      const {registry_data, s3_folder_prefix, fracto_values, size_list} = this.props;
      console.log("CommonRenderings registry_data", registry_data)

      const header = ["dimension", "image", "data", "patterns", "level"].map(col_name => {
         return <ColumnHeader><HeaderSpan>{col_name}</HeaderSpan></ColumnHeader>
      })
      const rows = size_list.map(dim => {
         const png_data = !registry_data.png_files ? [] :
            registry_data.png_files.filter(file => file.size === dim);
         const json_data = !registry_data.json_files ? [] :
            registry_data.json_files.filter(file => file.size === dim);
         const pattern_data = !registry_data.pattern_files ? [] :
            registry_data.pattern_files.filter(file => file.size === dim);

         const png_cell = png_data.length ?
            <ViewLink onClick={() => this.setState({in_view_image: dim})}>{"view"}</ViewLink> : "---";
         const png_cell_extra =
            <CellExtra>{!png_data.length ? '' : this.format_filesize(png_data[0].filesize)}</CellExtra>;

         const json_cell_extra =
            <CellExtra>{!json_data.length ? '' : this.format_filesize(json_data[0].filesize)}</CellExtra>
         const pattern_cell_extra =
            <CellExtra>{!pattern_data.length ? '' : this.format_filesize(pattern_data[0].filesize)}</CellExtra>

         const png_href = !png_data.length ? '' : `${S3_FRACTO_PREFIX}/${png_data[0].filename}`;
         const view_image = in_view_image !== dim ? '' : FractoCommon.view_image(dim, png_href, () => {
            this.setState({in_view_image: 0})
         })

         const level = !fracto_values ? '' : get_ideal_level(dim, fracto_values.scope);
         const level_tiles = !fracto_values ? [] : get_level_tiles(dim, fracto_values.scope);
         const completed_tiles = !fracto_values ? [] : get_level_tiles(dim, fracto_values.scope, GET_COMPLETED_TILES_ONLY);
         const tiles_in_level = !fracto_values ? [] : FractoSieve.find_tiles(level_tiles, fracto_values.focal_point, 1.0, fracto_values.scope);
         const completed_tiles_in_level = !fracto_values ? [] : FractoSieve.find_tiles(completed_tiles, fracto_values.focal_point, 1.0, fracto_values.scope);
         const level_cell_extra = !fracto_values ? '' :
            <CellExtra>{`${completed_tiles_in_level.length}/${tiles_in_level.length} tiles`}</CellExtra>

         return [
            <TableRow>
               <TableCell
                  title={'click to generate dimension'}
                  onClick={e => this.setState({render_dimension: dim})}
               ><DimensionLink>{dim}</DimensionLink></TableCell>
               <TableCell>{png_cell}{png_cell_extra}</TableCell>
               <TableCell>{json_data.length ? "verify" : "---"}{json_cell_extra}</TableCell>
               <TableCell>{pattern_data.length ? "inspect" : "---"}{pattern_cell_extra}</TableCell>
               <TableCell>
                  <RenderLevelSpan onClick={e => this.setup_render_dimension(dim)}>
                     {level}
                  </RenderLevelSpan>
                  {level_cell_extra}
               </TableCell>
            </TableRow>,
            view_image
         ]
      })
      const render_dimension_modal = !render_dimension ? '' : <CommonRenderModal
         dimension={render_dimension}
         s3_folder_prefix={s3_folder_prefix}
         fracto_values={fracto_values}
         on_modal_response={r => this.render_response(r)}
      />
      const render_level_modal = !render_level_dimension ? '' : <CommonTilesGenerate
         on_response_modal={r => this.render_response(r)}
         tiles_list={generate_tiles}
      />

      return [
         <TableWrapper>
            <AppStyles.Block>{header}</AppStyles.Block>
            <AppStyles.Block>{rows}</AppStyles.Block>
         </TableWrapper>,
         render_dimension_modal,
         render_level_modal
      ]
   }
}

export default CommonRenderings;
