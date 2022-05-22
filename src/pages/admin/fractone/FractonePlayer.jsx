import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {
   Synth,
   now
} from 'tone';

import {AppStyles} from "../../../app/AppImports";
import StoreS3 from "../../../common/StoreS3";
import {INSTRUMENT_NAME, IMAGE_NAME} from './FractonePageBuild';
import FractoneUtil from './FractoneUtil';

const MASK_RADIUS = 3;
const MASK_WIDTH = 2 * MASK_RADIUS + 1;
const SYNTH_COUNT = 64;
const BASE_FREQ = 27.5;
const OSCILLATOR_DEFAULT = {oscillator: {type: "sine"}}

const FractoWrapper = styled(AppStyles.Block)`
   margin : 0 auto;
`;

export class FractonePlayer extends Component {

   static propTypes = {
      prefix: PropTypes.string.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
      wrapper_ref: React.createRef(),
      synths: [],
      instrument: {},
      ready: false,
      in_drag: false,
   };

   componentDidMount() {
      const {wrapper_ref} = this.state;
      this.load_instrument();
      const wrapper = wrapper_ref.current;
      if (wrapper) {
         wrapper.addEventListener('touchstart', this.process_touchstart, false);
         wrapper.addEventListener('touchmove', this.process_touchmove, false);
         wrapper.addEventListener('touchcancel', this.process_touchcancel, false);
         wrapper.addEventListener('touchend', this.process_touchend, false);
      }
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {prefix} = this.props;
      if (prevProps.prefix !== prefix) {
         this.load_instrument();
      }
   }

   load_instrument = () => {
      const {prefix} = this.props;
      StoreS3.get_file_async(INSTRUMENT_NAME, prefix, str_data => {
         const instrument = JSON.parse(str_data);
         console.log("FractonePageLoad instrument", instrument);
         this.setState({instrument: instrument, ready: true});
         this.build_synths(instrument);
      })
   }

   build_synths = (instrument) => {
      if (!instrument) {
         console.log("build_synths no instrumnet", instrument)
         return;
      }
      const patterns_profile = Object.keys(instrument.patterns).map(key => {
         const pattern = key.replaceAll('_', '');
         return {pattern: parseInt(pattern), count: parseInt(instrument.patterns[key])}
      })
         .filter(obj => obj.pattern > 0)
         .sort((a, b) => b.count - a.count)
         .slice(0, SYNTH_COUNT)

      const synths = patterns_profile.map((profile, profile_index) => {
         const synth = new Synth().toDestination();
         synth.set(OSCILLATOR_DEFAULT);
         return {
            pattern: profile.pattern,
            synth: synth,
            profile_index: profile_index
         }
      })
      this.setState({synths: synths});
   }

   process_touchstart = (e) => {
      console.log("process_touchstart")
      for (let i = 0; i < e.targetTouches.length; i++) {
         this.start_drag(e.targetTouches[i])
      }
      e.preventDefault();
   }

   process_touchmove = (e) => {
      console.log("process_touchmove")
      for (let i = 0; i < e.targetTouches.length; i++) {
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

   get_mouse_pos = (e) => {
      const {instrument, wrapper_ref} = this.state;
      if (!instrument || !instrument.size) {
         console.log("get_mouse_pos no instrument", instrument)
         return false;
      }
      const wrapper = wrapper_ref.current;
      if (!wrapper) {
         return false;
      }
      const bounds_rect = wrapper.getBoundingClientRect();

      const img_x = Math.round(e.clientX - bounds_rect.left);
      const img_y = Math.round(e.clientY - bounds_rect.top);
      if (img_x <= MASK_RADIUS
         || img_x >= (bounds_rect.width - MASK_RADIUS)
         || img_y <= MASK_RADIUS
         || img_y >= (bounds_rect.height - MASK_RADIUS)) {
         return false;
      }
      const scaled_x = Math.round(img_x * instrument.size.width / bounds_rect.width);
      const scaled_y = Math.round(img_y * instrument.size.height / bounds_rect.height);

      // console.log(`${img_x} -> ${scaled_x},${img_y} -> ${scaled_y}`);
      return {img_x: scaled_x, img_y: scaled_y}
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
      if (is_start) {
         for (let synth_index = 0; synth_index < SYNTH_COUNT; synth_index++) {
            synths[synth_index].synth.set({volume: -25});
         }
      }
      const pattern_buckets = Array(SYNTH_COUNT);
      for (let profile_index = 0; profile_index < SYNTH_COUNT; profile_index++) {
         pattern_buckets[profile_index] = 0;
      }

      const tone_mask = FractoneUtil.create_mask(MASK_RADIUS);
      for (let col = 0; col < MASK_WIDTH; col++) {
         const column = instrument.instrument_data[mouse_pos.img_x - MASK_RADIUS + col];
         if (!column) {
            console.log("bad column");
            return;
         }
         const pixel_index_base = column.length - mouse_pos.img_y - MASK_RADIUS;

         for (let row = 0; row < MASK_WIDTH; row++) {
            const pixel = column[pixel_index_base + row];
            const synth = synths.find(synth => synth.pattern === pixel[0])
            if (!synth) {
               console.log("bad synth");
               continue
            }
            const profile_index = synth.profile_index;
            const mask_index = col * MASK_WIDTH + row;
            pattern_buckets[profile_index] += tone_mask[mask_index];
         }
      }

      let max_bucket_value = 0;
      for (let profile_index = 0; profile_index < SYNTH_COUNT; profile_index++) {
         if (pattern_buckets[profile_index] > max_bucket_value) {
            max_bucket_value = pattern_buckets[profile_index];
         }
      }
      if (!max_bucket_value) {
         return;
      }

      const active_synths = synths.filter(synth => pattern_buckets[synth.profile_index] > 0)
      active_synths.forEach(active => {
         const synth = active.synth;
         const pattern = active.pattern;
         const profile_index = active.profile_index;
         const freq = BASE_FREQ * pattern;
         const volume = -7 - (5 * (1 - (pattern_buckets[profile_index] / max_bucket_value)));
         synth.set({
            volume: volume - Math.log2(pattern),
            frequency: freq,
            oscillator: {
               volume: volume - Math.log2(pattern),
               frequency: freq,
            }
         })
         if (is_start) {
            synth.triggerAttack(freq, now(), 1);
         }
      })

      const inactive_synths = synths.filter(synth => pattern_buckets[synth.profile_index] === 0)
      inactive_synths.forEach(inactive => {
         const synth = inactive.synth;
         const pattern = inactive.pattern;
         const freq = BASE_FREQ * pattern;
         synth.set({
            volume: -100,
            frequency: freq,
            oscillator: {
               volume: -100,
               frequency: freq,
            }
         })
         if (is_start) {
            synth.triggerAttack(freq, now(), 1);
         }
      });
   }

   start_drag = (e) => {
      const {in_drag} = this.state;
      if (in_drag) {
         return
      }
      this.setState({in_drag: true});
      this.on_mouse_move(e, true)
   }

   end_drag = (e) => {
      const {synths} = this.state;
      this.setState({in_drag: false});
      for (let s = 0; s < SYNTH_COUNT; s++) {
         synths[s].synth.triggerRelease()
      }
   }

   render() {
      const {wrapper_ref} = this.state;
      const {prefix, width_px} = this.props;

      const img_style = {
         imageRendering: "pixelated"
      }
      const wrapper_style = {width: width_px}
      return <FractoWrapper
         ref={wrapper_ref}
         style={wrapper_style}
         onMouseDown={e => this.start_drag(e)}
         onMouseUp={e => this.end_drag(e)}
         onMouseMove={e => this.on_mouse_move(e)}>
         <img
            alt={"this"}
            width={width_px}
            style={img_style}
            src={`https://mikehallstudio.s3.amazonaws.com/${prefix}/${IMAGE_NAME}`}
            draggable="false"
         />
      </FractoWrapper>
   }
}

export default FractonePlayer;
