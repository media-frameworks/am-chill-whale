import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons';

import StoreS3, {S3_PREFIX} from "../../../common/StoreS3";
import Utils from "../../../common/Utils";
import {AppStyles, AppColors} from "../../../app/AppImports";
import CoolDropdown from "../../../common/CoolDropdown";
import CoolInputText from "../../../common/CoolInputText";

const PROP_CODE_TERMS = 'terms';
const PROP_CODE_NOTES = 'notes';
const PROP_CODE_MEDIA = 'media';
const PROP_CODE_STUDY = 'study';

const PROPS_MENU = [
    {label: "terms", code: PROP_CODE_TERMS},
    {label: "notes", code: PROP_CODE_NOTES},
    {label: "media", code: PROP_CODE_MEDIA},
    {label: "study", code: PROP_CODE_STUDY},
]

const PropsWrapper = styled.div`
    ${AppStyles.block}
    ${AppStyles.noselect}
    border-top: 0.15rem solid #aaaaaa;
    padding: 0.5rem 0;
    margin: 0.5rem 0 0 ;
`;

const AddPropsButton = styled.div`
    ${AppStyles.inline_block};
    ${AppStyles.pointer};
    ${AppStyles.noselect};
    ${AppStyles.align_top};
    ${AppColors.COLOR_COOL_BLUE};
    ${AppStyles.COOL_BORDER};
    padding: 0.125rem 0.25rem;
    font-size: 0.85rem;
`;

const IconWrapper = styled.div`
    ${AppStyles.inline};
    ${AppColors.COLOR_COOL_BLUE};
    height: 1.5rem;
    vertical-align: middle;
    padding-right: 0.5rem;
`;

const DeleteItem = styled.span`
    ${AppStyles.inline};
    ${AppStyles.italic};
    ${AppStyles.pointer};
    float: right;
    font-size: 0.85rem;
    color: lightcoral;
    opacity: 0;
    &: hover {
        opacity: 1;
    }
`;

export class ThreeDProps extends Component {

    static propTypes = {
        data: PropTypes.object.isRequired,
        callback: PropTypes.func.isRequired,
    }

    state = {
        add_props_mode: false
    }

    update_data = (data) => {
        data["updated"] = Utils.now_string();
        StoreS3.put_file_async(data.s3_path, JSON.stringify(data), S3_PREFIX, result => {
            console.log("update_data", result, data);
            this.setState({data: data});
        })
    }

    add_props = (prop_type) => {
        const {data} = this.props;
        console.log("add_props", prop_type);
        switch (prop_type) {
            case PROP_CODE_TERMS:
                if (!data["terms"]) {
                    data["terms"] = [];
                }
                data["terms"].unshift({name: 'new term', value: ''});
                this.update_data(data);
                break;
            case PROP_CODE_NOTES:
                if (!data["notes"]) {
                    data["notes"] = [];
                }
                data["notes"].unshift('');
                this.update_data(data);
                break;
            case PROP_CODE_MEDIA:
                break;
            case PROP_CODE_STUDY:
                if (!data["study"]) {
                    data["study"] = [];
                }
                this.update_data(data);
                break;
            default:
                console.log("unknown prop type", prop_type);
                break;
        }
    }

    render_notes = () => {
        const {data} = this.props;
        const all_notes = data.notes.map((note, index) =>
            <AppStyles.Block>
                <CoolInputText
                    value={note}
                    placeholder={"use your words"}
                    is_text_area={true}
                    callback={new_value => {
                        if (new_value !== note) {
                            data.notes[index] = new_value;
                            this.update_data(data);
                        }
                    }}
                />
            </AppStyles.Block>
        )
        return <AppStyles.Block>
            {all_notes}
        </AppStyles.Block>
    }

    render_terms = () => {
        const {data} = this.props;
        const all_terms = data.terms.map((term, index) =>
            <AppStyles.Block>
                {term.name}:{term.value}
                <DeleteItem onClick={e => {
                    data.terms.splice(index, 1);
                    this.update_data(data);
                }}>delete</DeleteItem>
            </AppStyles.Block>
        )
        return <AppStyles.Block>
            {all_terms}
        </AppStyles.Block>
    }

    render() {
        const {add_props_mode} = this.state;
        const {data} = this.props;
        const props_dropDown = !add_props_mode ? '' :
            <CoolDropdown items={PROPS_MENU} callback={selection => {
                this.add_props(selection);
                this.setState({add_props_mode: false})
            }}/>;
        const notes_section = !data.notes ? "" : this.render_notes();
        const terms_section = !data.terms ? "" : this.render_terms();
        return <PropsWrapper>
            <AddPropsButton
                onClick={e => this.setState({add_props_mode: true})}>
                <IconWrapper>
                    <FontAwesomeIcon icon={faPlusSquare}/>
                </IconWrapper>
                {"add props"}
            </AddPropsButton>
            {props_dropDown}
            {notes_section}
            {terms_section}
        </PropsWrapper>
    }
}

export default ThreeDProps;
