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

const PROP_CODE_NOTES = 'notes';
const PROP_CODE_MEDIA = 'media';
const PROP_CODE_STATS = 'stats';

const PROPS_MENU = [
    {label: "notes", code: PROP_CODE_NOTES},
    {label: "media", code: PROP_CODE_MEDIA},
    {label: "stats", code: PROP_CODE_STATS},
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

export class ManifestProps extends Component {

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
            case PROP_CODE_NOTES:
                if (!data["notes"]) {
                    data["notes"] = [];
                }
                data["notes"].unshift('');
                this.update_data(data);
                break;
            case PROP_CODE_MEDIA:
                break;
            case PROP_CODE_STATS:
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

    render() {
        const {add_props_mode} = this.state;
        const {data} = this.props;
        const props_dropDown = !add_props_mode ? '' :
            <CoolDropdown items={PROPS_MENU} callback={selection => {
                this.add_props(selection);
                this.setState({add_props_mode: false})
            }}/>;
        const notes_section = !data.notes ? "" : this.render_notes();
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
        </PropsWrapper>
    }
}

export default ManifestProps;
