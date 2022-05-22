import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "../app/AppStyles";
import Utils from "../common/Utils";

const BRAND_TITLE = "FRACTO";
const IMG_URL_BASE = "https://res.cloudinary.com/am-chill-whale/image/upload/v1652672428/fracto";

const BACKGROUND_IMAGES = [
   `${IMG_URL_BASE}/fracto-capture-054_dzlqm6.png`,
   `${IMG_URL_BASE}/fracto-capture-055_senwfm.png`,
   `${IMG_URL_BASE}/fracto-capture-094_jielkx.png`,
   `${IMG_URL_BASE}/fracto-capture-104_uxccqt.png`,
   `${IMG_URL_BASE}/fracto-capture-118_adnog2.png`,
   `${IMG_URL_BASE}/fracto-capture-131_qfljij.png`,
   `${IMG_URL_BASE}/fracto-capture-136_hwjac2.png`,
   `${IMG_URL_BASE}/fracto-capture-159_olblys.png`,
   `${IMG_URL_BASE}/fracto-capture-184_a865tv.png`,
   `${IMG_URL_BASE}/fracto-capture-187_sgic41.png`,
   `${IMG_URL_BASE}/fracto-capture-188_unjjoc.png`,
   `${IMG_URL_BASE}/fracto-capture-186_cjuue4.png`,
   `${IMG_URL_BASE}/fracto-capture-208_eylx85.png`,
   `${IMG_URL_BASE}/fracto-capture-210_k6gftj.png`,
   `${IMG_URL_BASE}/fracto-capture-205_llu4m9.png`,
   `${IMG_URL_BASE}/fracto-capture-212_q1if8a.png`,
   `${IMG_URL_BASE}/fracto-capture-213_kwpbkn.png`,
   `${IMG_URL_BASE}/fracto-capture-214_qsfshr.png`,
   `${IMG_URL_BASE}/fracto-capture-216_nea0cf.png`,
   `${IMG_URL_BASE}/fracto-capture-219_xzope5.png`,
   `${IMG_URL_BASE}/fracto-capture-221_g42acb.png`,
   `${IMG_URL_BASE}/fracto-capture-226_ttnfoh.png`,
   `${IMG_URL_BASE}/fracto-capture-229_dhgwrk.png`,
   `${IMG_URL_BASE}/fracto-capture-230_es3sxa.png`,
   `${IMG_URL_BASE}/fracto-capture-233_ekou1b.png`,
   `${IMG_URL_BASE}/fracto-capture-234_uvm2tt.png`,
   `${IMG_URL_BASE}/fracto-capture-251_xri4vn.png`,
   `${IMG_URL_BASE}/fracto-capture-261_kt5zwq.png`,
   `${IMG_URL_BASE}/fracto-capture-264_ur6rfj.png`,
];

const PageWrapper = styled.div`
   ${AppStyles.absolute}
   font-family: Arial;
   overflow: hidden;
   top: 0;
   left: 0;
   right: 0;
   height: 100%;
   transition: background-image 1.5s linear;
   background-repeat: no-repeat;
   background-position: center;
   image-rendering: pixelated;
   opacity: 0;
 `;

const TitleWrapper = styled.div`
   ${AppStyles.centered}
   color: white;
   font-size: 2.75rem;
   margin: 3.5rem auto;
   width: fit-content;
   padding: 0 1rem;
`;

const HeaderBar = styled.div`
   ${AppStyles.absolute}
   top: 0;
   left: 0;
   width: 100%;
   height: 1rem;
   border-bottom: 0.15rem solid white;
   opacity: 0.65;
   &: hover{
      opacity: 0.95;
   }
   transition: opacity 0.5s linear;
   color: white;
   padding: 0.25rem 0.5rem 0 1rem;
   letter-spacing: 0.75rem;
   text-transform: uppercase;
   font-size: 0.85rem;
   background-color: rgba(255, 255, 255, 0.35);
`;

const LetterBlock = styled.span`
   padding: 0.5rem 1rem;
`;

export class PageFracto extends Component {

   static propTypes = {
      routes: PropTypes.array
   }

   state = {
      page_ref: React.createRef(),
      background_image: BACKGROUND_IMAGES[0],
      block_width_rem: 2.5,
      title_opacity: 0
   };

   componentDidMount() {
      const {page_ref} = this.state;

      Utils.animate(page_ref, 3000, 0, 1, (value, is_last) => {
         page_ref.current.style.opacity = value;
      });
      Utils.animate(page_ref, 5000, 1.5, 2.5, (value, is_last) => {
         this.setState({block_width_rem: value})
      });
      Utils.animate(page_ref, 5000, 0, 1, (value, is_last) => {
         this.setState({title_opacity: value})
      });

      let image_index = 0;
      const backgrounds = Utils.shuffle(BACKGROUND_IMAGES);
      setInterval(() => {
         this.setState({background_image: backgrounds[image_index]})
         image_index = (image_index + 1) % backgrounds.length;
         const img = new Image();
         img.src = backgrounds[image_index];
      }, 5000);
   }

   render() {
      const {background_image, page_ref, block_width_rem, title_opacity} = this.state;
      const style = {
         backgroundImage: `url("${background_image}")`
      }

      const half_space_rem = block_width_rem / 2;
      const title_letters = []
      for (let i = 0; i < BRAND_TITLE.length; i++) {
         const style = {
            paddingLeft: i === 0 ? 0 : `${half_space_rem}rem`,
            paddingRight: i === BRAND_TITLE.length - 1 ? 0 : `${half_space_rem}rem`,
            width: `${block_width_rem}rem`,
            opacity: title_opacity
         }
         title_letters.push(<LetterBlock style={style}>{BRAND_TITLE[i]}</LetterBlock>);
      }

      return <PageWrapper ref={page_ref} style={style}>
         <HeaderBar>mike hall studio</HeaderBar>
         <TitleWrapper>{title_letters}</TitleWrapper>
      </PageWrapper>
   }
}

export default PageFracto;
