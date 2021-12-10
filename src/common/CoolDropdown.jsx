import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';

import {AppStyles} from "../app/AppImports";

const ITEM_COLOR = "#888888";
const ITEM_HILIGHT_COLOR = "#333333";

const DropdownContainer = styled.div`    
    ${AppStyles.inline_block}
    min-width: 4rem;
    overflow: auto;
    z-index: 100;
    border: 0.15rem solid #aaaaaa;
    box-shadow: 0.5rem 0.5rem 1rem rgba(0,0,0,20%);
    border-radius: 0.25rem;
    margin-left: 0.25rem;
`;

const DropdownElement = styled.div`
    ${AppStyles.pointer}
    padding: 0.125rem 0.25rem;
    font-size: 0.95rem;
    color: ${ITEM_COLOR};
    background-color: #eeeeee;
    &: hover {
        color: ${ITEM_HILIGHT_COLOR};
        font-weight: bold;
        background-color: #dddddd; 
    }
`;

const DropdownLabel = styled.div`
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
`;

const DropdownSeparator = styled.div`
    border: 0.15rem solid #dddddd;
`;

export class CoolDropdown extends Component {

    static propTypes = {
        items: PropTypes.array.isRequired,
        callback: PropTypes.func.isRequired,
    }

    componentDidMount() {
        const {callback} = this.props;
        const key_handler = (key) => {
            // console.log("key_handler", key)
            if (key.code === "Escape") {
                document.removeEventListener("keydown", key_handler);
                callback(0);
            }
        }
        const click_handler = (click) => {
            console.log("click_handler", click)
            document.removeEventListener("click", click_handler);
            callback(0);
        }
        setTimeout(() => {
            document.addEventListener('keydown', key_handler);
            document.addEventListener('click', click_handler);
        }, 100);
    }

    on_click = (code, e) => {
        const {callback} = this.props;
        // console.log("on_click", e)
        // e.target.preventDefault();
        callback(code);
    }

    render() {
        const {items} = this.props;
        const all_items = items.map((item, index) => {
            const key = `dropdown_${index}`;
            return (item['type'] === 'separator') ? <DropdownSeparator key={key}/> :
                <DropdownElement key={key} onClick={e => this.on_click(item.code, e)}>
                    <DropdownLabel>{item.label}</DropdownLabel>
                </DropdownElement>
        });
        return <DropdownContainer>
            {all_items}
        </DropdownContainer>
    }
}

export default CoolDropdown;
