import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../AppImports";

const EMPTY_SEGMENT = {
    notes: [],
    comps: [],
    props: [],
};

const SegmentsWrapper = styled.div`
    ${AppStyles.block}
    ${AppStyles.noselect}
    background-color: white;
    min-height: 2rem;
    border-top: 0.15rem solid #cccccc;
    margin-top: 0.25rem;
`;

export class ProjectSegmentsFrame extends Component {

    static propTypes = {
        data: PropTypes.object.isRequired,
        on_update: PropTypes.func.isRequired,
        is_expanded: PropTypes.bool.isRequired,
    }

    state = {
        selected_index: 0
    };

    componentDidMount() {
        const {data, on_update} = this.props;
        if (!data.name) {
            return;
        }
        let should_update = false;
        if (!data.segments) {
            data.segments = [];
            should_update = true;
        }
        if (!data.segments.length) {
            data.segments.push(EMPTY_SEGMENT);
            should_update = true;
        }
        if (should_update) {
            on_update(data);
        }
    }

    render() {
        const {data} = this.props;
        const segments = !data.segments ? '' :
            data.segments.map(segment => {
                return <div>a segment ok</div>
            });
        return <SegmentsWrapper>
            {segments}
        </SegmentsWrapper>
    }
}

export default ProjectSegmentsFrame;
