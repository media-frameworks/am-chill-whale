import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import StoreS3 from "common/StoreS3";
import CoolImage from "common/cool/CoolImage";
import CoolTabs from "common/cool/CoolTabs";
import CoolButton from "common/cool/CoolButton";

import FractoUtil from "../FractoUtil";

import BailiwickPoints from "./BailiwickPoints";
import BailiwickSeparations from "./BailiwickSeparations";
import BailiwickNarrative from "./BailiwickNarrative";
import BailiwickSequence from "./BailiwickSequence";

const FRACTO_S3_URL_BASE = "https://mikehallstudio.s3.amazonaws.com/fracto";

const TabsWrapper = styled(AppStyles.InlineBlock)`
   margin-left: 1rem;
`;

const ImageWrapper = styled(AppStyles.InlineBlock)`
   width: 512px;
   height: 512px;
`;
const ButtonWrapper = styled(AppStyles.Block)`
   margin-top: 0.5rem;
`;

export class BailiwickDraft extends Component {

   static propTypes = {
      registry_filename: PropTypes.string.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
      bailiwick_data: {},
      loading: true,
      image_ref: React.createRef(),
      show_points: false
   }

   componentDidMount() {
      this.load_resources();
   }

   load_resources = () => {
      const {registry_filename} = this.props;
      const filename = `bailiwicks/${registry_filename}`;
      StoreS3.get_file_async(filename, "fracto", result => {
         console.log("StoreS3.get_file_async", filename, "fracto", result)
         const bailiwick_data = JSON.parse(result);
         this.setState({
            bailiwick_data: bailiwick_data,
            loading: false,
         })
      })
   }

   render() {
      const {bailiwick_data, loading, image_ref, show_points} = this.state;
      const {registry_filename} = this.props;

      console.log("bailiwick_data", bailiwick_data)
      const image_2048 = loading ? {} : bailiwick_data.png_files.find(f => f.size === 2048)
      const main_image = loading ? '' : <CoolImage
         src={`${FRACTO_S3_URL_BASE}/${image_2048.filename}`}
         width_px={512}
         zoom_factor={2.0}
      />
      const bailiwick_draft_tabs = [
         {
            label: "points of interest",
            content: <BailiwickPoints
               registry_filename={registry_filename}
               bailiwick_data={bailiwick_data}
               on_change={(bailiwick_data) => this.setState({bailiwick_data: bailiwick_data})}
            />
         },
         {
            label: "separations",
            content: <BailiwickSeparations
               registry_filename={registry_filename}
               bailiwick_data={bailiwick_data}
               on_change={(bailiwick_data) => this.setState({bailiwick_data: bailiwick_data})}
            />
         },
         {
            label: "sequences",
            content: <BailiwickSequence
               registry_filename={registry_filename}
               bailiwick_data={bailiwick_data}
               on_change={(bailiwick_data) => this.setState({bailiwick_data: bailiwick_data})}
            />
         },
         {
            label: "narrative",
            content: <BailiwickNarrative
               registry_filename={registry_filename}
               bailiwick_data={bailiwick_data}
               on_change={(bailiwick_data) => this.setState({bailiwick_data: bailiwick_data})}
            />
         },
         {
            label: "tools",
            content: "tools content"
         },
      ];

      const highlights = !show_points ? [] : FractoUtil.highlight_points(image_ref, bailiwick_data.display_settings,
         bailiwick_data.points ? bailiwick_data.points : []);

      const show_points_button = <ButtonWrapper><CoolButton
         primary={1}
         content={show_points ? "hide points" : "show points"}
         on_click={e => this.setState({show_points: !show_points})}/>
      </ButtonWrapper>

      return [
         <ImageWrapper ref={image_ref}>{main_image}</ImageWrapper>,
         highlights,
         loading ? '' : <TabsWrapper>
            <CoolTabs tab_data={bailiwick_draft_tabs}/>
            {show_points_button}
         </TabsWrapper>,
      ]
   }

}

export default BailiwickDraft;
