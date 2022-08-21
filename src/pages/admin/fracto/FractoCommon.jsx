import React from 'react';
import styled from "styled-components";

import Magnifier from "react-magnifier";

import {AppStyles} from "app/AppImports";
import CoolInputText from "common/cool/CoolInputText";
import CoolModal from "common/cool/CoolModal";
import CoolButton from "common/cool/CoolButton";

import FractoUtil from "./FractoUtil";
import {render_modal_title} from "./FractoStyles";

const MAGNIFIER_WIDTH_PX = 220;
const MAX_IMAGE_SIZE_PX = 650;

const NamePrompt = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   color: #666666;
   font-size: 1rem;
   margin: 1rem 0 0 2rem;
   width: 7.5rem;
   text-align: right;
`;

const NameInputWrapper = styled(AppStyles.InlineBlock)`
   font-size: 1rem;
   margin: 0.5rem 0 0 0.5rem;
`;

const DirPrompt = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   ${AppStyles.bold}
   font-size: 0.85rem;
   margin-left: 10.5rem;
   color: #999999;
`;

const DirName = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   font-size: 0.85rem;
   margin-left: 0.25rem;
`;

const PromptWrapper = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 1rem 0;
   color: #333333;
   font-size: 1.25rem;
`;

const PromptSpan = styled.span`
   ${AppStyles.bold}
`;

const ButtonsRow = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin-bottom: 1rem;
`;

const ButtonWrapper = styled(AppStyles.InlineBlock)`
   margin: 0 0.5rem;
`;

const ImageWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.centered}
   margin: 1rem;
`;

export const ENTITY_STATUS_PREP = "PREP";
export const ENTITY_STATUS_DRAFT = "DRAFT";
export const ENTITY_STATUS_REVIEW = "REVIEW";
export const ENTITY_STATUS_PUBLISHED = "PUBLISHED";

export class FractoCommon {

   static render_entity_name_input = (entity_name, entity_value, cb) => {
      const name_prompt = <NamePrompt>{entity_name} name:</NamePrompt>
      const name_input = <NameInputWrapper>
         <CoolInputText
            value={entity_value}
            callback={value => cb(value)}
            style_extra={{padding: "0.25rem 0.5rem", fontSize: "1.125rem", marginBottom: 0}}
            on_change={value => cb(value)}
         />
      </NameInputWrapper>

      const dir_prompt = <DirPrompt>{"folder name will be:"}</DirPrompt>
      const dir_name = <DirName>{FractoUtil.get_dirname_slug(entity_value)}</DirName>

      return [
         <AppStyles.Block>{[name_prompt, name_input]}</AppStyles.Block>,
         <AppStyles.Block>{[dir_prompt, dir_name]}</AppStyles.Block>
      ]
   }

   static modal_confirm = (prompt, options, response) => {
      const title = render_modal_title("please confirm");
      const buttons = options.map((option, i) => {
         return <ButtonWrapper>
            <CoolButton
               primary={i}
               content={option}
               on_click={e => response(i)}/>
         </ButtonWrapper>
      })
      return <CoolModal
         contents={[
            title,
            <PromptWrapper><PromptSpan>{prompt}</PromptSpan></PromptWrapper>,
            <ButtonsRow>{buttons}</ButtonsRow>
         ]}
         width={"25rem"}
         response={r => response(r)}
      />
   }

   static view_image = (dim, png_href, cb) => {
      const title = render_modal_title(`view image: ${dim}`);
      const image_width = dim < 1024 ? dim : MAX_IMAGE_SIZE_PX;
      const image = dim < 1024 ? <img
         src={png_href}
         alt={"no alt for you"}
         width={`${image_width}px`}
         style={{imageRendering: "pixelated"}}
      /> : <Magnifier
         src={png_href}
         alt={"no alt for you"}
         width={`${image_width}px`}
         zoomFactor={2.0}
         style={{imageRendering: "pixelated"}}
         mgWidth={MAGNIFIER_WIDTH_PX}
         mgHeight={MAGNIFIER_WIDTH_PX}
      />
      const wrapper_width = `${image_width + 60}px`;
      return <CoolModal
         contents={[
            title,
            <ImageWrapper>{image}</ImageWrapper>,
            <ButtonsRow>
               <CoolButton
                  primary={true}
                  content={"Done"}
                  on_click={() => cb()}/>
            </ButtonsRow>
         ]}
         width={wrapper_width}
         response={r => cb()}
      />
   }

}

export default FractoCommon
