import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import Utils from "common/Utils";

import FractoContent from "./fracto/FractoContent";

// import fracto_capture from "data/fracto-capture.json";
import imgbb_list from "data/imgbb_list.json";

import Logo from "../res/images/logo.jpg"

const BRAND_TITLE = "FRACTO";
const BACKGROUND_IMAGES = imgbb_list;

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
   margin: 3.5rem auto 0;
   width: fit-content;
   padding: 0 1rem;
   z-index: 100;
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

const LetterBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.pointer}
   ${AppStyles.noselect}
   pointer-events: auto;
   font-size: 2.75rem;
   padding: 0.5rem 1rem;
   text-shadow: 0.25rem 0.25rem 0.75rem rgba(0,0,0,0.75);
   z-index: 101;
`;

const ContentWrapper = styled(AppStyles.Block)`
   ${AppStyles.absolute}
   top: 0;
   left: 10%;
   right: 10%;
   opacity: 0;
   background-color: white;
   border-radius: 0 0 0.5rem 0.5rem;
   border: 0.15rem solid white;
`;

const LogoBlock = styled.div`
    text-align: center;
`;

const LogoImage = styled.img`
    width: 143px;
    margin-top: 5rem;
    margin-bottom: 0.25rem;
`;

const BrandName = styled(AppStyles.Block)`
   ${AppStyles.uppercase}
   ${AppStyles.bold}
   letter-spacing: 0.45rem;
   color: #888888;
   font-size: 0.75rem;
   margin-bottom: 1rem;
`

export class PageFracto extends Component {

   static propTypes = {
      routes: PropTypes.array
   }

   state = {
      page_ref: React.createRef(),
      content_wrapper_ref: React.createRef(),
      header_bar_ref: React.createRef(),
      background_image: BACKGROUND_IMAGES[0],
      block_width_rem: 2.5,
      title_opacity: 0,
      show_content: false
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
      }, 8000);
   }

   toggle_show_content = () => {
      const {show_content, content_wrapper_ref, header_bar_ref} = this.state;
      const show = !show_content;
      this.setState({show_content: show})

      Utils.animate(content_wrapper_ref, 1500, show ? 0 : 1, show ? 1 : 0, (value, is_last) => {
         content_wrapper_ref.current.style.opacity = value * 0.90;
         header_bar_ref.current.style.opacity = (1.0 - value);
      });
   }

   render() {
      const {
         background_image, page_ref, content_wrapper_ref,header_bar_ref,
         block_width_rem, title_opacity, show_content
      } = this.state;
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
            opacity: title_opacity,
            color: show_content ? 'black' : 'white'
         }
         title_letters.push(<LetterBlock style={style}>{BRAND_TITLE[i]}</LetterBlock>);
      }

      const title = <TitleWrapper
         title={!show_content ? "click to learn more" : "click to view images"}
         onClick={e => this.toggle_show_content()}>
         {title_letters}
      </TitleWrapper>

      const branding = <LogoBlock>
         <LogoImage src={Logo}/>
         <BrandName>mike hall studio</BrandName>
      </LogoBlock>
      const content = [
         title,
         <ContentWrapper ref={content_wrapper_ref}>
            {title}
            <FractoContent />
            {branding}
         </ContentWrapper>,
      ];
      return <PageWrapper ref={page_ref} style={style}>
         <HeaderBar ref={header_bar_ref}>mike hall studio</HeaderBar>
         {content}
      </PageWrapper>
   }
}

export default PageFracto;
