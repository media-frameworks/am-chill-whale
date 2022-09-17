import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import Magnifier from "react-magnifier";

import {AppStyles} from "app/AppImports";
import CoolTabs from "common/cool/CoolTabs";

import FractoCommon from "../FractoCommon";
import CommonFiles from "../common/CommonFiles";
import CommonRenderings from "../common/CommonRenderings";
import CommonResources from "../common/CommonResources";

import BurrowStep from "./BurrowStep";
import BurrowSequence from "./BurrowSequence";

const S3_FRACTO_PREFIX = 'https://mikehallstudio.s3.amazonaws.com/fracto';

const MAGNIFIER_WIDTH_PX = 220;
const EDIT_IMAGE_WIDTH_PX = 550;
const IMAGE_SIZE_LIST = [128, 256, 512, 1024, 2048];
const IMAGE_SIZE_LIST_SMALLER = [128, 256, 512, 1024];

const EditBurrowWrapper = styled(AppStyles.Block)`
   margin: 0.5rem;
   padding: 0.5rem;
   border: 0.35rem double #aaaaaa;
   border-radius: 0.5rem;
`;

const BurrowTitleWrapper = styled(AppStyles.InlineBlock)`
   width: ${EDIT_IMAGE_WIDTH_PX}px;
   font-size: 1.5rem;
`;

const TabsWrapper = styled(AppStyles.InlineBlock)`
   margin-left: 1rem;
`;

const BurrowTitleSpan = styled.div`
   ${AppStyles.inline_block}
   ${AppStyles.uppercase}
   ${AppStyles.monospace}
   height: 2rem;
`;

const BurrowNameSpan = styled.div`
   ${AppStyles.inline_block}
   ${AppStyles.bold}
   padding-left: 0.5rem;
   height: 2rem;
`;

const ArchiveLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   ${AppStyles.pointer}
   color: maroon;
   font-size: 0.75rem;
   margin-left: 0.5rem;
   margin-top: 0.25rem;
   opacity: 0;
   &:hover {
      opacity: 1.0;
   }
`;

const StepInfoWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   ${AppStyles.underline}
   ${AppStyles.uppercase}
   font-size: 1.25rem;
   margin-left: 1rem;
   color: #666666;
   height: 2rem;
   vertical-align: bottom;
`;

const LinkSpan = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   font-size: 1rem;
   margin-left: 1rem;
`;

export class BurrowEdit extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      burrow_dirname: PropTypes.string.isRequired,
   }

   state = {
      burrow_data: {},
      in_archive_confirm: false,
      in_add_step: false,
      image_ref: React.createRef(),
      step_index: -1,
      step_data: {},
      steps: []
   }

   componentDidMount() {
      const {burrow_dirname} = this.props;
      this.load_resources(-1)
   }

   archive_study = () => {
      const {burrow_data} = this.state;
      console.log("confirmed archive_study", burrow_data.name);
      CommonFiles.load_registry_json("burrows", registry => {
         console.log("CommonFiles.load_registry_json returns", registry)
         delete (registry[burrow_data.name]);
         CommonFiles.save_registry_json("burrows", registry, result => {
            console.log(`CommonFiles.save_registry_json returns`, result);
         })
      })
   }

   load_resources = (new_step_index) => {
      const {burrow_data, step_index} = this.state;
      const {burrow_dirname} = this.props;
      const pad_name = String(new_step_index + 1).padStart(3, '0');
      const s3_folder_prefix = new_step_index < 0 ? `burrows/${burrow_dirname}` :
         `burrows/${burrow_dirname}/steps/${pad_name}`
      CommonFiles.load_registry_json(s3_folder_prefix, step_data => {
         console.log("CommonFiles.load_registry_json returns", step_data)
         const new_burrow_data = new_step_index < 0 ? step_data : burrow_data;
         this.setState({
            step_data: step_data,
            step_index: new_step_index < 0 && new_burrow_data.steps ? new_burrow_data.steps.length - 1 : new_step_index,
            burrow_data: new_burrow_data,
         })
      })
   }

   add_step = (e) => {
      const {step_data, image_ref, step_index} = this.state;

      const image_bounds = image_ref.current.getBoundingClientRect();
      const img_x = Math.round(e.clientX - image_bounds.left)
      const img_y = Math.round(e.clientY - image_bounds.top)
      console.log(`(${img_x},${img_y})`)

      const fracto_values = step_data.fracto_values;
      const increment = fracto_values.scope / EDIT_IMAGE_WIDTH_PX;
      const scope_by_2 = fracto_values.scope / 2;
      const left = fracto_values.focal_point.x - scope_by_2;
      const top = fracto_values.focal_point.y + scope_by_2;
      const new_step_values = {
         focal_point: {
            x: left + img_x * increment,
            y: top - img_y * increment,
         },
         scope: scope_by_2
      }
      this.setState({
         in_add_step: true,
         new_step_values: new_step_values
      })
   }

   read_steps = (cb) => {
      const {burrow_dirname} = this.props;
      const s3_folder_prefix = `burrows/${burrow_dirname}`;
      CommonResources.list_step_files_async(s3_folder_prefix, step_files => {
         console.log("CommonResources.list_step_files_async", s3_folder_prefix, step_files)
         cb(step_files);
      })
   }

   add_step_final = (r, new_step_s3_prefix, new_step_name, new_step_values) => {
      const {burrow_dirname} = this.props;
      const burrow_s3_prefix = `burrows/${burrow_dirname}`;

      let registry = Object.assign({}, r);
      registry["name"] = new_step_name;
      registry["fracto_values"] = new_step_values;
      CommonFiles.save_registry_json(new_step_s3_prefix, registry, result => {
         console.log("CommonFiles.save_registry_json", new_step_s3_prefix, registry, result)
      })

      CommonFiles.load_registry_json(burrow_s3_prefix, burrow_data => {
         console.log("CommonFiles.load_registry_json", burrow_s3_prefix, burrow_data)
         if (!burrow_data.steps) {
            burrow_data.steps = [];
         }
         burrow_data.steps.push({
            name: new_step_name,
            filename: `${burrow_s3_prefix}/steps/${new_step_name}`,
            registry: registry
         })
         CommonFiles.save_registry_json(burrow_s3_prefix, burrow_data, result => {
            console.log("CommonFiles.save_registry_json", burrow_s3_prefix, burrow_data, result)
            this.setState({
               burrow_data: burrow_data,
               step_data: registry,
               step_index: burrow_data.steps.length - 1,
               in_add_step: false,
            })
         })
      })
   }

   change_step = (amount) => {
      const {burrow_data, step_index} = this.state;
      const {burrow_dirname} = this.props;
      const new_step_index = step_index + amount;
      if (!burrow_data.steps) {
         return;
      }
      if (new_step_index < -1 || new_step_index > burrow_data.steps.length - 1) {
         return;
      }
      this.load_resources(new_step_index)
   }

   render() {
      const {
         burrow_data, step_data, in_archive_confirm, image_ref,
         in_add_step, new_step_values, step_index
      } = this.state;
      const {width_px, burrow_dirname} = this.props;

      const pad_name = String(step_index + 1).padStart(3, '0');
      const s3_folder_prefix = step_index < 0 ? `burrows/${burrow_dirname}` : `burrows/${burrow_dirname}/steps/${pad_name}`
      const main_image = !step_data["png_files"] ? "" : <AppStyles.InlineBlock ref={image_ref}>
         <Magnifier
            src={`${S3_FRACTO_PREFIX}/${s3_folder_prefix}/png/render_1024.png`}
            width={`${EDIT_IMAGE_WIDTH_PX}px`}
            zoomFactor={2.0}
            style={{imageRendering: "pixelated"}}
            mgWidth={MAGNIFIER_WIDTH_PX}
            mgHeight={MAGNIFIER_WIDTH_PX}
            onClick={e => this.add_step(e)}
         />
      </AppStyles.InlineBlock>

      const title = !burrow_data.name ? '' : <BurrowTitleWrapper>
         <BurrowTitleSpan>{"a burrow named "}</BurrowTitleSpan>
         <BurrowNameSpan>{burrow_data.name}</BurrowNameSpan>
         <ArchiveLink
            onClick={e => this.setState({in_archive_confirm: true})}>
            {"archive"}
         </ArchiveLink>
      </BurrowTitleWrapper>;
      const archive_confirm = !in_archive_confirm ? '' : FractoCommon.modal_confirm(`archive "${burrow_data.name}"?`, ["no", "yes"], r => {
         if (r === 1) {
            this.archive_study()
         }
         this.setState({in_archive_confirm: false})
      })

      const tab_data = [
         {
            label: "renderings",
            content: <CommonRenderings
               registry_data={step_data}
               fracto_values={step_data.fracto_values}
               s3_folder_prefix={s3_folder_prefix}
               size_list={IMAGE_SIZE_LIST}
               on_change={() => this.load_resources(-1)}/>
         },
         {
            label: "sequences",
            content: <BurrowSequence
               width_px={width_px}
               s3_folder_prefix={s3_folder_prefix}
               burrow_data={burrow_data}/>
         },
         {label: "patterns", content: "patterns content"},
         {label: "exhibits", content: "exhibits content"},
         {label: "commentary", content: "commentary content"},
      ]
      const all_tabs = <CoolTabs tab_data={tab_data}/>

      const new_step_index = !burrow_data.steps ? -1 : burrow_data.steps.length + 1;
      const new_step_name = !burrow_data.steps ? "001" : String(new_step_index).padStart(3, '0')
      const new_step_s3_prefix = `burrows/${burrow_dirname}/steps/${new_step_name}`;
      const add_step = !in_add_step ? '' : <BurrowStep
         on_response_modal={r => this.add_step_final(r, new_step_s3_prefix, new_step_name, new_step_values)}
         s3_folder_prefix={new_step_s3_prefix}
         fracto_values={new_step_values}
         image_sizes_px={IMAGE_SIZE_LIST_SMALLER}
         step_name={new_step_name}
      />

      const step_info = <StepInfoWrapper>
         {step_index < 0 ? "Start" : String(step_index + 1).padStart(3, '0')}
      </StepInfoWrapper>

      const next_link = <LinkSpan onClick={e => this.change_step(1)}>next</LinkSpan>
      const previous_link = <LinkSpan onClick={e => this.change_step(-1)}>previous</LinkSpan>

      return <EditBurrowWrapper>{[
         <AppStyles.Block>{[
            title,
            step_info,
            previous_link, next_link
         ]}</AppStyles.Block>,
         main_image,
         <TabsWrapper style={{width: `${tab_data.length * 8}rem`}}>{all_tabs}</TabsWrapper>,
         archive_confirm,
         add_step
      ]}</EditBurrowWrapper>
   }
}

export default BurrowEdit;
