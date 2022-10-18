import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import FractoImage from "./FractoImage";
import FractoLocate from "./FractoLocate";
import FractoUtil from "./FractoUtil";
import {get_ideal_level} from "./FractoData";

const TitleBar = styled(AppStyles.Block)`
   background: linear-gradient(120deg, #999999, #eeeeee);
   height: 1.125rem;
   width: 100%;
   border-bottom: 0.15rem solid #666666;
`;

const TitleSpan = styled.span`
   ${AppStyles.uppercase}
   ${AppStyles.noselect}
   ${AppStyles.bold}
   font-size: 1.125rem;
   letter-spacing: 0.5rem;
   margin-left: 1rem;
   color: white;
   text-shadow: 0.01rem 0.01rem 0.2rem black;
`;

export const render_title_bar = (title) => <TitleBar><TitleSpan>{title}</TitleSpan></TitleBar>;

const MainLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin: 0.5rem 1rem 0;
`;

export const render_main_link = (text, cb) => <MainLink onClick={e => cb(e)}>{text}</MainLink>

const ModalTitleBar = styled(AppStyles.Block)`
   ${AppStyles.centered};
   ${AppStyles.uppercase};
   letter-spacing: 0.75rem;
   color: #888888;
   font-size: 0.85rem;
   border-bottom: 0.125rem solid ${AppColors.HSL_COOL_BLUE};
`;

export const render_modal_title = (title) => <ModalTitleBar>{title}</ModalTitleBar>

const LocateWrapper = styled(AppStyles.Block)`   
   ${AppStyles.noselect}
   border: 0.125rem solid #aaaaaa;
   width: auto;
   height: 5.25rem;
   border-radius: 0.25rem;
`;

export const render_fracto_locate = (fracto_values, width_px = 0) => {
   const best_level = !width_px ? FractoImage.find_best_level(fracto_values.scope) :
      get_ideal_level(width_px, fracto_values.scope)
   return <LocateWrapper>
      <FractoLocate level={best_level} fracto_values={fracto_values}/>
   </LocateWrapper>
}

export const render_fracto_locate_cb = (fracto_values, width_px, cb) => {
   const best_level = get_ideal_level(width_px, fracto_values.scope)
   return <LocateWrapper>
      <FractoLocate level={best_level} fracto_values={fracto_values} cb={values => cb(values)}/>
   </LocateWrapper>
}

const PatternBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   font-size: 1.25rem;
   border: 0.1rem solid #666666;
   border-radius: 0.25rem;
   color: white;
   padding: 0.125rem 0.125rem 0;
   line-height: 1rem;
`;

const FRACTO_COLOR_ITERATIONS = 200;

export const render_pattern_block = (pattern) => {
   const pattern_color = FractoUtil.fracto_pattern_color(pattern, FRACTO_COLOR_ITERATIONS);
   return <PatternBlock
      style={{backgroundColor: pattern_color}}>
      {pattern}
   </PatternBlock>
}