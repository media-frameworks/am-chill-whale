import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

// import AppStyles from "app/AppStyles";
import {CoolInputText, CoolSelect} from "common/cool/CoolImports";

import FractoData from "../../FractoData";

export const START_AT_TILE_INDEX = "start_at_tile_index";
export const START_AT_REAL_VALUE = "start_at_real_value";

export class ToolSelectTile extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      on_selection: PropTypes.func.isRequired,
      tool_id: PropTypes.string.isRequired
   }

   state = {
      completed: [],
      potentials: [],
      settings_json: {}
   }

   componentDidMount() {
      const {level, tool_id} = this.props;
      const completed = FractoData.get_completed_tiles(level)
      const potentials = FractoData.get_potential_tiles(level)
      this.setState({
         completed: completed,
         potentials: potentials
      })
      const settings_str = localStorage.getItem(tool_id);
      if (settings_str) {
         this.setState({settings_json: JSON.parse(settings_str)})
      }
   }

   on_change_selection = (start_type) => {
      const {settings_json} = this.state;
      const {on_selection, tool_id} = this.props;
      settings_json["start_type"] = start_type;
      this.setState({settings_json: settings_json})
      localStorage.setItem(tool_id, JSON.stringify(settings_json));
      on_selection(settings_json);
   }

   render() {
      const start_at_options = [
         {label: "tile index", value: START_AT_TILE_INDEX, help: "completed"},
         {label: "real value", value: START_AT_REAL_VALUE, help: "x"},
      ]
      return [
         <CoolSelect
            options={start_at_options}
            value={0}
            on_change={value => this.on_change_selection(value)}/>,
         <CoolInputText
            value={49000}
            style_extra={{width: "5rem", marginLeft: "0.5rem"}}
         />
      ]
   }
}

export default ToolSelectTile;
