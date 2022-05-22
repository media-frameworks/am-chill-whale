import ReactTimeAgo from 'react-time-ago';

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

   static time_ago = (str) => {
      if (!str) {
         return "in the past";
      }
      return <ReactTimeAgo date={Date.parse(str)}/>;
   }

   static now_string = (str) => {
      const d = new Date();
      return d.toISOString();
   }

   static random_int = (limit = 100000) => {
      return Math.floor(Math.random() * limit);
   }
   
   static random_id() {
      return 'id_' + Math.floor(Math.random() * 10000000);
   }

   static json_to_csv = (json) => {
      const keys = Object.keys(json[0]);
      const header = keys.join(',');
      return header + "\n" + json.map(obj => keys.map(key => obj[key]).join(',')).join("\n");
   }

   static shuffle(list) {
      return list.map((a) => ({sort: Math.random(), value: a}))
         .sort((a, b) => a.sort - b.sort)
         .map((a) => a.value)
   }

   preventDefault = (e) => {
      e = e || window.event;
      if (e.preventDefault)
         e.preventDefault();
      e.returnValue = false;
   }

}

export default Utils;
