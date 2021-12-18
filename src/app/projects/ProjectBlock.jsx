import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../AppImports";
import Utils from "../../common/Utils";
import StoreS3, {S3_PREFIX} from "../../common/StoreS3";
import ProjectMeta from "./ProjectMeta";
import ProjectSegmentsFrame from "./ProjectSegmentsFrame";

const EMPTY_SEGMENT = {
   notes: [],
};

const ProjectWrapper = styled.div`
    ${AppStyles.block}
    ${AppStyles.noselect}
    border: 0.15rem solid #aaaaaa;
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    margin: 0.25rem 0;
    background-color: white;
    min-height: 1.5rem;
`;

const DeleteItem = styled.div`
    ${AppStyles.inline_block};
    ${AppStyles.italic};
    ${AppStyles.pointer};
    float: right;
    font-size: 0.85rem;
    color: lightcoral;
    opacity: 0;
    &: hover {
        opacity: 1;
    }
`;

export class ProjectBlock extends Component {

   static propTypes = {
      project_path: PropTypes.string.isRequired,
      is_expanded: PropTypes.bool.isRequired,
      components: PropTypes.array.isRequired,
      refresh_project_paths: PropTypes.func.isRequired,
   }

   state = {
      data: {}
   };

   componentDidMount() {
      const {project_path} = this.props;
      StoreS3.get_file_async(`${project_path}main.json`, S3_PREFIX, data => {
         let parsed_data = JSON.parse(data);
         if (!parsed_data.segments) {
            parsed_data.segments = [];
         }
         if (!parsed_data.segments.length) {
            parsed_data.segments.push(EMPTY_SEGMENT);
         }
         this.setState({data: parsed_data});
      });
   }

   update_data = (data) => {
      data["updated"] = Utils.now_string();
      StoreS3.put_file_async(data.s3_path, JSON.stringify(data), S3_PREFIX, result => {
         console.log("update_data", result, data);
         this.setState({data: data});
      })
   }

   delete_project = (project_path) => {
      const {refresh_project_paths} = this.props;
      const main_file = `${project_path}main.json`;
      StoreS3.delete_file_async(main_file, S3_PREFIX, result => {
         refresh_project_paths();
      })
   }

   render() {
      const {data} = this.state;
      const {is_expanded, project_path, components} = this.props;
      const delete_item = !is_expanded ? '' : <DeleteItem
         onClick={e => this.delete_project(project_path)}>delete</DeleteItem>
      return <ProjectWrapper>
         <AppStyles.InlineBlock>
            <ProjectMeta
               data={data}
               is_expanded={is_expanded}
               on_update={data => this.update_data(data)}
            />
         </AppStyles.InlineBlock>
         {delete_item}
         {is_expanded && <ProjectSegmentsFrame
            data={data}
            components={components}
            is_expanded={is_expanded}
            on_update={data => this.update_data(data)}
         />}
      </ProjectWrapper>;
   }
}

export default ProjectBlock;
