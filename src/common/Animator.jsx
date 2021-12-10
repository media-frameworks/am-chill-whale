
export class Animator {

    static fluid_path = (steps, per_step_count = 25) => {
        if (!Array.isArray(steps)) {
            console.warn("steps must be an array", steps);
            return [];
        }
        switch (steps.length) {
            case 0:
            case 1:
                console.warn("must be two or more steps", steps.length);
                return [];
            case 2:
                return Animator.path_2_steps(steps, per_step_count);
            default:
                console.warn("too many steps", steps.length);
                return [];
        }
    }

    path_2_steps = (steps, per_step_count) => {

    }

}

export default Animator;
