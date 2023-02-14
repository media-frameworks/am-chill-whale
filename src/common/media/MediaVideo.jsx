import React, {Component} from 'react';
import PropTypes from 'prop-types'
import styled from "styled-components";

import {AppStyles, AppColors} from "../../app/AppImports";
import CoolModal from "../../common/cool/CoolModal";
// import MediaEntry from "./MediaEntry";
// import {check_vimeo_auth} from "./VimeoAuth";

const MEDIA_VIDEO_EDIT_ENTRY = 10001;

// const vimeo_client = check_vimeo_auth();

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
      vimeo_id: PropTypes.string.isRequired,
      description: PropTypes.string,
      pictures: PropTypes.array,
      on_update_props: PropTypes.func.isRequired,
   }

   static defaultProps = {
      vimeo_id: 0,
      description: null,
      pictures: [],
   }

   static vimeo_videos = [];
   static loading_vimeo_videos = true;

   state = {
      in_modal_select: false,
      videos_total: false,
      video_load_progress_pct: 0,
   };

   componentDidMount() {
      const {vimeo_id} = this.props;
      if (!vimeo_id) {
         this.setState({in_modal_select: true});
      }
      const path = `/users/17538072/videos?per_page=50`;
      if (!MediaVideo.vimeo_videos.length) {
         MediaVideo.loading_vimeo_videos = true;
         let vimeo_videos = [];
         this.load_all_videos(path, vimeo_videos)
      } else {
         this.setState({video_load_progress_pct: 100})
         MediaVideo.loading_vimeo_videos = false;
      }
   }

   load_all_videos = (uri, vimeo_videos) => {
      console.log("load_all_videos", uri)
      // vimeo_client.request({path: uri}, (error, body, status_code, headers) => {
      //    vimeo_videos = vimeo_videos.concat(body.data)
      //    MediaVideo.vimeo_videos = vimeo_videos;
      //    if (body.paging && body.paging.next) {
      //       this.setState({video_load_progress_pct: Math.floor(vimeo_videos.length * 100 / body.total)})
      //       this.load_all_videos(body.paging.next, vimeo_videos)
      //    } else {
      //       this.setState({video_load_progress_pct: 100})
      //    }
      // })
   }

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "got to vimeo", code: MEDIA_VIDEO_EDIT_ENTRY},
      ];
   }

   static on_menu_select = (code, segment_data) => {
      console.log("on_menu_select", code)
      switch (code) {
         case MEDIA_VIDEO_EDIT_ENTRY:
            const url = `https://vimeo.com/manage/${segment_data.props.vimeo_id}/advanced`;
            window.open(url, "_blank") || window.location.replace(url);
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
         const videos_for_year = MediaVideo.vimeo_videos.filter(video => video && video.name.indexOf(`(${year})`) !== -1);
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
      const {vimeo_id, description, pictures, on_update_props} = this.props;
      const video_select_prompt = vimeo_id > 0 ? '' :
         <PromptText onClick={e => this.setState({in_modal_select: true})}>select video</PromptText>
      const select_modal = !in_modal_select ? '' : <CoolModal
         contents={this.select_video_modal(video_load_progress_pct)}
         response={vimeo_id => {
            this.setState({in_modal_select: false})
            on_update_props({vimeo_id: vimeo_id})
         }}
      />
      // const video_entry = <MediaEntry
      //    vimeo_id={vimeo_id}
      //    description={description}
      //    pictures={pictures}
      //    on_update_props={props => on_update_props(props)}
      // />
      return <AppStyles.Block>
         {video_select_prompt}
         {select_modal}
         {/*{video_entry}*/}
      </AppStyles.Block>
   }
}

export default MediaVideo;
