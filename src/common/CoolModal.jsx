import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';

const FormField = styled.div`
    position: absolute;
    z-Index: 100;
    padding-top: 8%;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,40%);
`;

const FormContainer = styled.div`
    margin: auto;
    overflow: auto;
    border-radius: 0.25rem;
    width: 50%;    
`;

const FormContent = styled.div`
    min-height: 5rem;
    padding: 0.5rem 1rem;
`;

const FormFooter = styled.div`
    padding: 0.15rem;    
    height: 1.6rem;
`;

export class CoolModal extends Component {

    static propTypes = {
        contents: PropTypes.element.isRequired,
        response: PropTypes.func.isRequired,
    }

    render() {
        return <FormField>
            <FormContainer>
                <FormContent>
                    {this.props.contents}
                </FormContent>
            </FormContainer>
        </FormField>
    }
}

export default CoolModal;