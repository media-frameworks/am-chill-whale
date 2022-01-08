import {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare, faMinusSquare} from '@fortawesome/free-regular-svg-icons';

import {AppStyles, AppColors} from "../../../app/AppImports";
import CoolModal from "../../../common/cool/CoolModal";
import all_images from "../../../data/fracto_cloudinary.json";

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

export class ModalImageSelect extends Component {

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
   };

   static get_image_data = (filename) => {
      return all_images.resources.find(r => r.filename === filename);
   }

   render_nav_bar = () => {
      const {page_no} = this.state;
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
      const {page_no} = this.state;
      const {response} = this.props;
      const start = page_no * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const contents = all_images.resources
         .sort((a, b) => a.filename > b.filename ? -1 : 1)
         .slice(start, end)
         .map(r => {
            return <AppStyles.InlineBlock
               onClick={e => response(r)}>
               <AppStyles.Block>
                  <img src={r.secure_url} width={"150px"}/>
               </AppStyles.Block>
               <AppStyles.Block>
                  {r.filename}
               </AppStyles.Block>
            </AppStyles.InlineBlock>
         });
      const nav_bar = this.render_nav_bar();
      return <CoolModal
         contents={[nav_bar, contents]}
         response={image_id => {
            this.setState({in_modal_select: false})
            response(image_id);
         }}
      />;
   }
}

export default ModalImageSelect;
