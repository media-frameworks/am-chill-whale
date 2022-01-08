import React, {Component} from 'react';
import PropTypes from 'introspective-prop-types'
import styled from "styled-components";

import {AppStyles} from "../../app/AppImports";
import vimeo_auth from "../../config/vimeo.json";

var Vimeo = require('vimeo').Vimeo;

var vimeo_client = new Vimeo(
   vimeo_auth.VIMEO_USER_ID,
   vimeo_auth.VIMEO_CLIENT_SECRET,
   vimeo_auth.VIMEO_ACCESS_TOKEN);

const NameValueWrapper = styled.div`
   ${AppStyles.block}
   margin-left: 1.5rem;
   line-height: 0.85rem;
   width: 16rem;
   :first-line {
      margin-left: 1rem;
   }
`;

const TitleBlock = styled.div`
   ${AppStyles.block}
   margin-left: 0.5rem;
`;

const PropertyName = styled.div`
   ${AppStyles.inline_block}
   ${AppStyles.bold}
   font-size: 0.75rem;
   margin: 0 0.25rem 0 -1rem;
`;

const PropertyValue = styled.div`
   ${AppStyles.inline}
   font-size: 0.75rem;
`;

const TextValue = styled(PropertyValue)`
   ${AppStyles.italic}
`;

const NumericValue = styled(PropertyValue)`
   ${AppStyles.monospace}
`;

const EntryImage = styled.img`
   ${AppStyles.pointer}
   ${AppStyles.align_top}
   border-radius: 0.25rem;
   width: 16rem;
   margin-bottom: 0.5rem;
`;

const PropertiesWrapper = styled.div`
   ${AppStyles.inline_block}
   max-width: 20rem;
   padding-bottom: 0.5rem;
`;

const TitleSpan = styled.span`
   ${AppStyles.bold}
   font-size: 1.25rem;   
`;

const YearSpan = styled.span`
   ${AppStyles.italic}
   font-size: 0.75rem;   
   margin-left: 0.25rem;
`;

export class MediaEntry extends Component {

   static propTypes = {
      vimeo_id: PropTypes.string.required,
      description: PropTypes.string,
      pictures: PropTypes.array,
      on_update_props: PropTypes.func.isRequired,
   }

   static defaultProps = {
      description: null,
      pictures: [],
   };

   state = {
      data_ready: false,
      animated_thumbsets_ready: false,
      video_entry: {}
   };

   componentDidMount() {
      this.load_video();
   }

   load_video = () => {
      const {vimeo_id} = this.props;
      let path = `/videos/${vimeo_id}`;
      vimeo_client.request({path: path}, (error, body, status_code, headers) => {
         this.synchronize_entry(body);
         this.setState({video_entry: body, data_ready: true});
      });
      // path = `/videos/${vimeo_id}/animated_thumbsets`;
      // vimeo_client.request({path: path}, (error, body, status_code, headers) => {
      //    console.log("animated_thumbsets", body);
      //    this.setState({animated_thumbsets: body, animated_thumbsets_ready: true});
      // });
   }

   synchronize_entry = (entry) => {
      const {description, pictures, on_update_props} = this.props;
      let updating = {}
      if (!description && entry.description) {
         const description = entry.description.split("\n").shift();
         console.log("setting description", description);
         updating["description"] = description;
      }
      if (!pictures.length && entry.pictures) {
         console.log("setting pictures", entry.pictures.sizes);
         updating["pictures"] = entry.pictures.sizes;
      }
      if (Object.keys(updating).length > 0) {
         console.log("updating item", updating)
         on_update_props(updating)
      }
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      if (prevProps.vimeo_id !== this.props.vimeo_id) {
         this.load_video();
      }
   }

   property_display = (name, value) => {
      return <NameValueWrapper>
         <PropertyName>{name}:</PropertyName>
         {value}
      </NameValueWrapper>
   }

   render() {
      const {data_ready, video_entry} = this.state;
      const {vimeo_id, description} = this.props;
      if (!data_ready || video_entry === {}) {
         return <AppStyles.Block>
            {`loading ${vimeo_id}...`}
         </AppStyles.Block>
      }
      if (!vimeo_id || !video_entry.name) {
         return '';
      }
      const title_and_year = video_entry.name.split ('(');
      return <AppStyles.Block>
         {video_entry.pictures && <EntryImage
            src={video_entry.pictures.sizes[3].link}
         />}
         <PropertiesWrapper>
            <TitleBlock>
               <TitleSpan>{title_and_year[0].trim()}</TitleSpan>
               <YearSpan>({title_and_year[1]}</YearSpan>
            </TitleBlock>
            {this.property_display("description", <TextValue>{description}</TextValue>)}
            {this.property_display("size", <NumericValue>{`${video_entry.width}x${video_entry.height}`}</NumericValue>)}
            {this.property_display("duration", <NumericValue>{`${video_entry.duration}s`}</NumericValue>)}
         </PropertiesWrapper>
      </AppStyles.Block>
   }
}

export default MediaEntry;
