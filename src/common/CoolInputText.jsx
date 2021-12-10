import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles} from "../app/AppImports";

export class CoolInputText extends Component {

    static propTypes = {
        value: PropTypes.string.isRequired,
        style_extra: PropTypes.object,
        placeholder: PropTypes.string.isRequired,
        callback: PropTypes.func.isRequired,
        is_text_area: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        style_extra: {}
    }

    state = {
        current_value: this.props.value,
        input_ref: React.createRef()
    };

    componentDidMount() {
        const {input_ref} = this.state;
        const {value, callback} = this.props;
        const key_handler = (key) => {
            if (key.code === "Escape") {
                document.removeEventListener("keydown", key_handler);
                callback(value);
            }
            if (key.code === "Enter" || key.code === "NumpadEnter") {
                document.removeEventListener("keydown", key_handler);
                if (input_ref.current) {
                    callback(input_ref.current.value);
                }
            }
        }
        document.addEventListener("keydown", key_handler);
    }

    render() {
        const {input_ref, current_value} = this.state;
        const {placeholder, style_extra, is_text_area} = this.props;
        return is_text_area ?
            <AppStyles.InputTextArea
                ref={input_ref}
                autoFocus
                size={current_value.length}
                style={style_extra}
                value={current_value}
                rows={5}
                cols={40}
                onChange={e => this.setState({current_value: e.target.value})}
                placeholder={placeholder}/> :
            <AppStyles.InputText
                ref={input_ref}
                autoFocus
                size={current_value.length}
                style={style_extra}
                value={current_value}
                onChange={e => this.setState({current_value: e.target.value})}
                placeholder={placeholder}/>
    }
}

export default CoolInputText;
