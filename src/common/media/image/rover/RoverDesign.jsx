import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../../app/AppImports";
import ImageModalSelect from "./../ImageModalSelect";
import ImageRender from "./../ImageRender";
import CoolModal from "../../../cool/CoolModal";
import RoverDesignSteps from "./RoverDesignSteps";
import RoverDesignPreview from "./RoverDesignPreview";
import RoverDesignTransport from "./RoverDesignTransport";

const PHI = (1 + Math.sqrt(5.0)) / 2.0;

const DESIGNER_IMAGE_WIDTH_PX = 640;
export const DESIGNER_META_WIDTH_PX = DESIGNER_IMAGE_WIDTH_PX * (PHI - 1.0);
const DESIGNER_MODAL_WIDTH = DESIGNER_IMAGE_WIDTH_PX * PHI + 40;

export const ROVER_ASPECT_RATIOS = [
   {label: '1:1', value: 1, help: 'Square'},
   {label: '3:2', value: 3 / 2, help: 'DSLR camera, smartphones'},
   {label: '4:3', value: 4 / 3, help: 'SDTV/video, computer displays'},
   {label: '5:4', value: 5 / 4, help: 'Computer displays'},
   {label: '16:10', value: 16 / 10, help: 'Widescreens, smartphones'},
   {label: '16:9', value: 16 / 9, help: 'HDTV widescreen, smartphones'},
   {label: '1.85:1', value: 1.85, help: 'Cinema film'},
   {label: '1.618...', value: PHI, help: 'Golden ratio (horizontal)'},
   {label: '0.618...', value: PHI - 1.0, help: 'Golden ratio (vertical)'},
   {label: '2.35:1', value: 2.35, help: 'Cinemascope'},
   {label: '9:16', value: 9 / 16, help: 'Vertical smartphones'},
];

const MetaName = styled.span`
   color: #666666;   
   font-size: 0.85rem;
   font-weight: bold;
   padding: 0 0.25rem;
`;

const MetaValue = styled.span`
   ${AppStyles.monospace}
   color: #666666;   
   font-size: 0.85rem;
   font-weight: bold;
   padding: 0;
`;

const MetaBlock = styled(AppStyles.Block)`
   margin: 0.25rem;
   padding-bottom: 0.25rem;
   width: ${DESIGNER_META_WIDTH_PX}px;
`;

const StepFrame = styled.div`
   position: absolute;
   border: 0.25rem solid red;
`;

const SectionTitle = styled(AppStyles.Block)`
   ${AppStyles.uppercase}
   ${AppStyles.centered}
   ${AppStyles.bold}
   font-size: 0.85rem;
   margin: 0.25rem 0.25rem;
   padding-top: 0.25rem;
   border-top: 0.125rem solid ${AppColors.HSL_COOL_BLUE};
`;

export class RoverDesign extends Component {

   static propTypes = {
      image_id: PropTypes.string.isRequired,
      steps_list: PropTypes.array.isRequired,
      aspect_ratio: PropTypes.number.isRequired,
      on_update_props: PropTypes.func.isRequired,
      on_response_modal: PropTypes.func.isRequired,
   }

   state = {
      image_data: {},
      image_ref: React.createRef(),
      selected_step_index: 0,
      shuttle_position: 0,
   };

   componentDidMount() {
      const {image_id} = this.props;
      const image_data = ImageModalSelect.get_image_data(image_id);
      if (image_data.filename) {
         this.setState({image_data: image_data});
      }
   }

   meta_data = () => {
      const {image_data} = this.state;
      const meta_data = [
         {name: "filename", value: image_data.filename},
         {
            name: "dimensions",
            value: `${image_data.width}x${image_data.height} (${Math.floor(image_data.bytes / 1024)}KB)`
         },
      ].map(line => {
         return <AppStyles.Block key={`block_${line.name}`}>
            <MetaName>{`${line.name}:`}</MetaName>
            <MetaValue>{line.value}</MetaValue>
         </AppStyles.Block>
      })
      return <MetaBlock>{meta_data}</MetaBlock>
   }

   select_aspect_ratio = (e) => {
      const {on_update_props} = this.props;
      on_update_props({aspect_ratio: Number.parseFloat(e.target.value)});
   }

   aspect_ratio = () => {
      const {aspect_ratio} = this.props;
      const options = ROVER_ASPECT_RATIOS
         .sort((a, b) => a.value < b.value ? -1 : 1)
         .map((ratio, index) => {
            return <option key={`option_${index}`} value={ratio.value}>
               {`${ratio.label} (${ratio.help})`}
            </option>
         });
      return <MetaBlock>
         <MetaName>{"aspect ratio:"}</MetaName>
         <select
            value={aspect_ratio}
            onChange={e => this.select_aspect_ratio(e)}>
            {options}
         </select>
      </MetaBlock>
   }

   render_frames = () => {
      const {selected_step_index, image_ref} = this.state;
      const {steps_list, aspect_ratio} = this.props;
      const current_image = image_ref.current;
      if (!current_image) {
         return;
      }
      const image_rect = current_image.getBoundingClientRect();

      const step_frames = steps_list.map((frame, frame_index) => {
         const frame_center_x_px = image_rect.x + frame.center_x * image_rect.width;
         const frame_center_y_px = image_rect.y + frame.center_y * image_rect.height;
         const frame_width_px = frame.width * image_rect.width;
         const frame_height_px = frame_width_px / aspect_ratio;
         const frame_extra_style = {
            top: frame_center_y_px - frame_height_px / 2,
            left: frame_center_x_px - frame_width_px / 2,
            width: frame_width_px,
            height: frame_height_px,
            opacity: frame_index === selected_step_index ? 0.65 : 0.25
         }
         return <StepFrame key={`frame_${frame_index}`} style={frame_extra_style}/>
      });
      return step_frames;
   }

   designer_contents = () => {
      const {selected_step_index, image_ref, shuttle_position} = this.state;
      const {image_id, steps_list, aspect_ratio, on_update_props} = this.props;
      const sections = [
         {title: "file", rendered: this.meta_data()},
         {title: "settings", rendered: this.aspect_ratio()},
         {
            title: "steps",
            rendered: <RoverDesignSteps
               steps_list={steps_list}
               selected_step_index={selected_step_index}
               on_update_props={on_update_props}
               on_selected={step_index => this.setState({
                  selected_step_index: step_index,
                  shuttle_position: step_index
               })}
            />
         },
         {
            title: "preview",
            rendered: <RoverDesignPreview
               image_id={image_id}
               image_ref={image_ref}
               step_values={steps_list[selected_step_index]}
               aspect_ratio={aspect_ratio}/>
         },
      ];
      const all_sections = sections.map((section, section_index) => {
         return [
            <SectionTitle>{section.title}</SectionTitle>,
            section.rendered
         ]
      });
      return [
         <AppStyles.Block>
            <AppStyles.InlineBlock>
               <ImageRender
                  image_ref={image_ref}
                  image_id={image_id}
                  width_px={DESIGNER_IMAGE_WIDTH_PX}/>
            </AppStyles.InlineBlock>
            <AppStyles.InlineBlock>
               {all_sections}
            </AppStyles.InlineBlock>`
         </AppStyles.Block>,
         <RoverDesignTransport
            steps_list={steps_list}
            shuttle_position={shuttle_position}
            on_position_change={position => this.setState({shuttle_position: position})}
         />,
         this.render_frames()
      ]
   }

   render() {
      const {image_id, on_response_modal} = this.props;
      const designer_contents = this.designer_contents();
      return <CoolModal
         key={`CoolModal_${image_id}`}
         width={`${DESIGNER_MODAL_WIDTH}px`} contents={designer_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default RoverDesign;
