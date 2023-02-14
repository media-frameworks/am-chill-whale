import {Component} from 'react';
import PropTypes from 'prop-types'
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare, faMinusSquare} from '@fortawesome/free-regular-svg-icons';

import {AppStyles, AppColors} from "../../../app/AppImports";
import CoolModal from "../../../common/cool/CoolModal";
import ImageRender from "./ImageRender";

import logistic_images from "../../../data/logistic.json";
import moire_images from "../../../data/moire.json";
import inner_fracto_images from "../../../data/inner-fracto.json";
import outer_fracto_images from "../../../data/outer-fracto.json";

const PAGE_SIZE = 50;

const NavigationBar = styled(AppStyles.Block)`
   ${AppStyles.centered}
   border-bottom: 0.125rem solid ${AppColors.HSL_COOL_BLUE};
   font-size: 1.125rem;
   font-weight: bold;
   padding-bottom: 0.25rem;
   margin-bottom: 1rem;
`;

const IconWrapper = styled(AppStyles.InlineBlock)`
   margin: 0 0.5rem;
   color: #666666;
   opacity: 0.35;
   margin-top: 0.0625rem;
`;

const SelectImagesWrapper = styled(AppStyles.Block)`
   overflow-y: scroll;
   height: 40rem;
`;

export class ImageModalSelect extends Component {

   static propTypes = {
      response: PropTypes.func.isRequired,
   }

   static defaultProps = {
      image_id: 0,
      caption: '',
   }

   state = {
      in_modal_select: false,
      page_no: 0,
      all_images: outer_fracto_images,
   };

   static image_map = {};

   static get_image_data = (filename) => {
      if (!filename) {
         return {};
      }
      if (Object.keys(ImageModalSelect.image_map).length === 0) {
         logistic_images.resources.forEach(data => ImageModalSelect.image_map[data.filename] = data);
         moire_images.resources.forEach(data => ImageModalSelect.image_map[data.filename] = data);
         inner_fracto_images.resources.forEach(data => ImageModalSelect.image_map[data.filename] = data);
         outer_fracto_images.resources.forEach(data => ImageModalSelect.image_map[data.filename] = data);
         console.log(ImageModalSelect.image_map);
      }
      if (!ImageModalSelect.image_map[filename]) {
         return {};
      }
      return ImageModalSelect.image_map[filename];
   }

   render_nav_bar = () => {
      const {page_no, all_images} = this.state;
      const total_pages = 1 + Math.floor(all_images.resources.length / PAGE_SIZE);
      const page_info = `${page_no + 1} of ${total_pages}`;
      const minus_enabled = page_no > 0;
      const plus_enabled = page_no < total_pages - 1;
      const enabled_style = {cursor: "pointer", opacity: 1};
      const plus_icon = <IconWrapper
         onClick={e => this.setState({page_no: page_no + (plus_enabled ? 1 : 0)})}
         style={plus_enabled ? enabled_style : {}}>
         <FontAwesomeIcon icon={faPlusSquare}/>
      </IconWrapper>
      const minus_icon = <IconWrapper
         onClick={e => this.setState({page_no: page_no - (minus_enabled ? 1 : 0)})}
         style={minus_enabled ? enabled_style : {}}>
         <FontAwesomeIcon icon={faMinusSquare}/>
      </IconWrapper>
      return <NavigationBar>
         {[minus_icon, page_info, plus_icon]}
      </NavigationBar>
   }

   render() {
      const {page_no, all_images} = this.state;
      const {response} = this.props;
      const start = page_no * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const images = all_images.resources
         .sort((a, b) => a.filename > b.filename ? -1 : 1)
         .slice(start, end)
         .map(r => {
            return <AppStyles.InlineBlock
               key={`select_${r.filename}`}
               onClick={e => response(r)}>
               <AppStyles.Block>
                  <ImageRender image_id={r.filename} width_px={"150"}/>
               </AppStyles.Block>
               <AppStyles.Block>
                  {r.filename}
               </AppStyles.Block>
            </AppStyles.InlineBlock>
         });
      const nav_bar = this.render_nav_bar();
      const contents = <SelectImagesWrapper key={`page_no_${page_no}`}>{images}</SelectImagesWrapper>
      return <CoolModal
         contents={[nav_bar, contents]}
         response={image_id => {
            this.setState({in_modal_select: false})
            response(image_id);
         }}
      />;
   }
}

export default ImageModalSelect;
