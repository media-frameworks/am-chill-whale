import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";

import FractoCommon from "../FractoCommon";
import CommonRenderModal from "./CommonRenderModal";

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
   width: ${COLUMN_WIDTH_REM * 5.75}rem;
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

export class CommonRenderings extends Component {

   static propTypes = {
      registry_data: PropTypes.object.isRequired,
      fracto_values: PropTypes.object.isRequired,
      s3_folder_prefix: PropTypes.string.isRequired,
      on_change: PropTypes.func.isRequired
   }

   state = {
      render_dimension: 0,
      in_view_image: 0
   }

   render_response = (r) => {
      const {on_change} = this.props;
      this.setState({render_dimension: 0})
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

   render() {
      const {render_dimension, in_view_image} = this.state;
      const {registry_data, s3_folder_prefix, fracto_values} = this.props;
      console.log("CommonRenderings registry_data", registry_data)

      const header = ["dimension", "image", "data", "patterns"].map(col_name => {
         return <ColumnHeader><HeaderSpan>{col_name}</HeaderSpan></ColumnHeader>
      })
      const rows = [128, 256, 512, 1024, 2048].map(dim => {
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

         return [
            <TableRow>
               <TableCell
                  title={'click to generate dimension'}
                  onClick={e => this.setState({render_dimension: dim})}
               ><DimensionLink>{dim}</DimensionLink></TableCell>
               <TableCell>{png_cell}{png_cell_extra}</TableCell>
               <TableCell>{json_data.length ? "verify" : "---"}{json_cell_extra}</TableCell>
               <TableCell>{pattern_data.length ? "inspect" : "---"}{pattern_cell_extra}</TableCell>
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
      return [
         <TableWrapper>
            <AppStyles.Block>{header}</AppStyles.Block>
            <AppStyles.Block>{rows}</AppStyles.Block>
         </TableWrapper>,
         render_dimension_modal
      ]
   }
}

export default CommonRenderings;
