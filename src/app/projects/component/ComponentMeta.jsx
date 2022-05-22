import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../../AppImports";
import {CoolModal, CoolInputText, CoolButton} from "../../../common/cool/CoolImports";

const META_FIELDS = [
   {label: "name", key: "name", type: "text"},
   {label: "key", key: "key", type: "text"},
]

const RowWrapper = styled(AppStyles.Block)`
   margin: 0.25rem 0.5rem;
`;

const LabelWrapper = styled(AppStyles.InlineBlock)`
   width: 5rem;
   text-align: right;
`;

const EditWrapper = styled(AppStyles.InlineBlock)`
   width: 10rem;
`;

const TitleWtapper = styled(AppStyles.Block)`
   ${AppStyles.centered}   
   ${AppStyles.uppercase}   
   ${AppStyles.bold}   
   ${AppStyles.underline}   
   letter-spacing: 0.1rem;
   font-size: 1rem;
   color: #666666;
   margin: 0.25rem 0 1rem;
`;

const ButtonBar = styled(AppStyles.Block)`
   border-top: 0.15rem solid #dddddd;
   margin: 1rem 0;
   padding: 0.25rem 0;
`;

export class ComponentMeta extends Component {

   static propTypes = {
      meta: PropTypes.object.isRequired,
      response: PropTypes.func.isRequired,
   }

   state = {
      unchanged_meta: Object.assign({}, this.props.meta)
   }

   handle_result = (result) => {
      const {response} = this.props;
      console.log("handle_result", result)
      response(result)
   }

   set_new_value = (key, new_value) => {
      const {meta} = this.props;
      meta[key] = new_value
      console.log("set_new_value", new_value)
   }

   render() {
      const {unchanged_meta} = this.state;
      const {meta, response} = this.props;
      const items = META_FIELDS.map(field => {
         return <RowWrapper>
            <LabelWrapper>{`${field.label}:`}</LabelWrapper>
            <EditWrapper>
               <CoolInputText
                  value={meta[field.key]}
                  placeholder={'value not set'}
                  callback={new_value => this.set_new_value(field.key, new_value) }
               />
            </EditWrapper>
         </RowWrapper>
      });
      const title = <TitleWtapper>component meta</TitleWtapper>
      console.log("meta",meta)
      const button_style = {
         float: "right",
         margin: " 0 0 1rem 0.5rem"
      }
      const button_bar = <ButtonBar>
         <CoolButton content={"OK"} style={button_style} on_click={e => response(meta)} primary={true}/>
         <CoolButton content={"cancel"} style={button_style} on_click={e => response(unchanged_meta)}/>
      </ButtonBar>
      return <CoolModal
         contents={[title, items, button_bar]}
         response={result => this.handle_result(result)}
      />
   }

}

export default ComponentMeta;
