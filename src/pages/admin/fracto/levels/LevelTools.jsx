import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";

// import ToolIndexer from "./tools/ToolIndexer";
import ToolIndex from "./tools/ToolIndex";
import ToolGenerate from "./tools/ToolGenerate";
import ToolVerifier from "./tools/ToolVerifier";
import ToolInspect from "./tools/ToolInspect";
import ToolClassify from "./tools/ToolClassify";
import ToolAudit from "./tools/ToolAudit";
import ToolError from "./tools/ToolError";

const ToolBlock = styled(AppStyles.Block)`
   margin: 0 1rem;
`;

export class LevelTools extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   render() {
      const {level, width_px} = this.props;
      return [
         <ToolBlock key={"ToolAudit"}><ToolAudit width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolGenerate"}><ToolGenerate width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolVerifier"}><ToolVerifier width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolIndex"}><ToolIndex width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolClassify"}><ToolClassify width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolInspect"}><ToolInspect width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolError"}><ToolError width_px={width_px} level={level}/></ToolBlock>,
      ]
   }
}

export default LevelTools;
