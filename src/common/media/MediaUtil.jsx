import {PHI} from "../math/constants";

export class MediaUtil {

   static AR_SQUARE_KEY = '1_1';
   static AR_DSLR_KEY = '3_2';
   static AR_SDTV_KEY = '4_3';
   static AR_COMP_KEY = '5_4';
   static AR_WIDE_KEY = '16_10';
   static AR_HDTV_KEY = '16_9';
   static AR_IHDTV_KEY = '9_16';
   static AR_CINEMA_KEY = '16_9';
   static AR_PHI_KEY = '1_618';
   static AR_IPHI_KEY = '0_618';

   static ASPECT_RATIO = {
      AR_SQUARE_KEY: {label: '1:1', value: 1, help: 'Square'},
      AR_DSLR_KEY: {label: '3:2', value: 3 / 2, help: 'DSLR camera, smartphones'},
      AR_SDTV_KEY: {label: '4:3', value: 4 / 3, help: 'SDTV/video, computer displays'},
      AR_COMP_KEY: {label: '5:4', value: 5 / 4, help: 'Computer displays'},
      AR_WIDE_KEY: {label: '16:10', value: 16 / 10, help: 'Widescreens, smartphones'},
      AR_HDTV_KEY: {label: '16:9', value: 16 / 9, help: 'HDTV widescreen, smartphones'},
      AR_IHDTV_KEY: {label: '9:16', value: 9 / 16, help: 'Vertical smartphones'},
      AR_CINEMA_KEY: {label: '1.85:1', value: 1.85, help: 'Cinema film'},
      AR_PHI_KEY: {label: 'PHI:1', value: PHI, help: 'Golden ratio (horizontal)'},
      AR_IPHI_KEY: {label: '1:PHI', value: PHI - 1.0, help: 'Golden ratio (vertical)'},
   };

}

export default MediaUtil;
