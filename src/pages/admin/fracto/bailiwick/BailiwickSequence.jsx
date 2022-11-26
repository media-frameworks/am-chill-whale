import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import {CoolModal, CoolButton} from "common/cool/CoolImports";
import {render_fracto_navigation, render_modal_title} from "../FractoStyles";

const ActionLink = styled(AppStyles.Block)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin-right: 0.25rem;
`;

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 1rem 1rem 0;
`;

export class BailiwickSequence extends Component {

   constructor(props) {
      super(props);
      this.state.fracto_values = props.bailiwick_data.display_settings;
   }

   static propTypes = {
      registry_filename: PropTypes.string.isRequired,
      bailiwick_data: PropTypes.string.isRequired,
      on_change: PropTypes.func.isRequired,
   }

   state = {
      in_edit_sequence: false,
      fracto_values: {}
   }

   store_now = () => {
      console.log("store_now");
      this.setState({in_edit_sequence: false})
   }

   render() {
      const {in_edit_sequence, fracto_values} = this.state;

      const new_sequence_link = <ActionLink
         onClick={e => this.setState({in_edit_sequence: true})}>new sequence</ActionLink>

      let modal_contents = [];
      if (in_edit_sequence) {
         const modal_title = render_modal_title(`bailiwick sequence editor`)
         const fracto_nav = render_fracto_navigation(fracto_values, 512, [], ["inner contents"], values => {
            this.setState({fracto_values: values})
         });
         modal_contents = !in_edit_sequence ? [] : [
            modal_title,
            fracto_nav,
            <CenteredBlock>
               <CoolButton
                  style={{marginRight: "1rem"}}
                  content={"cancel"}
                  on_click={e => this.setState({in_edit_sequence: false})}/>
               <CoolButton
                  content={"store now"}
                  primary={1}
                  on_click={e => this.store_now()}/>
            </CenteredBlock>
         ];
      }

      const edit_sequence_modal = !in_edit_sequence ? '' : <CoolModal
         width={"1400px"}
         contents={modal_contents}
         response={result => this.setState({in_edit_sequence: false})}
         settings={{no_escape: true}}
      />

      return [
         new_sequence_link,
         edit_sequence_modal
      ];
   }

}

export default BailiwickSequence;
