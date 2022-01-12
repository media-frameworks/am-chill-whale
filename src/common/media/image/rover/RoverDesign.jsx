import {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles, AppColors} from "../../../../app/AppImports";
import ImageModalSelect from "./../ImageModalSelect";
import ImageRender from "./../ImageRender";
import CoolModal from "../../../cool/CoolModal";

const PHI = (1 + Math.sqrt(5.0)) / 2.0;

const DESIGNER_IMAGE_WIDTH_PX = 640;
const DESIGNER_META_WIDTH_PX = DESIGNER_IMAGE_WIDTH_PX * (PHI - 1.0);
const DESIGNER_MODAL_WIDTH = DESIGNER_IMAGE_WIDTH_PX * PHI + 40;

export const ROVER_ASPECT_RATIOS = [
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
   border-bottom: 0.125rem solid ${AppColors.HSL_COOL_BLUE};
   margin: 0.25rem;
   padding-bottom: 0.25rem;
   width: ${DESIGNER_META_WIDTH_PX}px;
`;

const StepsTitle = styled(AppStyles.Block)`
   ${AppStyles.uppercase}
   ${AppStyles.centered}
   ${AppStyles.bold}
   font-size: 1.25rem;
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
      image_data: {}
   };

   componentDidMount() {
      const {image_id} = this.props;
      const image_data = ImageModalSelect.get_image_data(image_id);
      if (image_data.filename) {
         this.setState({image_data: image_data});
      }
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {image_data} = this.state;
      const {image_id} = this.props;
      if (!image_data.filename) {
         this.get_image_data(image_id)
      }
   }

   meta_data = () => {
      const {image_data} = this.state;
      const meta_data = [
         {name: "filename", value: image_data.filename},
         {name: "dimensions", value: `${image_data.width}x${image_data.height}`},
         {name: "size", value: `${Math.floor(image_data.bytes / 1024)}KB`},
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

   steps_list = () => {
      return <MetaBlock>
         <StepsTitle>{"steps"}</StepsTitle>
      </MetaBlock>
   }

   designer_contents = () => {
      const {image_id} = this.props;
      return <AppStyles.Block>
         <AppStyles.InlineBlock>
            <ImageRender image_id={image_id} width_px={DESIGNER_IMAGE_WIDTH_PX}/>
         </AppStyles.InlineBlock>
         <AppStyles.InlineBlock>
            {this.meta_data()}
            {this.aspect_ratio()}
            {this.steps_list()}
         </AppStyles.InlineBlock>
      </AppStyles.Block>
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
