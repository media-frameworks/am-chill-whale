import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {
   Synth,
   now
} from 'tone';

import {AppStyles, AppColors} from "../../../app/AppImports";
import {ONE_BY_PHI} from "../../../common/math/constants";
import FractoUtil from "../fracto/FractoUtil";
import FractoRender from "../fracto/FractoRender";

const MASK_RADIUS = 3;
const MASK_WIDTH = 2 * MASK_RADIUS + 1;
const SYNTH_COUNT = MASK_WIDTH * MASK_WIDTH;
const MID_INDEX = MASK_RADIUS * MASK_WIDTH + MASK_RADIUS;
const TONE_MASK = [
   0, 1 / 4, 1 / 3, 1 / 2, 1 / 3, 1 / 4, 0,
   1 / 4, 1 / 3, 1 / 2, 3 / 4, 1 / 2, 1 / 3, 1 / 4,
   1 / 3, 1 / 2, 3 / 4, 5 / 6, 3 / 4, 1 / 2, 1 / 3,
   1 / 2, 3 / 4, 5 / 6, 1, 5 / 6, 3 / 4, 1 / 2,
   1 / 3, 1 / 2, 3 / 4, 5 / 6, 3 / 4, 1 / 2, 1 / 3,
   1 / 4, 1 / 3, 1 / 2, 3 / 4, 1 / 2, 1 / 3, 1 / 4,
   0, 1 / 4, 1 / 3, 1 / 2, 1 / 3, 1 / 4, 0
];

const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";
const INSTRUMENT_WIDTH = 800;
const INSTRUMENT_HEIGHT = INSTRUMENT_WIDTH * ONE_BY_PHI;
const BASE_FREQ = 27.5;

const PlayButton = styled(AppStyles.InlineBlock)`
   ${AppStyles.pointer}
   color: white;
   margin: 0.5rem 1rem;
   padding: 0.5rem 1rem;
   background-color: ${AppColors.HSL_DEEP_BLUE};
   border-radius: 0.25rem;
`;

const PatternTone = styled(AppStyles.Block)`
   ${AppStyles.pointer}
   width: 2rem;
   font-size: 0.75rem;
   text-align: center;
   color: white;
   text-shadow: 0.125rem 0.125rem 0.25rem rgba(0,0,0,0.95);
   margin-right: 2px;
   margin-bottom: 2px;
   border-radius: 0.25rem;
`;

const TonesWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem;
`;

const ColumnWrapper = styled(AppStyles.InlineBlock)`
   height: 40rem;
`;

const FractoWrapper = styled(AppStyles.InlineBlock)`
   margin-top: 1rem;
   vertical-aligh: top;
`;

const CanvasField = styled.canvas`
    margin: 0.5rem auto;
`;

export class FractoTone extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.625}
      },
      synths: [],
      instrument: null,
      canvas_ref: React.createRef(),
      ctx: null,
      bounds_rect: {},
      in_save: false,
      in_drag: false,
      wrapper_ref: React.createRef()
   };

   componentDidMount() {
      const {canvas_ref, wrapper_ref} = this.state;
      const canvas = canvas_ref.current;
      if (canvas) {
         const ctx = canvas.getContext('2d');
         const bounds_rect = canvas.getBoundingClientRect();
         this.setState({ctx: ctx, bounds_rect: bounds_rect});
      }
      const synths = [];
      for (let i = 0; i < SYNTH_COUNT; i++) {
         const synth = new Synth().toDestination();
         synth.set({
            oscillator: {
               type: "sine",
               volume: -10 + -50 * (1.0 - TONE_MASK[i])
            }
         })
         synths.push(synth);
      }
      this.setState({synths: synths});
      const wrapper = wrapper_ref.current;
      wrapper.addEventListener('touchstart', this.process_touchstart, false);
      wrapper.addEventListener('touchmove', this.process_touchmove, false);
      wrapper.addEventListener('touchcancel', this.process_touchcancel, false);
      wrapper.addEventListener('touchend', this.process_touchend, false);
   }

   process_touchstart = (e) => {
      console.log("process_touchstart")
      for (let i=0; i < e.targetTouches.length; i++) {
         this.start_drag(e.targetTouches[i])
      }
      e.preventDefault();
   }

   process_touchmove = (e) => {
      console.log("process_touchmove")
      for (let i=0; i < e.targetTouches.length; i++) {
         this.on_mouse_move(e.targetTouches[i])
      }
      e.preventDefault();
   }

   process_touchcancel = (e) => {
      console.log("process_touchcancel")
      this.end_drag(e)
      e.preventDefault();
   }

   process_touchend = (e) => {
      console.log("process_touchend")
      this.end_drag(e)
      e.preventDefault();
   }

   play_tone = (f, synth_index = MID_INDEX) => {
      const {synths} = this.state;
      const synth = synths[synth_index];
      if (!synth || f < 1) {
         return;
      }
      synth.triggerAttackRelease(f * BASE_FREQ, now(), 0.5)
   }

   start_play = (f, synth_index) => {
      const {synths} = this.state;
      const synth = synths[synth_index];
      if (!synth || f < 1) {
         return;
      }
      synth.triggerAttack(f * BASE_FREQ, now());
   }

   end_play = (f, synth_index) => {
      const {synths} = this.state;
      const synth = synths[synth_index];
      if (!synth || f < 1) {
         return;
      }
      synth.triggerRelease(now());
   }

   fill_canvas = (data) => {
      const {ctx} = this.state;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, INSTRUMENT_WIDTH, INSTRUMENT_HEIGHT);
      for (let img_x = 0; img_x < data.length; img_x++) {
         const column = data[img_x];
         for (let img_y = 0; img_y < column.length; img_y++) {
            const pixel = column[img_y];
            if (!pixel[1]) {
               ctx.fillStyle = 'white';
            } else {
               ctx.fillStyle = FractoUtil.fracto_pattern_color(pixel[0], pixel[1])
            }
            ctx.fillRect(img_x, column.length - img_y, 1, 1);
         }
      }
   }

   make_instrument = () => {
      const {fracto_values} = this.state;

      const url = `${FRACTO_PHP_URL_BASE}/generate_image.php?span=${fracto_values.scope}&focal_x=${fracto_values.focal_point.x}&focal_y=${fracto_values.focal_point.y}&aspect_ratio=${ONE_BY_PHI}&width_px=${INSTRUMENT_WIDTH}`;
      console.log("url", url);

      const that = this;
      fetch(url, {
         headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
         },
         method: 'GET',
         mode: 'cors'
      }).then(function (response) {
         if (response.body) {
            return response.json();
         }
         return ["fail"];
      }).then(function (json) {
         console.log("capture_image result", json);
         that.fill_canvas(json)
         that.setState({instrument: json})
      });
   }

   save_instrument = () => {
      const {instrument} = this.state;
      localStorage.setItem(`instrument`, JSON.stringify(instrument));
   }

   load_instrument = () => {
      const instrument_str = localStorage.getItem("instrument", null);
      if (instrument_str) {
         const instrument = JSON.parse(instrument_str);
         this.fill_canvas(instrument);
         this.setState({instrument: instrument})
      }
   }

   get_mouse_pos = (e) => {
      const {instrument, bounds_rect} = this.state;
      if (!instrument) {
         return false;
      }
      const img_x = Math.round(e.clientX - bounds_rect.left);
      const img_y = Math.round(INSTRUMENT_HEIGHT + e.clientY - bounds_rect.top);
      if (img_x <= MASK_RADIUS
         || img_x >= (INSTRUMENT_WIDTH - MASK_RADIUS)
         || img_y <= MASK_RADIUS
         || img_y >= (INSTRUMENT_HEIGHT - MASK_RADIUS)) {
         return false;
      }
      console.log(`${img_x},${img_y}`);
      return {img_x: img_x, img_y: img_y}
   }

   on_mouse_click = (e) => {
      const {instrument} = this.state;
      if (!instrument) {
         return;
      }
      const mouse_pos = this.get_mouse_pos(e);
      if (!mouse_pos) {
         return;
      }

      for (let col = 0; col < MASK_WIDTH; col++) {
         const column = instrument[mouse_pos.img_x - MASK_RADIUS + col];
         if (!column) {
            console.log("bad column");
            return;
         }
         const pixel_index_base = column.length - mouse_pos.img_y - MASK_RADIUS;
         for (let row = 0; row < MASK_WIDTH; row++) {
            let pixel_index = col * MASK_WIDTH + row;
            const pixel = column[pixel_index_base + row];
            this.play_tone(pixel[0], pixel_index);
         }
      }
   }

   on_mouse_move = (e, is_start = false) => {
      const {instrument, synths, in_drag} = this.state;
      if (!instrument || !(in_drag || is_start)) {
         return;
      }
      const mouse_pos = this.get_mouse_pos(e);
      if (!mouse_pos) {
         return;
      }

      for (let col = 0; col < MASK_WIDTH; col++) {
         const column = instrument[mouse_pos.img_x - MASK_RADIUS + col];
         if (!column) {
            console.log("bad column");
            return;
         }
         const pixel_index_base = column.length - mouse_pos.img_y - MASK_RADIUS;
         for (let row = 0; row < MASK_WIDTH; row++) {
            let pixel_index = col * MASK_WIDTH + row;
            const pixel = column[pixel_index_base + row];
            const freq = pixel[0] * BASE_FREQ;
            if (freq > 0) {
               if (is_start) {
                  synths[pixel_index].triggerAttack(freq);
               } else {
                  synths[pixel_index].set({
                     frequency: freq,
                  });
               }
            }
         }
      }
   }

   start_drag = (e) => {
      this.setState({in_drag: true});
      this.on_mouse_move(e, true)
   }

   end_drag = (e) => {
      const {synths} = this.state;
      this.setState({in_drag: false});
      for (let s = 0; s < SYNTH_COUNT; s++) {
         synths[s].triggerRelease()
      }
   }

   render() {
      const {fracto_values, canvas_ref, instrument, in_drag, wrapper_ref} = this.state;
      const tone_columns = [];
      for (let pow_2 = 0; pow_2 <= 5; pow_2++) {
         const start_range = Math.pow(2, pow_2);
         const end_range = Math.pow(2, pow_2 + 1);
         const sub_range = [];
         for (let tone = start_range; tone < end_range; tone++) {
            const inv_power = Math.pow(2, 5 - pow_2);
            const style = {
               height: `${24 * inv_power - 2}px`,
               backgroundColor: FractoUtil.fracto_pattern_color(tone, 100000)
            }
            const tone_button = <PatternTone
               onClick={e => this.play_tone(tone)}
               style={style}>
               {tone}
            </PatternTone>
            sub_range.push(tone_button)
         }
         const column = <ColumnWrapper>{sub_range}</ColumnWrapper>
         tone_columns.push(column);
      }
      const fracto_render = <FractoRender
         width_px={INSTRUMENT_WIDTH}
         aspect_ratio={ONE_BY_PHI}
         initial_params={fracto_values}
         on_param_change={values => this.setState({fracto_values: values})}
      />
      const make_instrument_button = <PlayButton
         onClick={e => this.make_instrument()}>make instrument</PlayButton>;
      const save_instrument_button = <PlayButton
         onClick={e => this.save_instrument()}>save instrument</PlayButton>;
      const load_instrument_button = <PlayButton
         onClick={e => this.load_instrument()}>load instrument</PlayButton>;

      const canvas_style = {
         width: `${INSTRUMENT_WIDTH}px`,
         height: `${INSTRUMENT_HEIGHT}px`
      }
      const instrument_canvas = <AppStyles.Block>
         <CanvasField
            ref={canvas_ref}
            style={canvas_style}
            width={`${INSTRUMENT_WIDTH}px`}
            height={`${INSTRUMENT_HEIGHT}px`}/>
      </AppStyles.Block>
      const go_drag = "sound on";
      return [
         <TonesWrapper>{tone_columns}</TonesWrapper>,
         <FractoWrapper
            ref={wrapper_ref}
            // onClick={e => this.on_mouse_click(e)}
            onMouseDown={e => this.start_drag(e)}
            onMouseUp={e => this.end_drag(e)}
            onMouseMove={e => this.on_mouse_move(e)}>
            {!instrument && fracto_render}
            {!instrument && make_instrument_button}
            {instrument && save_instrument_button}
            {load_instrument_button}
            {instrument_canvas}
            {in_drag && go_drag}
         </FractoWrapper>,
      ]
   }
}

export default FractoTone;
