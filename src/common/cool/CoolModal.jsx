import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';

const FormField = styled.div`
    position: absolute;
    z-Index: 200;
    padding-top: 8%;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,20%);
`;

const FormContainer = styled.div`
    margin: auto;
    overflow: auto;
    border-radius: 0.5rem;
    border: 0.15rem solid #aaaaaa;
    box-shadow: 0.5rem 0.5rem 1rem rgba(0,0,0,25%);
    min-width: 50%;   
    max-width: 75%;   
    background-color: white; 
`;

const FormContent = styled.div`
    min-height: 5rem;
    max-height: 75vh;
    padding: 0.5rem 1rem 1.5rem;
`;

export class CoolModal extends Component {

   static propTypes = {
      contents: PropTypes.element.isRequired,
      response: PropTypes.func.isRequired,
   }

   state = {
      modal_ref: React.createRef()
   }

   key_handler = (key) => {
      const {response} = this.props;
      if (key.code === "Escape") {
         response(0);
      }
   }

   click_handler = (evt) => {
      const {modal_ref} = this.state;
      const {response} = this.props;
      if (!modal_ref.current) {
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
      return <FormField>
         <FormContainer ref={modal_ref}>
            <FormContent>
               {this.props.contents}
            </FormContent>
         </FormContainer>
      </FormField>
   }
}

export default CoolModal;