import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {AppStyles, AppBrand, AppTitleBar} from "../../app/AppImports";

export class AdminStudio extends Component {

    static propTypes = {
        routes: PropTypes.array,
    }

    state = {
        admin_back_ref: React.createRef()
    };

    componentDidMount() {
        const {admin_back_ref} = this.state;
        AppBrand.swatch_fadein(admin_back_ref, AppBrand.COOL_FADE_IN_MS);
    }

    render() {
        const {admin_back_ref} = this.state;
        const title = "sound studio";
        return <AppStyles.PageWrapper>
            <AppTitleBar title={title} blurb={AppBrand.CATCH_PHRASE}/>
            {AppBrand.link_swatch(admin_back_ref, AppBrand.ADMIN_TITLE, AppBrand.ADMIN_PATH)}
        </AppStyles.PageWrapper>
    }
}

export default AdminStudio;
