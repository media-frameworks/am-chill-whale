import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';

import {AppStyles} from "app/AppImports";

const FormField = styled.div`
    position: fixed;
    z-Index: 200;
    padding-top: 5rem;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,35%);
`;

const FormContainer = styled.div`
    margin: auto;
    overflow: hidden;
    border-radius: 0.5rem;
    border: 0.15rem solid #aaaaaa;
    box-shadow: 0.5rem 0.5rem 1rem rgba(0,0,0,25%);
    min-width: 10%;   
    background-color: white; 
`;

const FormContent = styled.div`
    min-height: 5rem;
    max-height: 90vh;
`;

export const ModalTitle = styled(AppStyles.Block)`
    ${AppStyles.uppercase}
    ${AppStyles.centered}
    ${AppStyles.underline}
    ${AppStyles.bold}
    letter-spacing: 0.125rem;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
 `;

export class CoolModal extends Component {

   static propTypes = {
      contents: PropTypes.element.isRequired,
      response: PropTypes.func,
      width: PropTypes.string,
      settings: PropTypes.object,
   }

   static defaultProps = {
      width: "40%",
      settings: {}
   }

   state = {
      modal_ref: React.createRef()
   }

   key_handler = (key) => {
      const {response, settings} = this.props;
      if (key.code === "KeyC" && key.ctrlKey) {
         response(0);
      }
      if (settings["no_escape"]) {
         return;
      }
      if (key.code === "Escape") {
         response(0);
      }
   }

   click_handler = (evt) => {
      const {modal_ref} = this.state;
      const {response, settings} = this.props;
      if (settings["no_escape"]) {
         return;
      }
      if (!modal_ref.current) {
         return;
      }
      if (!evt.clientX && !evt.clientY) {
         return;
      }
      const bounds = modal_ref.current.getBoundingClientRect();
      if (evt.clientX < bounds.left ||
         evt.clientX > bounds.right ||
         evt.clientY < bounds.top ||
         evt.clientY > bounds.bottom) {
         response(0);
      }
   }

   componentDidMount() {
      setTimeout(() => {
         document.addEventListener('keydown', this.key_handler);
         document.addEventListener('click', this.click_handler);
      }, 100);
   }

   componentWillUnmount() {
      document.removeEventListener("keydown", this.key_handler);
      document.removeEventListener("click", this.click_handler);
   }

   render() {
      const {modal_ref} = this.state;
      const {width} = this.props;
      const style_extra = {width: width};
      return <FormField>
         <FormContainer style={style_extra} ref={modal_ref}>
            <FormContent>
               {this.props.contents}
            </FormContent>
         </FormContainer>
      </FormField>
   }
}

export default CoolModal;