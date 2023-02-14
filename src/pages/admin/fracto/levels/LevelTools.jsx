import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";

import ToolClassify from "./tools/ToolClassify";
import ToolEdge from "./tools/ToolEdge";
import ToolFills from "./tools/ToolFills";
import ToolGenerate from "./tools/ToolGenerate";
import ToolIndex from "./tools/ToolIndex";
import ToolInspect from "./tools/ToolInspect";
import ToolMeta from "./tools/ToolMeta";

const ToolBlock = styled(AppStyles.Block)`
   margin: 0 0.75rem;
`;

export class LevelTools extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   render() {
      const {level, width_px} = this.props;
      return [
         <ToolBlock key={"ToolClassify"}><ToolClassify width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolEdge"}><ToolEdge width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolFills"}><ToolFills width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolGenerate"}><ToolGenerate width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolIndex"}><ToolIndex width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolInspect"}><ToolInspect width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolMeta"}><ToolMeta width_px={width_px} level={level}/></ToolBlock>,
      ]
   }
}

export default LevelTools;
