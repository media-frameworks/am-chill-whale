
export const DEFAULT_FRACTO_VALUES = {
   scope: 2.5,
      focal_point: {x: -.75, y: 0.771}
};

export class FractoUtil {

   static get_short_code = (long_code) => {
      return long_code
         .replaceAll('11', '3')
         .replaceAll('10', '2')
         .replaceAll('01', '1')
         .replaceAll('00', '0')
         .replaceAll('-', '')
   }

   static get_dirname_slug = (name) => {
      return name
         .toLowerCase()
         .trim()
         .replace(/[^\w\s-]/g, '')
         .replace(/[\s_-]+/g, '-')
         .replace(/^-+|-+$/g, '');
   }

   static fracto_pattern_family = (pattern) => {
      if (pattern < 2) {
         return pattern;
      }
      let result = pattern;
      while (result % 2 === 0) {
         result /= 2;
      }
      return result;
   }

   static fracto_pattern_color = (pattern, iterations = 255) => {
      if (pattern === -1) {
         return 'black'
      }
      if (pattern === 0) {
         const lum = 1.0 - Math.log(iterations) / Math.log(10000);
         return `hsl(0, 0%, ${Math.round(100 * lum)}%)`;
      }

      const log2 = Math.log2(pattern);
      const hue = pattern ? 360 * (log2 - Math.floor(log2)) : 0;
      const lum = 0.15 + 0.75 * Math.log(iterations) / Math.log(1000000);

      return `hsl(${Math.round(hue)}, 75%, ${Math.round(100 * lum)}%)`;
   }

   dataURItoBlob = (dataURI) => {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for (var i = 0; i < binary.length; i++) {
         array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
   }

   static canvas_to_blob = (canvas_ref, type = "image/png") => {
      const canvas = canvas_ref.current;
      if (!canvas) {
         return null;
      }
      const dataUrl = canvas.toDataURL(type);
      const binary = atob(dataUrl.split(',')[1]);
      let array = [];
      for (var i = 0; i < binary.length; i++) {
         array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: type});
   }

   static get_pattern_lists = (data) => {

      let all_patterns = {};
      for (let img_x = 0; img_x < data.length; img_x++) {
         const column = data[img_x];
         for (let img_y = 0; img_y < column.length; img_y++) {
            const pixel = column[img_y];
            const pattern = pixel[0];
            const pattern_key = `_${pattern}`;
            if (!all_patterns[pattern_key]) {
               all_patterns[pattern_key] = 1;
            } else {
               all_patterns[pattern_key] += 1;
            }
         }
      }

      let all_families = {}
      Object.keys(all_patterns).forEach(pattern_key => {
         const pattern = parseInt(pattern_key.replace('_', ''));
         const family = FractoUtil.fracto_pattern_family(pattern)
         const family_key = `_${family}`;
         if (!all_families[family_key]) {
            all_families[family_key] = [];
         }
         all_families[family_key].push({
            pattern: pattern,
            amount: all_patterns[pattern_key]
         })
      });

      const total_size = data.length * data.length;
      return Object.keys(all_families).map(key => {
         const family = parseInt(key.replace('_', ''));
         let total_amount = 0;
         const pattern_list = all_families[key].map(member => {
            total_amount += member.amount;
            return member.pattern;
         }).sort((a, b) => a - b);
         return {
            family: family,
            total_amount: total_amount,
            total_amount_pct: Math.floor(100000 * total_amount / total_size) / 1000.0,
            color: FractoUtil.fracto_pattern_color(family),
            all_patterns: pattern_list,
            members: all_families[key].sort((a, b) => a.pattern - b.pattern),
         }
      }).sort((a,b) => a.family - b.family)
   }
}

export default FractoUtil;
