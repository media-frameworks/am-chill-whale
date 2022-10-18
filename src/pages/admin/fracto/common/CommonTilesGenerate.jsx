import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";
import CoolButton from "common/cool/CoolButton";

import {render_modal_title} from "../FractoStyles";
import {get_level_tiles} from "../FractoData";
import FractoSieve from "../FractoSieve";
import FractoUtil from "../FractoUtil";
import TileProcessor from "../tile/TileProcessor";

const S3_FRACTO_PREFIX = 'https://mikehallstudio.s3.amazonaws.com/fracto';

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 0.5rem 1rem 0;
`;

export class CommonTilesGenerate extends Component {

   static propTypes = {
      on_response_modal: PropTypes.func.isRequired,
      s3_folder_prefix: PropTypes.string.isRequired,
      fracto_values: PropTypes.object.isRequired,
      width_px: PropTypes.number.isRequired
   };

   state = {
      generate_tiles: [],
      tile_index: -1,
      did_cancel: false,
   };

   componentDidMount() {
      const {fracto_values, width_px} = this.props;
      const level_tiles = get_level_tiles(width_px, fracto_values.scope);
      const generate_tiles = FractoSieve.find_tiles(level_tiles, fracto_values.focal_point, 1.0, fracto_values.scope);
      this.setState({generate_tiles: generate_tiles});
      setTimeout(() => this.process_tile(0), 1000)
   }

   process_tile = (tile_index) => {
      const {generate_tiles, did_cancel} = this.state;
      this.setState({tile_index: tile_index})
      if (generate_tiles.length === tile_index || did_cancel) {
         return;
      }
      TileProcessor.generate_tile(generate_tiles[tile_index], result => {
         console.log("TileProcessor.generate_tile", generate_tiles[tile_index], result)
         if (!result) {
            return;
         }
         if (result === 1) {
            this.process_tile(tile_index + 1)
            return;
         }
         TileProcessor.publish_tile(result, data => {
            console.log("TileProcessor.publish_tile", result, data)
            const canvas = TileProcessor.canvas_ref.current
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 256, 256);
            if (data) {
               this.process_tile(tile_index + 1)
            }
         });
      })
   }

   render() {
      const {generate_tiles, tile_index, did_cancel} = this.state;
      const {on_response_modal} = this.props;
      const title = render_modal_title(`generate ${generate_tiles.length} tiles`);
      const canvas = <canvas
         ref={TileProcessor.canvas_ref}
         width={256}
         height={256}
      />

      let previous_image = '';
      if (tile_index > 0) {
         const previous_code = generate_tiles[tile_index - 1].code;
         const previous_short_code = FractoUtil.get_short_code(previous_code);
         const previous_image_url = `${S3_FRACTO_PREFIX}/tiles/256/png/${previous_short_code}.png`;
         previous_image = <img src={previous_image_url} alt={"no alt for you"}/>
      }

      const done = generate_tiles.length === tile_index;
      const progress = <CenteredBlock>
         {!done ? `${tile_index + 1} of ${generate_tiles.length} tiles complete` : "Done!"}
      </CenteredBlock>

      const cancel_button = <CoolButton
         primary={1}
         content={done || did_cancel ? "exit" : "CANCEL"}
         on_click={e => done ? on_response_modal(1) : this.setState({did_cancel: true})}/>

      return <CoolModal
         width={"600px"}
         contents={[
            title,
            progress,
            <CenteredBlock>
               {previous_image}
               {canvas}
            </CenteredBlock>,
            <CenteredBlock>{cancel_button}</CenteredBlock>
         ]}
         response={r => on_response_modal(r)}
         settings={{no_escape: true}}
      />
   }

}

export default CommonTilesGenerate;
