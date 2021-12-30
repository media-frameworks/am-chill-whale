import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
// import styled from "styled-components";

import {AppStyles} from "../../app/AppImports";
import vimeo_auth from "../../config/vimeo.json";

var Vimeo = require('vimeo').Vimeo;

var vimeo_client = new Vimeo(
   vimeo_auth.VIMEO_USER_ID,
   vimeo_auth.VIMEO_CLIENT_SECRET,
   vimeo_auth.VIMEO_ACCESS_TOKEN);

export class MediaEntry extends Component {

   static propTypes = {
      vimeo_id: PropTypes.string.required,
      on_update_props: PropTypes.func.isRequired,
   }

   state = {
      data_ready: false,
      video_entry: {}
   };

   componentDidMount() {
      this.load_video();
   }

   load_video = () => {
      const {vimeo_id} = this.props;
      const path = `/videos/${vimeo_id}`;
      vimeo_client.request({path: path}, (error, body, status_code, headers) => {
         console.log("video entry", body)
         this.setState({video_entry: body, data_ready: true})
      });
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      if (prevProps.vimeo_id !== this.props.vimeo_id) {
         this.load_video();
      }
   }

   render() {
      const {data_ready, video_entry} = this.state;
      const {vimeo_id} = this.props;
      if (!data_ready || !video_entry) {
         return <AppStyles.Block>
            {`loading ${vimeo_id}...`}
         </AppStyles.Block>
      }
      return <AppStyles.Block>
         {video_entry.name}
      </AppStyles.Block>
   }
}

export default MediaEntry;
