import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";

import StoreS3 from "../../../common/StoreS3";
import {IMAGE_NAME} from './FractonePageBuild';

const ImageWrapper = styled(AppStyles.InlineBlock)`
   cursor: pointer;
   margin-left: 0.25rem;
`;

export class FractoneSelector extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_selected: PropTypes.func.isRequired,
   }

   state = {
      instruments: []
   }

   componentDidMount() {
      StoreS3.list_files_async("instruments", "fractone", data => {
         const instruments = data.CommonPrefixes.map(p => p.Prefix.slice(0, -1));
         this.setState({instruments: instruments})
      })
   }

   render() {
      const {instruments} = this.state;
      const {width_px, on_selected} = this.props;
      const all_instruments = instruments.map(instrument => {
         return <ImageWrapper key={instrument} onClick={e => on_selected(instrument)}>
            <img
               alt={"this"}
               src={`https://mikehallstudio.s3.amazonaws.com/${instrument}/${IMAGE_NAME}`}
               width={width_px}
            />
         </ImageWrapper>
      })
      return all_instruments;
   }
}

export default FractoneSelector;
