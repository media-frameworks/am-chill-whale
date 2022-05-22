import React, {Component} from 'react';
import {createBrowserHistory} from "history";

import {AppAdmin} from "./app/AppImports";
import {PageMain, PageLogin, PageAdmin, PageWorks, PageError, PageFracto} from "./pages/PageImports";
import {WorksArt, WorksMusic, WorksVideo, WorksDoc} from "./pages/works/WorksImports";
import {AdminThreeD, AdminFracto, AdminStudio, AdminManifest} from "./pages/admin/AdminImports";

const ACCESS_PUBLIC = 'public';
const ACCESS_PROTECTED = 'protected';

const FRACTO_ROUTING =
   {
       segment: 'fracto',
       path: '/fracto',
       component: <PageFracto/>,
   };

const DEV_ROUTINGS = [
    {
        segment: '',
        path: '/',
        aliases: ['main', 'home', 'crib'],
        component: <PageMain/>,
        access: ACCESS_PUBLIC,
        routes: [
            {
                segment: 'login',
                path: '/login',
                component: <PageLogin/>,
            },
            {
                segment: 'admin',
                path: '/admin',
                component: <PageAdmin/>,
                access: ACCESS_PROTECTED,
                routes: [
                    {
                        segment: "3d",
                        title: "3d",
                        path: AppAdmin.THREE_D_PATH,
                        component: <AdminThreeD/>,
                    },
                    {
                        segment: "fracto",
                        title: "fracto",
                        path: AppAdmin.FRACTO_PATH,
                        component: <AdminFracto/>,
                    },
                    {
                        segment: "studio",
                        title: "sound studio",
                        path: AppAdmin.STUDIO_PATH,
                        component: <AdminStudio/>,
                    },
                    {
                        segment: "manifest",
                        title: "production manifest",
                        path: AppAdmin.MANIFEST_PATH,
                        component: <AdminManifest/>,
                    },

                ]
            },
            FRACTO_ROUTING,
            {
                segment: 'works',
                path: '/works',
                component: <PageWorks/>,
                routes: [
                    {
                        segment: 'art',
                        path: '/works/art',
                        component: <WorksArt/>,
                        routes: [
                            {segment: 'atlas-of-chaos'},
                            {segment: 'rounding-errors'},
                            {segment: 'exo-fracto'},
                            {segment: 'endo-fracto'},
                            {segment: 'invention'},
                        ]
                    },
                    {
                        segment: 'music',
                        path: '/works/music',
                        aliases: ['composition'],
                        component: <WorksMusic/>,
                        routes: [
                            {segment: 'rhapsody'},
                            {segment: 'off-kilter-waltz'},
                            {segment: 'union-square'},
                            {segment: 'millennium-gothic'},
                            {segment: 'schertzo'},
                        ]
                    },
                    {
                        segment: 'video',
                        path: '/works/video',
                        component: <WorksVideo/>,
                        routes: [
                            {segment: 'auto-animatron'},
                            {segment: 'book-of-light'},
                            {segment: 'modulus-effect'},
                            {segment: 'melodicon'},
                            {segment: 'cognito'},
                        ]
                    },
                    {
                        segment: 'doc',
                        path: '/works/doc',
                        aliases: ['documentary', 'performance'],
                        component: <WorksDoc/>,
                        routes: [
                            {segment: 'institute'},
                            {segment: 'harriet'},
                            {segment: 'musical-performance'},
                            {segment: 'union-square-2k4'},
                            {segment: 'performance-art'},
                        ]
                    },
                ]
            },
        ]
    },
    {
        segment: 'error',
        path: '/error',
        aliases: ['curb', 'web-jail'],
        component: <PageError/>,
        access: ACCESS_PUBLIC,
    }
];

const history = createBrowserHistory()

export class AppRouting extends Component {

    process_path = (segments, branch) => {
        const segment = segments.shift();
        for (let i = 0; i < branch.length; i++) {
            const item = branch[i];
            const aliases = item.aliases || [];
            const routes = item.routes || [];
            if (segment === item.segment || aliases.includes(segment)) {
                if (!segments.length && item.component) {
                    return React.cloneElement(
                        item.component,
                        {routes: routes}
                    )
                }
                return this.process_path(segments, routes);
            }
            if (item.segment === '') {
                segments.unshift(segment);
                return this.process_path(segments, routes);
            }
        }
        return <PageError/>
    }

    render() {
        const segments = history.location.pathname.split('/');
        segments.shift();
        console.log("segments", segments);
        if (process.env.NODE_ENV === 'production') {
            return this.process_path(segments, [FRACTO_ROUTING]);
        }
        return this.process_path(segments, DEV_ROUTINGS);
    }
}

export default AppRouting;