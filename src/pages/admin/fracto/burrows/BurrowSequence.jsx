import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStepForward, faStepBackward} from '@fortawesome/free-solid-svg-icons';

import {AppStyles, AppColors} from "app/AppImports";
import {CoolModal, CoolButton} from "common/cool/CoolImports";

import FractoUtil from "../FractoUtil";
import CommonFiles from "../common/CommonFiles";

import {
   render_modal_title,
   render_main_link
} from "../FractoStyles";

const IMAGE_BLOCK_WIDTH_PX = 120;
const IMAGE_WIDTH_PX = 100;
const S3_URL_PREFIX = "https://mikehallstudio.s3.amazonaws.com/fracto";

const FRAMES_PER_STEP_256 = 256;
const FRAMES_PER_STEP_512 = 512;
const FRAMES_PER_STEP_768 = 768;
const FRAMES_PER_STEP_1024 = 1024;
const FRAMES_PER_STEP_2048 = 2048;
const FRAMES_PER_STEP_4096 = 4096;
const ALL_FRAMES_PER_STEPS = [
   FRAMES_PER_STEP_256,
   FRAMES_PER_STEP_512,
   FRAMES_PER_STEP_768,
   FRAMES_PER_STEP_1024,
   FRAMES_PER_STEP_2048,
   FRAMES_PER_STEP_4096,
];

const AllStepsWrapper = styled(AppStyles.Block)`
    max-height: 25rem;
    overflow-y: auto;
    margin: 1rem;
    text-align: center;
`;

const PromptWrapper = styled(AppStyles.Block)`
    margin: 1rem;
    text-align: center;
`;

const PromptSpan = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   ${AppStyles.noselect}
   line-height: 1.5rem;
   color: #888888;
   margin-right: 0.5rem;
   vertical-align: bottom;
`;

const SequenceNameSpan = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   ${AppStyles.noselect}
   height: 1.5rem;
   color: #333333;
   font-size: 1.25rem;
   vertical-align: bottom;
`;

const StepImageBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.noselect}
   ${AppStyles.centered}
   width: ${IMAGE_BLOCK_WIDTH_PX}px;
   height: ${IMAGE_BLOCK_WIDTH_PX + 16}px;
   padding: 0.5rem 0.25rem;
   border: 0.1rem solid #888888;
   border-radius: 0.25rem;
   margin: 0.5rem;
`;

const StepIconWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.pointer}
   color: #aaaaaa;
   margin: 0 0.5rem;
`;

const LeftStepIcon = styled(StepIconWrapper)`
   float: left;
`;

const RightStepIcon = styled(StepIconWrapper)`
   float: right;
`;

const StepNameSpan = styled(AppStyles.Block)`
   ${AppStyles.monospace}
   font-size: 1.25rem;
`;

const HorizontalLine = styled(AppStyles.Block)`
   ${AppStyles.centered}
   background-color: ${AppColors.HSL_COOL_BLUE};
   height: 0.25rem;
   width: 90%;
   margin: 0 auto;
`;

const ButtonWrapper = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin-bottom: 1rem;
`;

const FrameStepsWrapper = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin-top: 1rem;
`;

export class BurrowSequence extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      s3_folder_prefix: PropTypes.string.isRequired,
      burrow_data: PropTypes.object.isRequired,
   }

   state = {
      burrow_data: {},
      in_new_sequence: false,
      start_step: 0,
      end_step: 0,
      is_complete: true,
      frames_per_step:FRAMES_PER_STEP_256
   }

   componentDidMount() {
      const {burrow_data} = this.props;
      console.log("burrow_data", burrow_data);
      this.setState({end_step: burrow_data.steps.length - 1})
   }

   create_sequence = (draft_name) => {
      const {start_step, end_step, frames_per_step} = this.state;
      const {burrow_data} = this.props;
      console.log("end_step, start_step", end_step, start_step)
      CommonFiles.create_draft("sequences", draft_name, burrow_data.fracto_values, result => {
         console.log("CommonFiles.create_draft", draft_name, result);
         result.frames = [];
         const total_frames = frames_per_step * (end_step - start_step)
         const start_scope = burrow_data.steps[start_step].registry.fracto_values.scope;
         const end_scope = burrow_data.steps[end_step].registry.fracto_values.scope;
         for (let step_index = start_step; step_index < end_step; step_index++ ){
            for (let frame = 0; frame < frames_per_step; frame++) {
               const scope = start_scope * Math.pow(end_scope / start_scope, result.frames.length / total_frames);
               result.frames.push({
                  focal_point : burrow_data.steps[end_step].registry.fracto_values.focal_point,
                  scope: scope
               })
            }
         }
         console.log("result.frames", result.frames)
         const draft_dirname = FractoUtil.get_dirname_slug(draft_name)
         const s3_folder_prefix = `sequences/${draft_dirname}`
         CommonFiles.save_registry_json(s3_folder_prefix, result, response => {
            console.log("CommonFiles.save_registry_json", s3_folder_prefix, result, response)
            this.setState({in_new_sequence: false})
         })
      })
   }

   render() {
      const {in_new_sequence, start_step, end_step, is_complete,frames_per_step} = this.state;
      const {width_px, burrow_data} = this.props;
      const new_sequence_link = render_main_link("new sequence", e => this.setState({in_new_sequence: true}));
      const modal_title_bar = render_modal_title("new burrow sequence")

      const step_images = burrow_data.steps.map((step, i) => {
         const icon_start = <LeftStepIcon
            title={"start here"}
            onClick={e => this.setState({start_step: i < end_step ? i : start_step})}>
            <FontAwesomeIcon icon={faStepBackward}/>
         </LeftStepIcon>
         const icon_end = <RightStepIcon
            title={"end here"}
            onClick={e => this.setState({end_step: i > start_step ? i : end_step})}>
            <FontAwesomeIcon icon={faStepForward}/>
         </RightStepIcon>
         const block_style = {backgroundColor: i >= start_step && i <= end_step ? "lightblue" : "white"}
         return <StepImageBlock
            style={block_style}>
            {icon_start}{icon_end}
            <img
               width={`${IMAGE_WIDTH_PX}px`}
               src={`${S3_URL_PREFIX}/${step.filename}/png/render_128.png`}
               alt={"no alt for you"}/>
            <StepNameSpan>~{step.name}~</StepNameSpan>
         </StepImageBlock>
      })

      const burrow_dirname = FractoUtil.get_dirname_slug(burrow_data.name);
      const new_sequence_name = `${burrow_dirname}_${burrow_data.steps[start_step].name}_to_${burrow_data.steps[end_step].name}_${frames_per_step}fps`
      const sequence_prompt = [
         <PromptSpan>sequence name will be:</PromptSpan>,
         <SequenceNameSpan>{new_sequence_name}</SequenceNameSpan>
      ]

      const create_button = <CoolButton
         primary={1}
         content={is_complete ? "Create Sequence" : "CANCEL"}
         on_click={e => this.create_sequence(new_sequence_name)}/>

      const steps_buttons = ALL_FRAMES_PER_STEPS.map(steps => {
         const button_style = {margin: "0 0.25rem"}
         return <CoolButton
            style={button_style}
            primary={frames_per_step === steps ? 1 : 0}
            content={steps}
            on_click={e => this.setState({frames_per_step: steps})}/>
      })

      const modal_contents = !in_new_sequence ? '' : [
         modal_title_bar,
         <AllStepsWrapper>{step_images}</AllStepsWrapper>,
         <HorizontalLine />,
         <FrameStepsWrapper>steps per frame: {steps_buttons}</FrameStepsWrapper>,
         <PromptWrapper>{sequence_prompt}</PromptWrapper>,
         <ButtonWrapper>{create_button}</ButtonWrapper>
      ];
      const new_sequence_modal = !in_new_sequence ? '' : <CoolModal
         width={`${width_px - 500}px`}
         contents={modal_contents}
         response={r => this.setState({in_new_sequence: false})}
      />

      return [
         new_sequence_link,
         new_sequence_modal
      ]
   }
}

export default BurrowSequence;
