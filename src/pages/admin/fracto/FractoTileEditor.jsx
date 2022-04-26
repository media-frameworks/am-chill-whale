import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../app/AppImports";
import StoreS3 from "../../../common/StoreS3";
import FractoUtil from "./FractoUtil";
import FractoCalc from "./FractoCalc";

const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";
const FRACTO_S3_URL_BASE = "https://mikehallstudio.s3.amazonaws.com/fracto/orbitals";

const IMAGE_SIZE_PX = 256;
const EXPECTED_PIXEL_COUNT = IMAGE_SIZE_PX * IMAGE_SIZE_PX;
const MAX_ITERATIONS = 1000000;

const CodeTitleSpan = styled.span`
   font-weight: 1000;
   font-size: 1.5rem;
   letter-spacing: 0.125rem;
   background-color: #dddddd;
   padding: 0.125rem 0.5rem;
   border-radius: 0.25rem;
   border: 0.15rem solid #bbbbbb;
`;

const ShortCodeTitleSpan = styled.span`
   ${AppStyles.monospace}
   font-weight: 1000;
   font-size: 1.25rem;
   padding: 0.125rem 0.5rem;
`;

const TilePathSpan = styled.span`
   ${AppStyles.monospace}
   font-size: 0.85rem;
   color: #888888;
`;

const TitleWrapper = styled(AppStyles.Block)`
   padding: 0.5rem 0;
`;

const ImageWrapper = styled(AppStyles.InlineBlock)`
   padding: 1rem;
`;

const GenerateTileLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.bold}
   ${AppColors.COLOR_COOL_BLUE};
`;

const AutoAdvanceWrapper = styled(AppStyles.InlineBlock)`
   font-size: 1.25rem;
   margin-right: 1rem;
`;

export class FractoTileEditor extends Component {

   static propTypes = {
      code: PropTypes.string.isRequired,
      on_publish_complete: PropTypes.func.isRequired,
      auto_publish: PropTypes.bool.isRequired
   }

   state = {
      image_path_256: '',
      short_code: '',
      tile: {},
      tile_data: {},
      canvas_ref: React.createRef(),
      ctx: null,
      published: false,
      auto_advance: false,
      auto_publish: false
   };

   componentDidMount() {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      this.setState({ctx: ctx});

      this.prepare_editor();
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {code} = this.props;
      if (prevProps.code !== code) {
         this.prepare_editor();
      }
   }

   prepare_editor = () => {
      const {code} = this.props;
      const short_code = FractoUtil.get_short_code(code);
      this.setState({published: false});
      fetch(`${FRACTO_PHP_URL_BASE}/get_tile_data.php?code=${code}&short_code=${short_code}`)
         .then(response => response.json())
         .then(json => {
            this.setState({
               short_code: short_code,
               tile: json,
               tile_data: {},
            });
            this.load_tile_data()
         });
   }

   load_tile_data = () => {
      const {auto_advance, auto_publish} = this.state;
      const {code, on_publish_complete} = this.props;
      const short_code = FractoUtil.get_short_code(code);
      const file_name_json = `${short_code}.json`;
      StoreS3.get_file_async(file_name_json, `fracto/tiles/${IMAGE_SIZE_PX}/json`, data => {
         if (!data) {
            if (auto_publish) {
               this.generate_tile();
            }
         } else {
            const parsed = JSON.parse(data);
            if (false && !parsed.all_patterns['0000'] && auto_advance) {
               on_publish_complete();
            } else {
               this.setState({
                  published: true,
                  tile_data: parsed
               });
               if (auto_publish) {
                  this.generate_tile(true);
               }
            }
         }
      });
   }

   generate_tile = (force_publish = false) => {
      const {auto_advance} = this.state;
      const {code, on_publish_complete} = this.props;
      const short_code = FractoUtil.get_short_code(code);
      fetch(`${FRACTO_PHP_URL_BASE}/generate_tile.php?code=${code}&short_code=${short_code}`)
         .then(response => response.json())
         .then(tile_data => {
            this.setState({tile_data: tile_data});
            this.render_image(tile_data);
            if (tile_data.all_points.length < EXPECTED_PIXEL_COUNT) {
               this.complete_tile(tile_data)
            } else if (force_publish || (tile_data.max_iterations > 20)) {
               this.publish_tile(tile_data)
            } else if (auto_advance) {
               on_publish_complete();
            }
         });
   }

   render_image = (tile_data) => {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      console.log("tile_data", tile_data);
      tile_data.all_points.forEach(point => {
         const color = FractoUtil.fracto_pattern_color(point.pattern, point.iterations)
         ctx.fillStyle = color;
         ctx.fillRect(point.img_x, point.img_y, 1, 1);
      });
   }

   render_tile_stats = () => {
      const {tile_data, published} = this.state;
      const all_patterns = Object.keys(tile_data.all_patterns);

      const all_data = [];
      all_data.push(`${tile_data.all_points.length} points`);
      all_data.push(`${all_patterns.length} patterns`);
      if (tile_data.tile_data.level) {
         all_data.push(`level ${tile_data.tile_data.level}`);
      }
      all_data.push(`------------`);
      all_data.push(`status: ${tile_data.tile_data.status}`);
      if (tile_data.max_iterations) {
         all_data.push(`${tile_data.max_iterations} max iterations`)
      }
      if (published) {
         all_data.push('published!')
      }
      all_data.push(`------------`);
      return all_data.map(data => {
         return <AppStyles.Block>{data}</AppStyles.Block>
      });
   }

   publish_tile = (tile_data) => {
      const {canvas_ref, auto_advance} = this.state;
      const {code, on_publish_complete} = this.props;
      const short_code = FractoUtil.get_short_code(code);

      const blob = FractoUtil.canvas_to_blob(canvas_ref);
      const file_name_png = `${short_code}.png`;
      StoreS3.put_file_async(file_name_png, blob, `fracto/tiles/${IMAGE_SIZE_PX}/png`, data => {
         console.log("publish png complete", data);
         const image_name = `/tiles/256/png/${short_code}.png`;
         StoreS3.remove_from_cache(image_name);
      });

      const json = JSON.stringify(tile_data);
      const file_name_json = `${short_code}.json`;
      StoreS3.put_file_async(file_name_json, json, `fracto/tiles/${IMAGE_SIZE_PX}/json`, data => {
         console.log("publish json complete", data);
         fetch(`${FRACTO_PHP_URL_BASE}/set_tile_status.php?code=${code}&status=complete`)
            .then(response => response.json())
            .then(results => {
               this.setState({published: true});
               if (auto_advance) {
                  on_publish_complete();
               }
               console.log("set_tile_status.php returns", results);
            });
      });

   }

   hash_value = (img_x, img_y) => {
      return `${img_x},${img_y}`;
   }

   complete_tile = (tile_data) => {
      const {auto_publish} = this.state;
      if (!tile_data.tile_data) {
         return;
      }
      console.log(`${EXPECTED_PIXEL_COUNT - tile_data.all_points.length} points to complete`)
      const points_hash = {};
      tile_data.all_points.forEach(data => {
         const hash_value = this.hash_value(data.img_x, data.img_y);
         points_hash[hash_value] = true;
      })
      const increment = tile_data.tile_data.bounds.size / IMAGE_SIZE_PX;
      const points_to_complete = [];
      for (let img_x = 0; img_x < IMAGE_SIZE_PX; img_x++) {
         const x = tile_data.tile_data.bounds.left + img_x * increment;
         for (let img_y = 0; img_y < IMAGE_SIZE_PX; img_y++) {
            const hash_value = this.hash_value(img_x, img_y);
            if (points_hash[hash_value]) {
               continue;
            }
            const y = tile_data.tile_data.bounds.top - img_y * increment;
            const tile_result = FractoCalc.calc(x, y, MAX_ITERATIONS);
            points_to_complete.push(tile_result);
         }
      }
      // console.log("points_to_complete", points_to_complete)

      const url = `${FRACTO_PHP_URL_BASE}/fill_points.php`;
      console.log("url", url);
      const body_data = JSON.stringify(points_to_complete);
      const that = this;
      fetch(url, {
         body: body_data, // data you send.
         headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
         },
         method: 'POST', // *GET, POST, PUT, DELETE, etc.
         mode: 'cors', // no-cors, cors, *same-origin
         // redirect: 'follow', // *manual, follow, error
         // referrer: 'no-referrer', // *client, no-referrer
      })
         .then(function (response) {
            // console.log("response", response)
            if (response.body) {
               return response.json();
            }
            return ["fail"];
         })
         .then(function (json) {
            console.log("fill_points result", json);
            if (auto_publish) {
               that.generate_tile();
            }
         });
   }

   render() {
      const {short_code, tile_data, canvas_ref, auto_advance, auto_publish} = this.state;
      const {code} = this.props;
      const tile_path = `${code.replaceAll('-', '/')}/index.json`;
      const have_tile_data = tile_data.all_points ? true : false;
      const code_path = code.replaceAll("-", "/");
      const image_url = `${FRACTO_S3_URL_BASE}/${code_path}/img_${code}_256.jpg`;
      const tile_stats = !have_tile_data ? '' : this.render_tile_stats();
      const auto_advance_checkbox = <AutoAdvanceWrapper>
         auto-advance:
         <input
            type={"checkbox"}
            checked={auto_advance}
            onChange={e => this.setState({auto_advance: !auto_advance})}/>
      </AutoAdvanceWrapper>
      const auto_publish_checkbox = <AutoAdvanceWrapper>
         auto-publish:
         <input
            type={"checkbox"}
            checked={auto_publish}
            onChange={e => this.setState({auto_publish: !auto_publish})}/>
      </AutoAdvanceWrapper>
      const tile_canvas = !have_tile_data ? '' :
         <canvas ref={canvas_ref} width={IMAGE_SIZE_PX} height={IMAGE_SIZE_PX}/>;
      const generate_tile_link = have_tile_data ? '' :
         <GenerateTileLink onClick={e => this.generate_tile()}>generate tile</GenerateTileLink>
      const publish_tile_link = !have_tile_data ? '' :
         <GenerateTileLink onClick={e => this.publish_tile(tile_data)}>publish tile</GenerateTileLink>
      const complete_tile_link = !have_tile_data ? '' :
         <GenerateTileLink onClick={e => this.complete_tile(tile_data)}>complete tile</GenerateTileLink>
      return <AppStyles.Block>
         <TitleWrapper>
            <CodeTitleSpan>{`${code}`}</CodeTitleSpan>
            <ShortCodeTitleSpan>{`[${short_code}]`}</ShortCodeTitleSpan>
            <TilePathSpan>{tile_path}</TilePathSpan>
         </TitleWrapper>
         <AppStyles.Block>
            {auto_advance_checkbox}
            {auto_publish_checkbox}
         </AppStyles.Block>
         <ImageWrapper>
            <img class="NO-CACHE" src={image_url} alt={"alt this"}/>
         </ImageWrapper>
         <ImageWrapper>
            {tile_canvas}
            {generate_tile_link}
         </ImageWrapper>
         <ImageWrapper>
            {tile_stats}
            {complete_tile_link}
            {publish_tile_link}
         </ImageWrapper>
      </AppStyles.Block>
   }

}

export default FractoTileEditor;
