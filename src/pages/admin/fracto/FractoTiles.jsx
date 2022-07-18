import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";

import FractoUtil from "./FractoUtil";
import FractoLocate from "./FractoLocate";
import TilePatterns from "./tile/TilePatterns";

const FRACTO_S3_URL_BASE = "https://mikehallstudio.s3.amazonaws.com/fracto/tiles/256/png";

const TileRow = styled(AppStyles.Block)`
   padding: 0.125rem 0.25rem;
   &:hover {
      background-color: #dddddd;
   }
`;

const TilesWrapper = styled(AppStyles.InlineBlock)`
   cursor: default; 
   margin: 0.5rem;
   overflow: auto;
   max-height: 256px;
   border: 1px solid #888888;
`;

const ShortCodeSpan = styled.span`
   ${AppStyles.monospace}
   font-size: 0.75rem;
   color: white;
   border-radius: 0.25rem;
   padding: 0.125rem 0.25rem 0;
   margin-right: 0.5rem;
   background-color: ${AppColors.HSL_DEEP_BLUE};
`;

const SelectedRow = styled(AppStyles.InlineBlock)`
   background-color: #666666;
   color: white;
   font-size: 0.85rem;
   padding: 0 0.25rem;
   margin-top: 0.125rem;
   border-radius: 0.25rem;
`;

const PreviewImageWrapper = styled.img`
   border: 1px solid #888888;
   margin: 0.5rem;  
`;

export class FractoTiles extends Component {

   constructor(props) {
      super(props);
      this.state.tiles_list_ref = React.createRef();
   }

   static propTypes = {
      cells: PropTypes.array.isRequired,
   }

   state = {}

   componentDidMount() {
      document.addEventListener('keydown', this.key_handler);
   }

   componentWillUnmount() {
      document.removeEventListener('keydown', this.key_handler);
   }

   key_handler = (e) => {
      const {selected_row, tiles_list_ref} = this.state;
      const {cells} = this.props;
      if (e.code === "ArrowDown" && selected_row < cells.length - 1) {
         tiles_list_ref.current.scrollTop += 22;
         this.setState({selected_row: selected_row + 1})
      }
      if (e.code === "ArrowUp" && selected_row > 0) {
         tiles_list_ref.current.scrollTop -= 22;
         this.setState({selected_row: selected_row - 1})
      }
      e.preventDefault();
      e.stopPropagation();
   }

   state = {
      selected_row: 0,
   }

   render() {
      const {selected_row, tiles_list_ref} = this.state;
      const {cells} = this.props;
      const tiles_list = cells.map((cell, i) => {
         const short_code = <ShortCodeSpan>
            {FractoUtil.get_short_code(cell.code)}
         </ShortCodeSpan>
         const location = FractoLocate.render_coordinates(cell.bounds.left, cell.bounds.top)
         const row_location = i === selected_row ?
            <SelectedRow>{location}</SelectedRow> : location;
         return <TileRow onClick={e => this.setState({selected_row: i})}>{short_code}{row_location}</TileRow>
      })
      const selected_short_code = FractoUtil.get_short_code(cells[selected_row].code)
      const image_url = `${FRACTO_S3_URL_BASE}/${selected_short_code}.png`;
      const tile_view = <AppStyles.InlineBlock>
         <PreviewImageWrapper src={image_url} alt={selected_short_code}/>
      </AppStyles.InlineBlock>
      const tile_patterns = <TilePatterns short_code={selected_short_code}/>
      // const tile_bailiwicks = <TileBailiwicks short_code={selected_short_code} />
      return [
         <TilesWrapper ref={tiles_list_ref}>{tiles_list}</TilesWrapper>,
         tile_view,
         tile_patterns
      ]
   }

}

export default FractoTiles;
