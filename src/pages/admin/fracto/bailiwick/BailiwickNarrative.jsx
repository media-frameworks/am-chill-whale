import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";

import CoolModal from "common/cool/CoolModal";
import {render_modal_title} from "../FractoStyles";

const INPUT_TYPE_TEXT = "input_type_text";

const TEXT_ELEMENTS = [
   {
      prompt: "title",
      input_type : INPUT_TYPE_TEXT
   },
   {
      prompt: "description",
      input_type : INPUT_TYPE_TEXT
   }
]

const ActionLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin-right: 0.25rem;
`;

const TextInputRow = styled(AppStyles.Block)`
   margin: 0.25rem 1rem;
`;

export class BailiwickNarrative extends Component {

   static propTypes = {
      registry_filename: PropTypes.string.isRequired,
      bailiwick_data: PropTypes.string.isRequired,
      on_change: PropTypes.func.isRequired,
   }

   state = {
      definition_mode: false,
   };

   render() {
      const {definition_mode} = this.state;
      const define_text_link = <ActionLink
         onClick={e => this.setState({definition_mode: true})}>add/edit text</ActionLink>

      const modal_title = render_modal_title(`bailiwick narrative text`)
      const text_lines = TEXT_ELEMENTS.map(element => {
         return <TextInputRow>
            {`${element.prompt}: `}
         </TextInputRow>
      })
      const modal_contents = !definition_mode ? [] : [
         modal_title,
         text_lines
      ];

      const definition_modal = !definition_mode ? '' : <CoolModal
         width={"1200px"}
         contents={modal_contents}
         response={result => this.setState({definition_mode: false})}
      />

      return [
         define_text_link,
         definition_modal
      ]
   }
}

export default BailiwickNarrative;
