import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";

import {render_title_bar} from "../FractoStyles";
import CommonFiles from "../common/CommonFiles";

import SequenceEdit from "./SequenceEdit";

const SequenceWrapper = styled(AppStyles.Block)`
   ${AppStyles.noselect}
   margin: 1rem 2rem;
`;

const SequenceRow = styled(AppStyles.Block)`
   padding: 0.25rem 1rem;
   border-radius: 0.5rem;
   &:hover {
      background-color: #eeeeee;
   }
`;

const SequenceNameSpan = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   ${AppStyles.pointer}
   font-size: 1.25rem;   
   color: #888888;
   &:hover {
      ${AppStyles.underline}
   }
`;

export class SequenceCollection extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      sequences_registry: {},
      selected_sequence: -1,
   }

   componentDidMount() {
      this.load_registry();
   }

   load_registry = () => {
      CommonFiles.load_registry_json("sequences", registry => {
         console.log("CommonFiles.load_registry_json", "sequences", registry)
         this.setState({sequences_registry: registry})
      });
   }

   render() {
      const {sequences_registry, selected_sequence} = this.state;
      const {width_px} = this.props;

      const title_bar = render_title_bar("fractal sequencer");

      const sequences = Object.keys(sequences_registry)
         .sort()
         .map(sequence_name => {
            const sequence_editor = sequence_name !== selected_sequence ? '' : <SequenceEdit
               width_px={width_px}
               sequence_name={sequence_name}
               on_change={() => this.load_registry()}
            />
            return <SequenceRow>
               <SequenceNameSpan
                  onClick={e => this.setState({selected_sequence: sequence_name === selected_sequence ? -1 : sequence_name})}>
                  {sequence_name}
               </SequenceNameSpan>
               <AppStyles.Block>{sequence_editor}</AppStyles.Block>
            </SequenceRow>
         });

      const wrapper_syle = {width: `${width_px - 70}px`}
      return [
         title_bar,
         <SequenceWrapper
            style={wrapper_syle}>
            {sequences}
         </SequenceWrapper>
      ]
   }
}

export default SequenceCollection;
