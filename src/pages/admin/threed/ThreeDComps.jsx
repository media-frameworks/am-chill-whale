
import CompSmoothPath from "./comps/CompSmoothPath";

export class ThreeDComps {

    static THREED_SMOOTH_PATH = "smooth_path";

    static get_comps_map = () => {
        let comps_map = {};
        comps_map[ThreeDComps.THREED_SMOOTH_PATH] = CompSmoothPath;
        return comps_map;
    };
}

export default ThreeDComps;

