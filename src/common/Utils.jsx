export class Utils {

    static animate = (ref, duration_ms, start_value, end_value, fn, not_count = 0) => {
        const count = not_count ? not_count : Math.floor(duration_ms / 40) + 2;
        const time_slice = duration_ms / count;
        const value_delta = (end_value - start_value) / count;
        let so_far = 0;
        const interval = setInterval(() => {
            const value = start_value + so_far * value_delta;
            if (!ref.current) {
                console.log("animate, ref.current is null")
                clearInterval(interval);
                return;
            } else {
                fn(value, so_far === count);
            }
            if (so_far === count) {
                clearInterval(interval);
                return;
            }
            so_far++;
        }, time_slice);
        return interval;
    }

    static text_to_slug(str) {
        return str.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }

}

export default Utils;
