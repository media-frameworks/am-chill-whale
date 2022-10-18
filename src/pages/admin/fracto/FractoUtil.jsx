import styled from "styled-components";

const EPSILON = 0.0000000001;

export const DEFAULT_FRACTO_VALUES = {
   scope: 2.5,
      focal_point: {x: -.75, y: 0.771}
};

const HighlightBox = styled.div`
   position: fixed;
   border: 1px solid white;
   pointer-events: none;
`;

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

   static fracto_relative_harmonic = (root, pattern) => {
      const ratio = pattern / root;
      return Math.abs(Math.round(ratio) - ratio) < EPSILON ? ratio : 0;
   }

   static fracto_pattern_octave = (pattern) => {
      let octave = 0;
      let reduction = pattern;
      while (reduction % 2 === 0) {
         reduction = Math.round(reduction / 2);
         octave++;
      }
      return octave;
   }

   static fracto_designation = (root, pattern, short_form = false) => {
      let relative_harmonic = FractoUtil.fracto_relative_harmonic (root, pattern);
      if (0 === relative_harmonic) {
         return short_form ? "h0" : "non-harmonic"
      }
      const pattern_octave = FractoUtil.fracto_pattern_octave(relative_harmonic);
      if (0 === pattern_octave) {
         if (1 === relative_harmonic) {
            return short_form ? `r${root}` : `root ${root}`
         }
         return short_form ? `r${root},h${relative_harmonic}` : `root ${root}, harmonic ${relative_harmonic}`;
      }
      for (let i = 0; i < pattern_octave; i++) {
         relative_harmonic = Math.round(relative_harmonic / 2);
      }
      if (relative_harmonic === 1) {
         if (1 === pattern_octave) {
            return short_form ? `r${root},o1` : `root ${root} octave`
         }
         return short_form ? `r${root},o${pattern_octave}` : `root ${root}, octave ${pattern_octave}`;
      }
      return  short_form ? `r${root},h${relative_harmonic},o${pattern_octave}` : `root ${root}, harmonic ${relative_harmonic}, octave ${pattern_octave}`;
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

   static highlight_points = (image_ref, fracto_values, point_highlights) => {
      if (!image_ref.current || !point_highlights.length) {
         return [];
      }

      const aspect_ratio = 1.0
      const image_bounds = image_ref.current.getBoundingClientRect();
      const scope_x_by_2 = fracto_values.scope / 2;
      const scope_y_by_2 = aspect_ratio * scope_x_by_2;
      const leftmost = fracto_values.focal_point.x - scope_x_by_2;
      const topmost = fracto_values.focal_point.y + scope_y_by_2;

      return point_highlights.map(point_highlight => {

         if (point_highlight.x < leftmost || point_highlight.x > leftmost + fracto_values.scope) {
            return [];
         }
         if (point_highlight.y > topmost || point_highlight.y < topmost - fracto_values.scope * aspect_ratio) {
            return [];
         }
         const img_x = image_bounds.width * (point_highlight.x - leftmost) / fracto_values.scope - 1
         const img_y = image_bounds.width * (topmost - point_highlight.y) / (fracto_values.scope * aspect_ratio) - 1

         const highlight_outline_1 = {
            left: image_bounds.left + img_x - 5,
            top: image_bounds.top + img_y - 5,
            width: 10,
            height: 10,
         }
         const highlight_outline_2 = {
            left: image_bounds.left + img_x - 10,
            top: image_bounds.top + img_y - 10,
            width: 20,
            height: 20,
         }
         const highlight_outline_3 = {
            left: image_bounds.left + img_x - 15,
            top: image_bounds.top + img_y - 15,
            width: 30,
            height: 30,
         }
         return [
            <HighlightBox style={highlight_outline_1}/>,
            <HighlightBox style={highlight_outline_2}/>,
            <HighlightBox style={highlight_outline_3}/>,
         ]
      })
   }
}

export default FractoUtil;
