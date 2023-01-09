import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";

import ToolIndexer from "./tools/ToolIndexer";
import ToolGenerator from "./tools/ToolGenerator";
import ToolVerifier from "./tools/ToolVerifier";
import ToolInspect from "./tools/ToolInspect";
import ToolClassify from "./tools/ToolClassify";
import ToolAudit from "./tools/ToolAudit";

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
         <ToolBlock key={"ToolGenerator"}><ToolGenerator width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolVerifier"}><ToolVerifier width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolIndexer"}><ToolIndexer width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolClassify"}><ToolClassify width_px={width_px} level={level}/></ToolBlock>,
         <ToolBlock key={"ToolInspect"}><ToolInspect width_px={width_px} level={level}/></ToolBlock>,
      ]
   }
}

export default LevelTools;
