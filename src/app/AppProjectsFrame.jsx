import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "./AppImports";
import SectionIndex, {NO_SELECTION, INITIAL_SPLITTER_POS_PX} from "../common/SectionIndex";
import ProjectsTitleBar from "./projects/ProjectsTitleBar";
import ProjectsFrame from "./projects/ProjectsFrame";
import StoreS3, {S3_PREFIX} from "../common/StoreS3";

const SubEntry = styled.div`
    ${AppStyles.block}
    ${AppStyles.ellipsis}
    margin-left: 1.25rem;
`;

export class AppProjectsFrame extends Component {

   static propTypes = {
      sections: PropTypes.array.isRequired,
      components: PropTypes.array.isRequired,
      sections_title: PropTypes.string.isRequired,
   }

   state = {
      selected_title: NO_SELECTION,
      selected_key: NO_SELECTION,
      selected_path: NO_SELECTION,
      project_paths: [],
      outer_block_ref: React.createRef(),
      content_width_px: 0,
      splitter_pos: INITIAL_SPLITTER_POS_PX,
      selected_paths: []
   };

   componentDidMount() {
      const {splitter_pos} = this.state;
      this.on_resize(splitter_pos)
   }

   refresh_project_paths = (entry_key) => {
      StoreS3.list_files_async(entry_key, S3_PREFIX, data => {
         console.log("refresh_project_paths", data)
         const project_paths = data.CommonPrefixes.map(obj => obj.Prefix.substr(S3_PREFIX.length + 1))
         const selected_paths = this.list_selected_paths(project_paths)
         this.setState({
            project_paths: project_paths,
            selected_paths: selected_paths
         });
      })
   }

   selectEntry = (title) => {
      const {selected_title} = this.state;
      const {sections} = this.props;
      const isSelected = selected_title === title;
      if (isSelected) {
         this.setState({
            selected_title: NO_SELECTION,
            selected_key: NO_SELECTION,
         });
      } else {
         const entry = sections.find(entry => entry.title === title);
         this.setState({
            selected_title: entry.title,
            selected_key: entry.key,
         });
         this.refresh_project_paths(entry.key)
      }
   }

   list_selected_paths = (project_paths) => {
      const {selected_path} = this.state;
      return project_paths.sort((a, b) => a > b ? 1 : -1)
         .map(path => {
            const project_ref = React.createRef();
            StoreS3.get_file_async(`${path}main.json`, S3_PREFIX, data => {
               const json = JSON.parse(data);
               const interval = setInterval(() => {
                  if (project_ref.current) {
                     project_ref.current.innerText = json.name;
                     clearInterval(interval)
                  }
               }, 100);
            });
            const style = {fontWeight: 'bold', color: '#333333'}
            return <SubEntry
               style={path === selected_path ? style : {}}
               key={`subentry_${path}`}
               onClick={e => this.setState({selected_path: path})}
               ref={project_ref}>...</SubEntry>
         });
   }

   on_resize = (pos) => {
      const {outer_block_ref} = this.state;
      const client_rect = outer_block_ref.current.getBoundingClientRect();
      this.setState({
         splitter_pos: pos,
         content_width_px: client_rect.width - pos - 35
      })
   }

   render() {
      const {
         selected_title, selected_key, project_paths, selected_paths,
         selected_path, outer_block_ref, content_width_px, splitter_pos
      } = this.state;
      const {sections, components, sections_title} = this.props;
      const have_selection = selected_key !== NO_SELECTION;
      return <AppStyles.Block ref={outer_block_ref}>
         <SectionIndex
            index={sections}
            title={sections_title}
            selected_index={selected_title}
            on_select_index={title => this.selectEntry(title)}
            on_resize={pos => this.on_resize(pos)}
            selected_content={selected_paths}
            width_px={splitter_pos}
         />
         {have_selection && <ProjectsTitleBar
            title={selected_title}
            s3_key={selected_key}
            project_paths={project_paths}
            width_px={content_width_px}
         />}
         {have_selection && <ProjectsFrame
            title={selected_title}
            s3_key={selected_key}
            project_paths={project_paths}
            selected_path={selected_path}
            refresh_project_paths={() => this.refresh_project_paths(selected_key)}
            on_select_path={path => this.setState({selected_path: path})}
            components={components}
            width_px={content_width_px}
         />}
      </AppStyles.Block>
   }
}

export default AppProjectsFrame;
