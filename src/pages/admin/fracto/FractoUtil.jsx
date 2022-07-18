
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

   static fracto_pattern_color = (pattern, iterations) => {
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
   
}

export default FractoUtil;
