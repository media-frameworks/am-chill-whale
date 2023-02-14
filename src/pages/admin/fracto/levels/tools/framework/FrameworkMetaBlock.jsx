import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
// import StoreS3 from "common/StoreS3";
import {CoolButton} from "common/cool/CoolImports";

const MetaBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.align_left}
   margin: 0 0.5rem;
   min-width: 20rem;
`;

const MetaRow = styled(AppStyles.Block)`
   ${AppStyles.align_left}
   margin: 0 0 0.125rem;
`;

const MetaLabel = styled.span`
   ${AppStyles.italic}
   ${AppStyles.bold}
   padding-right: 0.5rem;
   color: #888888;
   font-size: 0.90rem;
`;

const MetaValue = styled.span`
   ${AppStyles.monospace}
   color: #222222;
   font-size: 1rem;
`;

const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";

export class FrameworkMetaBlock extends Component {

   static propTypes = {
      tile_meta: PropTypes.object.isRequired,
      short_code: PropTypes.string.isRequired,
   }

   state = {
      tiles_to_empty: []
   }

   componentDidMount() {
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {short_code} = this.props;
      if (short_code !== prevProps.short_code) {
         this.setState({tiles_to_empty: []})
      }
   }

   query_empty = (confirmed = false) => {
      const {short_code} = this.props;
      const confirmed_part = !confirmed ? '' : "&confirmed=CONFIRMED"
      const url = `${FRACTO_PHP_URL_BASE}/empty_tile.php?short_code=${short_code}${confirmed_part}`;
      fetch(url)
         .then(response => response.json())
         .then(result => {
            this.setState({tiles_to_empty: confirmed ? [] : result.all_descendants})
            console.log(url, result)
         })
   }

   render() {
      const {tiles_to_empty} = this.state;
      const {tile_meta, short_code} = this.props;
      if (!tile_meta) {
         return <MetaBlock>{"no meta data"}</MetaBlock>
      }
      const all_rows = Object.keys(tile_meta).map(key => {
         return <MetaRow>
            <MetaLabel>{`${key}:`}</MetaLabel>
            <MetaValue>{`${tile_meta[key]}`}</MetaValue>
         </MetaRow>
      })
      const empty_query = !tiles_to_empty.length ? '' : <MetaRow>
         {`${tiles_to_empty.length} tile(s) found`}
      </MetaRow>
      const empty_button = tile_meta.highest_iteration_value >= 2 * short_code.length ? '' : <MetaRow><CoolButton
         primary={1}
         content={tiles_to_empty.length ? "confirm" : "empty"}
         on_click={r => {
            this.query_empty(tiles_to_empty.length);
         }}
      /></MetaRow>;
      return <MetaBlock>{[
         all_rows,
         empty_button,
         empty_query
      ]}</MetaBlock>
   }

}

export default FrameworkMetaBlock;
