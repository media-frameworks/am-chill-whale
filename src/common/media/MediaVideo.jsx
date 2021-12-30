import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles, AppColors} from "../../app/AppImports";
import vimeo_auth from "../../config/vimeo.json";
import CoolModal from "../../common/cool/CoolModal";
import MediaEntry from "./MediaEntry";

var Vimeo = require('vimeo').Vimeo;

const MEDIA_VIDEO_GO_TO_SOURCE = 10001;

var vimeo_client = new Vimeo(
   vimeo_auth.VIMEO_USER_ID,
   vimeo_auth.VIMEO_CLIENT_SECRET,
   vimeo_auth.VIMEO_ACCESS_TOKEN);

const PromptText = styled.span`
   ${AppStyles.pointer};
   color: #aaaaaa;   
   font-size: 1rem;
   font-style: italic;
   padding: 0 0.25rem;
`;

const VideoSelector = styled.div`
   ${AppStyles.inline_block};
   ${AppStyles.uppercase};
   ${AppStyles.pointer};
   ${AppColors.COLOR_DEEP_BLUE};
   border: 0.25rem double ${AppColors.HSL_COOL_BLUE};
   padding: 0.25rem 0.5rem 0.125rem;
   border-radius: 0.25rem;
   font-size: 0.75rem;
   font-weight: bold;
   background-color: ${AppColors.HSL_LIGHT_COOL_BLUE};
   margin: 0.25rem;
   &: hover{
      ${AppStyles.medium_box_shadow};
      margin: 0;
   }
`;

const YearHeader = styled.div`
   ${AppStyles.block}
   margin: 0.5rem 0;
   padding-top: 0.5rem;
   font-size: 1.5rem;
   text-align: center;
`;

const YearSection = styled.div`
   ${AppStyles.block}
`;

export class MediaVideo extends Component {

   static propTypes = {
      vimeo_id: PropTypes.string.required,
      on_update_props: PropTypes.func.isRequired,
   }

   static defaultProps = {
      vimeo_id: 0
   }

   static vimeo_videos = [];

   state = {
      in_modal_select: false,
      videos_total: false,
      video_load_progress_pct: 0,
   };

   componentDidMount() {
      const path = `/users/17538072/videos?per_page=50`;
      if (!MediaVideo.vimeo_videos.length) {
         let vimeo_videos = [];
         this.load_all_videos(path, vimeo_videos)
      } else {
         this.setState({video_load_progress_pct: 100})
      }
   }

   load_all_videos = (uri, vimeo_videos) => {
      console.log("load_all_videos", uri)
      vimeo_client.request({path: uri}, (error, body, status_code, headers) => {
         vimeo_videos = vimeo_videos.concat(body.data)
         MediaVideo.vimeo_videos = vimeo_videos;
         if (body.paging.next) {
            this.setState({video_load_progress_pct: Math.floor(vimeo_videos.length * 100 / body.total)})
            this.load_all_videos(body.paging.next, vimeo_videos)
         } else {
            this.setState({video_load_progress_pct: 100})
         }
      })
   }

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "go to source", code: MEDIA_VIDEO_GO_TO_SOURCE},
      ];
   }

   static on_menu_select = (code, segment_data) => {
      console.log("on_menu_select", code)
      switch (code) {
         case MEDIA_VIDEO_GO_TO_SOURCE:
            console.log("MEDIA_VIDEO_GO_TO_SOURCE")
            return true;
         default:
            return false;
      }
   }

   vimeo_id_from_entry = (entry) => {
      return entry.uri.split('/').pop();
   }

   select_video_modal = (video_load_progress_pct) => {
      const {on_update_props} = this.props;
      if (video_load_progress_pct !== 100) {
         return <AppStyles.Block>
            {`Loading videos ${video_load_progress_pct}%...`}
         </AppStyles.Block>
      }
      const curent_year = new Date().getFullYear();
      let all_years = [];
      for (let year = 2000; year <= curent_year; year++) {
         const videos_for_year = MediaVideo.vimeo_videos.filter(video => video.name.indexOf(`(${year})`) !== -1);
         if (videos_for_year.length) {
            const videos = videos_for_year
               .sort((a, b) => a.name > b.name ? 1 : -1)
               .map(entry => {
                  return <VideoSelector
                     key={entry.resource_key}
                     onClick={e => {
                        this.setState({in_modal_select: false})
                        const vimeo_id = this.vimeo_id_from_entry(entry)
                        on_update_props({vimeo_id: vimeo_id})
                     }}>
                     {entry.name}
                  </VideoSelector>
               });
            all_years.push(<AppStyles.Block>
               <YearHeader>{year}</YearHeader>
               <YearSection>{videos}</YearSection>
            </AppStyles.Block>)
         }
      }
      return all_years;
   }

   render() {
      const {in_modal_select, video_load_progress_pct} = this.state;
      const {vimeo_id, on_update_props} = this.props;
      const video_select_prompt = vimeo_id > 0 ? '' :
         <PromptText onClick={e => this.setState({in_modal_select: true})}>select video</PromptText>
      const select_modal = !in_modal_select ? '' : <CoolModal
         contents={this.select_video_modal(video_load_progress_pct)}
         response={vimeo_id => {
            this.setState({in_modal_select: false})
            on_update_props({vimeo_id: vimeo_id})
         }}
      />
      console.log("vimeo_id",vimeo_id)
      const video_entry = <MediaEntry vimeo_id={vimeo_id} />
      return <AppStyles.Block>
         {video_select_prompt}
         {select_modal}
         {video_entry}
      </AppStyles.Block>
   }
}

export default MediaVideo;
