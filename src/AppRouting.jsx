import {Component} from 'react';
import {createBrowserHistory} from "history";

import PageMain from "./pages/PageMain";
import PageLogin from "./pages/PageLogin";
import PageAdmin from "./pages/PageAdmin";
import PageWorks from "./pages/PageWorks";
import PageError from "./pages/PageError";
import WorksArt from "./pages/works/WorksArt";
import WorksMusic from "./pages/works/WorksMusic";
import WorksVideo from "./pages/works/WorksVideo";
import WorksDoc from "./pages/works/WorksDoc";

const ACCESS_PUBLIC = 'public';
const ACCESS_PROTECTED = 'protected';

const routings = [
    {
        segment: '',
        aliases: ['main', 'home', 'crib'],
        component: <PageMain/>,
        access: ACCESS_PUBLIC,
        routes: [
            {segment: 'login', component: <PageLogin/>,},
            {segment: 'admin', component: <PageAdmin/>, access: ACCESS_PROTECTED,},
            {
                segment: 'works', component: <PageWorks/>,
                routes: [
                    {
                        segment: 'art',
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
                        aliases: ['documentary','performance'],
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
        aliases: ['curb', 'jail'],
        component: <PageError/>,
        access: ACCESS_PUBLIC,
    }
];

const history = createBrowserHistory()

export class AppRouting extends Component {

    process_path = (segments, branch) => {
        const segment = segments.shift();
        for (let i = 0; i < branch.length; i++){
            const item = branch[i];
            const aliases = item.aliases || [];
            const routes = item.routes || [];
            if (segment === item.segment || aliases.includes(segment)) {
                if (!segments.length) {
                    return item.component;
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
        return this.process_path(segments, routings);
    }
}

export default AppRouting;