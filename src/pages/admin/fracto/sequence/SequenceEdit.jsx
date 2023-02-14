import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import {CoolButton, CoolModal} from "common/cool/CoolImports";
import StoreS3 from "common/StoreS3";

import {render_modal_title} from "../FractoStyles";
import FractoUtil from "../FractoUtil";
import CommonFiles from "../common/CommonFiles";
import FractoCalc from "../FractoCalc";
import FractoCommon from "../FractoCommon";

const FRAME_SIZE_256 = 256;
const FRAME_SIZE_512 = 512;
const FRAME_SIZE_768 = 768;
const FRAME_SIZE_1024 = 1024;
const ALL_FRAME_SIZES = [
   FRAME_SIZE_256,
   FRAME_SIZE_512,
   FRAME_SIZE_768,
   FRAME_SIZE_1024,
];

const S3_URL_PREFIX = "https://mikehallstudio.s3.amazonaws.com/fracto";

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
`;

const HorizontalLine = styled(AppStyles.Block)`
   ${AppStyles.centered}
   background-color: ${AppColors.HSL_COOL_BLUE};
   height: 0.1rem;
   width: 90%;
   margin: 0.5rem auto;
`;

const CanvasField = styled.canvas`
   ${AppStyles.absolute}    
   top: 10000px;
   left: 10000px;
`;

const ArchiveLink = styled(AppStyles.Block)`
   ${AppStyles.italic}
   ${AppStyles.pointer}
   color: maroon;
   font-size: 0.75rem;
   margin-left: 0.5rem;
   margin-top: 0.25rem;
   opacity: 0;
   &:hover {
      opacity: 1.0;
   }
`;

export class SequenceEdit extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      sequence_name: PropTypes.string.isRequired,
      on_change: PropTypes.func.isRequired
   }

   state = {
      in_sequence_run: false,
      sequence_registry: {},
      canvas_ref: React.createRef(),
      frame_index: -1,
      png_url: null,
      in_archive_confirm: false,
      frame_size_px: FRAME_SIZE_512
   }

   componentDidMount() {
      this.load_registry()
   }

   load_registry = () => {
      const {sequence_name} = this.props;

      const sequence_dirname = FractoUtil.get_dirname_slug(sequence_name)
      const s3_folder_path = `sequences/${sequence_dirname}`;
      CommonFiles.load_registry_json(s3_folder_path, registry => {
         console.log("CommonFiles.load_registry_json", s3_folder_path, registry)
         this.setState({sequence_registry: registry})
      });
   }

   archive_sequence = () => {
      const {sequence_registry} = this.state;
      const {on_change} = this.props;
      console.log("confirmed archive_sequence", sequence_registry.name);
      CommonFiles.load_registry_json("sequences", registry => {
         console.log("CommonFiles.load_registry_json returns", registry)
         delete (registry[sequence_registry.name]);
         CommonFiles.save_registry_json("sequences", registry, result => {
            console.log(`CommonFiles.save_registry_json returns`, result);
            on_change();
         })
      })
   }

   generate_image = (frame_index, fracto_values, data, cb) => {
      const {canvas_ref, sequence_registry, frame_size_px} = this.state;
      const {sequence_name} = this.props;

      const canvas = canvas_ref.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, frame_size_px, frame_size_px);

      const increment = fracto_values.scope / frame_size_px;
      const leftmost = fracto_values.focal_point.x - fracto_values.scope / 2;
      const bottommost = fracto_values.focal_point.y - fracto_values.scope / 2;
      for (let img_x = 0; img_x < data.length; img_x++) {
         const column = data[img_x];
         const x = leftmost + increment * img_x;
         for (let img_y = 0; img_y < column.length; img_y++) {
            const y = bottommost + increment * img_y;
            let pixel = column[img_y];
            if (!pixel.length || !pixel[1]) {
               const calculated = FractoCalc.calc(x, y);
               pixel = [calculated.pattern, calculated.iteration]
            }
            ctx.fillStyle = FractoUtil.fracto_pattern_color(pixel[0], pixel[1])
            ctx.fillRect(img_x, frame_size_px - img_y - 1, 1, 1);
         }
      }
      const blob = FractoUtil.canvas_to_blob(canvas_ref);

      const sequence_dirname = FractoUtil.get_dirname_slug(sequence_name);
      const s3_folder_prefix = `sequences/${sequence_dirname}`;
      const pad_index = String(frame_index).padStart(6, '0');
      const file_name_png = `${s3_folder_prefix}/png_${frame_size_px}/seq_${pad_index}.png`;
      StoreS3.put_file_async(file_name_png, blob, `fracto`, data => {
         console.log("StoreS3.put_file_async", file_name_png);
         this.setState({png_url: `${S3_URL_PREFIX}/${file_name_png}`})
         cb(true);

         const last_frame_index_key = `last_frame_index_${frame_size_px}`;
         sequence_registry[last_frame_index_key] = frame_index;
         CommonFiles.save_registry_json(s3_folder_prefix, sequence_registry, response => {
            console.log("CommonFiles.save_registry_json", s3_folder_prefix, sequence_registry, response)
         })
      });
   }

   render_frame = (frame_index) => {
      // const {sequence_registry, frame_size_px} = this.state;
      //
      // if (frame_index >= sequence_registry.frames.length) {
      //    this.setState({in_sequence_run: false});
      //    return;
      // }
      // this.setState({
      //    in_sequence_run: true,
      //    frame_index: frame_index
      // });
      //
      // const frame = sequence_registry.frames[frame_index];
      // FractoSieve.extract(frame.focal_point, 1.0, frame.scope, frame_size_px, result => {
      //    console.log("FractoSieve.extract", frame.focal_point, 1.0, frame.scope, frame_size_px, result);
      //    this.generate_image(frame_index, frame, result, response => {
      //       console.log("this.generate_image", response);
      //       setTimeout(() => {
      //          this.render_frame(frame_index + 1)
      //       }, 250);
      //    })
      // }, 1);
   }

   start_sequence_run = () => {
      const {sequence_registry, frame_size_px} = this.state;
      const last_frame_index_key = `last_frame_index_${frame_size_px}`;
      const frame_index = sequence_registry[last_frame_index_key] ? sequence_registry[last_frame_index_key] : 0;
      this.render_frame(frame_index);
   }

   render() {
      const {
         in_sequence_run,
         canvas_ref,
         png_url,
         frame_index,
         sequence_registry,
         in_archive_confirm,
         frame_size_px
      } = this.state;
      const {width_px, sequence_name} = this.props;

      const canvas_style = {
         width: `${frame_size_px}px`,
         height: `${frame_size_px}px`,
      };
      const image_canvas = <CanvasField
         ref={canvas_ref}
         style={canvas_style}
         width={`${frame_size_px}px`}
         height={`${frame_size_px}px`}/>

      const button_style = {margin: "0.5rem 1rem"}
      const modal_title = render_modal_title(`run sequence: ${sequence_name}`)

      const png_image = !png_url ? '' : <img src={png_url} alt={"no alt for you"}/>
      const progress_text = !sequence_registry.frames ? '' : `${frame_index + 1}/${sequence_registry.frames.length}`
      const modal_content = [
         modal_title,
         <CenteredBlock>{progress_text}</CenteredBlock>,
         <CenteredBlock>{png_image}</CenteredBlock>,
         <HorizontalLine/>,
         <CenteredBlock><CoolButton
            style={button_style}
            primary={1}
            content={"done"}
            on_click={e => this.setState({in_sequence_run: false})}/>
         </CenteredBlock>,
         image_canvas,
      ]

      const archive_link = <ArchiveLink
         onClick={e => this.setState({in_archive_confirm: true})}>
         {"archive this sequence"}
      </ArchiveLink>
      const archive_confirm = !in_archive_confirm ? '' : FractoCommon.modal_confirm(`archive "${sequence_registry.name}"?`, ["no", "yes"], r => {
         if (r === 1) {
            this.archive_sequence()
         }
         this.setState({in_archive_confirm: false})
      })

      const size_buttons = ALL_FRAME_SIZES.map(size_px => {
         const button_style = {margin: "0 0.25rem"}
         return <CoolButton
            style={button_style}
            primary={frame_size_px === size_px ? 1 : 0}
            content={size_px}
            on_click={e => this.setState({frame_size_px: size_px})}/>
      })
      const button_row = <AppStyles.Block>
         {size_buttons}
         {in_sequence_run ? '' : <CoolButton
            style={{margin: "0 1rem"}}
            primary={1}
            content={"go"}
            on_click={e => this.start_sequence_run()}/>}
      </AppStyles.Block>

      return [
         archive_link, archive_confirm,
         button_row,
         !in_sequence_run ? '' : <CoolModal
            contents={modal_content}
            width={`${width_px * 0.85}px`}
            response={r => this.setState({in_sequence_run: false})}
            settings={{no_escape: true}}/>
      ]
   }
}

export default SequenceEdit;
