import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import Utils from "../../../common/Utils";
import StoreS3 from "../../../common/StoreS3";
import CoolButton from "../../../common/cool/CoolButton";
import CoolInputText from "../../../common/cool/CoolInputText";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowRight, faArrowDown, faCog} from '@fortawesome/free-solid-svg-icons'

import FractoRender from "../fracto/FractoRender";
import {ONE_BY_PHI} from "../../../common/math/constants";

import FractoneInstrument from "./FractoneInstrument";
import FractonePatternBar from "./FractonePatternBar"

const ZONE_MARGIN_PX = 16;
const INSTRUMENT_WIDTH_PX = 1600;
const ZONE_WIDTH_PX = 600;
const INSTRUMENT_HEIGHT_PX = Math.round(INSTRUMENT_WIDTH_PX * ONE_BY_PHI);
const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";

export const IMAGE_NAME = "panel_face.png";
export const INSTRUMENT_NAME = "instrument.json";

const ZoneWrapper = styled(AppStyles.InlineBlock)`
   margin-left: ${ZONE_MARGIN_PX}px;
   margin-top: ${ZONE_MARGIN_PX}px;
   padding: ${ZONE_MARGIN_PX / 2}px;
   border: 0.15rem solid #888888;
   border-radius: 0.25rem;
`;

const ButtonSpan = styled.span`
   font-size: 1rem;
`;

const SettingsWrapper = styled(AppStyles.Block)`
   margin-top: 0.5rem;
`;

const SettingRow = styled(AppStyles.Block)`
   margin-bottom: 0.25rem;
`;

const NamePrompt = styled.span`
   margin-right: 0.5rem;
   font-style: italic;
`;

export class FractonePageBuild extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.771}
      },
      zone_width: ZONE_WIDTH_PX,
      instrument: [[]],
      instrument_name: '',
      instrument_ref: React.createRef()
   };

   render_instrument = () => {
      const {fracto_values} = this.state;

      const url = `${FRACTO_PHP_URL_BASE}/generate_image.php?span=${fracto_values.scope}&focal_x=${fracto_values.focal_point.x}&focal_y=${fracto_values.focal_point.y}&aspect_ratio=${ONE_BY_PHI}&width_px=${INSTRUMENT_WIDTH_PX}`;

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
         const new_instrument = Object.assign({}, json);
         that.setState({
            instrument: new_instrument,
         })
      });
   }

   save_instrument = (and_test = false) => {
      const {instrument, instrument_name, instrument_ref, fracto_values} = this.state;
      const patterns = FractonePatternBar.fill_patterns(instrument)
      const s3_prefix = `fractone/instruments/inst_${Utils.random_id()}`;
      instrument_ref.current.save_image_async(IMAGE_NAME, s3_prefix, result => {
         console.log("save_image_async returns", result)
         const file_contents = JSON.stringify({
            name: instrument_name,
            fracto_values: fracto_values,
            size: {
               width: INSTRUMENT_WIDTH_PX,
               height: INSTRUMENT_HEIGHT_PX
            },
            image_url: `https://mikehallstudio.s3.amazonaws.com/${s3_prefix}/${IMAGE_NAME}`,
            patterns: patterns,
            instrument_data: instrument,
         });
         StoreS3.put_file_async(INSTRUMENT_NAME, file_contents, s3_prefix, result => {
            console.log("save_instrument result", result);
            if (and_test) {
               console.log("...and test")
            }
         });
      });
   }

   save_and_test = () => {
      console.log("save_and_test")
      this.save_instrument(true)
   }

   render() {
      const {fracto_values, zone_width, instrument, instrument_name, instrument_ref} = this.state;

      const button_style = {float: "right", margin: "0.25rem"}
      const arrow_right_icon = <FontAwesomeIcon icon={faArrowRight}/>;
      const button_content = <ButtonSpan>{"Render "}{arrow_right_icon}</ButtonSpan>
      const save_icon = <FontAwesomeIcon icon={faArrowDown}/>;
      const save_button_content = <ButtonSpan>{save_icon}{" Save"}</ButtonSpan>
      const save_and_test_icon = <FontAwesomeIcon icon={faCog}/>;
      const save_and_test_button_content = <ButtonSpan>{save_and_test_icon}{" Save and Test"}</ButtonSpan>

      const contents_width = zone_width - 2 * ZONE_MARGIN_PX - 1;
      const zone_style = {width: zone_width - 2 * ZONE_MARGIN_PX - 1};
      // const level = FractoImage.find_best_level(fracto_values.scope);
      const render_zone = <ZoneWrapper style={zone_style}>
         <FractoRender
            width_px={contents_width - 1}
            aspect_ratio={ONE_BY_PHI}
            initial_params={fracto_values}
            on_param_change={values => this.setState({fracto_values: values})}
         />
         {/*<FractoLocate level={level} fracto_values={fracto_values}/>*/}
         <CoolButton
            content={button_content}
            style={button_style}
            on_click={e => this.render_instrument()}
         />
      </ZoneWrapper>

      const inst_zone_style = {width: INSTRUMENT_WIDTH_PX + 1};
      const design_zone = <ZoneWrapper
         style={inst_zone_style}>
         <FractoneInstrument
            ref={instrument_ref}
            instrument_width={INSTRUMENT_WIDTH_PX}
            instrument_height={INSTRUMENT_HEIGHT_PX}
            instrument_data={instrument}/>
         <FractonePatternBar instrument_data={instrument}/>
         <SettingsWrapper>
            <SettingRow>
               <NamePrompt>Name:</NamePrompt>
               <CoolInputText
                  value={instrument_name}
                  placeholder={"use your words"}
                  callback={new_value => {
                     if (new_value !== instrument_name) {
                        this.setState({instrument_name: instrument_name})
                     }
                  }}
               />
            </SettingRow>
            <CoolButton
               content={save_and_test_button_content}
               style={button_style}
               on_click={e => this.save_and_test()}
            />
            <CoolButton
               content={save_button_content}
               style={button_style}
               on_click={e => this.save_instrument()}
            />
         </SettingsWrapper>
      </ZoneWrapper>

      return [render_zone, design_zone]
   }
}

export default FractonePageBuild;
