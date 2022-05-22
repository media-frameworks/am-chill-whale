import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {Synth, now} from 'tone';

import {AppStyles} from "../../../app/AppImports";
import FractoUtil from "../fracto/FractoUtil";

const MARGIN_PX = 5;
const BLOCK_MARGIN_PX = 5;
const BASE_FREQ = 27.5;

const ToneBarWrapper = styled(AppStyles.Block)`
   margin: ${MARGIN_PX}px auto;
   background-color: white;
`;

const ToneBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.pointer}
   ${AppStyles.noselect}
   position: absolute;
   border: 2px solid #888888;
   border-radius: 3px;
`;

const PatternLabel = styled.span`
   padding: 2px;
   font-size: 0.75rem;
   color: white;
   text-shadow: 0.125rem 0.125rem 0.25rem rgba(0,0,0,0.95);
`;

export class StudioToneBar extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      height_px: PropTypes.number.isRequired,
      levels: PropTypes.number.isRequired
   }

   state = {synth: null};

   componentDidMount() {
      const synth = new Synth().toDestination();
      synth.set({
         volume: -5,
         oscillator: {
            type: "sine",
         }
      })
      this.setState({synth: synth})
   }

   play_tone = (pattern) => {
      const {synth} = this.state;
      const freq = BASE_FREQ * pattern;
      synth.set({
         oscillator: {
            volume: -3 - Math.log(pattern)
         }
      })
      synth.triggerAttackRelease(freq, now(), 0.25);
   }

   render_row = (row_index) => {
      const {width_px, height_px, levels} = this.props;
      const division_count = Math.pow(2, row_index);
      const actual_width = width_px - 2 * MARGIN_PX;
      const actual_height = height_px - MARGIN_PX;
      const block_width_px = actual_width / division_count;
      const block_height_px = actual_height / levels;
      const divisions = [];
      for (let i = 0; i < division_count; i++) {
         const pattern = division_count + i;
         const block_style = {
            top: `${MARGIN_PX + (actual_height * (levels - row_index - 1) / levels)}px`,
            left: `${MARGIN_PX + (actual_width * i / division_count)}px`,
            width: `${block_width_px - BLOCK_MARGIN_PX}px`,
            height: `${block_height_px - BLOCK_MARGIN_PX}px`,
            backgroundColor: FractoUtil.fracto_pattern_color(pattern, 100000),
         }
         const label = block_width_px < 16 || pattern > 99 ? '' : <PatternLabel>{pattern}</PatternLabel>;
         const block = <ToneBlock
            title={pattern}
            style={block_style}
            onClick={e => this.play_tone(pattern)}>
            {label}
         </ToneBlock>
         divisions.push(block);
      }
      return divisions;
   }

   render() {
      const {width_px, height_px, levels} = this.props;
      const full_width_px = width_px - 2 * MARGIN_PX;
      const full_height_px = height_px - 2 * MARGIN_PX;
      const wrapper_style = {
         width: `${full_width_px}px`,
         height: `${full_height_px}px`,
      };
      const all_rows = [];
      for (let i = 0; i < levels; i++) {
         all_rows.push(this.render_row(i))
      }
      return <ToneBarWrapper style={wrapper_style}>{all_rows}</ToneBarWrapper>
   }
}

export default StudioToneBar;
