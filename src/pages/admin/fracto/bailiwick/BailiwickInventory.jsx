import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import CoolModal from "common/cool/CoolModal";
import CoolButton from "common/cool/CoolButton";
import StoreS3 from "common/StoreS3";

import {render_modal_title} from "../FractoStyles";

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 0.5rem 1rem 0;
`;

const CategoryBlock = styled(AppStyles.InlineBlock)`
   width: 30%;
   margin: 0.25rem;
   min-height: 3rem;
   border: 0.125rem solid #cccccc;
   border-radius: 0.5rem;
   padding: 0.25rem 0.5rem;
`;

const CategoryTitle = styled(AppStyles.Block)`
   ${AppStyles.uppercase}
   ${AppStyles.centered}
   ${AppStyles.underline}
   ${AppStyles.bold}
   color: #555555;
   font-size: 1.25rem;
   letter-spacing: 0.25rem;
`;

export class BailiwickInventory extends Component {

   static propTypes = {
      bailiwick_files: PropTypes.array.isRequired,
      on_response_modal: PropTypes.func.isRequired,
   }

   state = {
      loading_registries: true,
      bailiwick_index: -1,
      all_bailiwicks: []
   }

   componentDidMount() {
      const {bailiwick_files} = this.props;
      console.log("bailiwick_files", bailiwick_files)

      this.process_registries(0)

   }

   process_registries = (bailiwick_index) => {
      const {all_bailiwicks} = this.state;
      const {bailiwick_files} = this.props;

      this.setState({bailiwick_index: bailiwick_index})
      if (bailiwick_files.length === bailiwick_index) {
         this.setState({loading_registries: false});
         return;
      }

      const registry_filename = bailiwick_files[bailiwick_index].registry_filename;
      StoreS3.get_file_async(`bailiwicks/${registry_filename}`, "fracto", result => {
         let bailiwick_data = JSON.parse(result);
         bailiwick_data.registry_filename = registry_filename;
         all_bailiwicks.push(bailiwick_data);
         this.setState({all_bailiwicks: all_bailiwicks})
         this.process_registries(bailiwick_index + 1)
      })

   }

   store_now = () => {
      const {all_bailiwicks} = this.state;
      const {on_response_modal} = this.props;

      const published = all_bailiwicks.filter(b => b.published)
      const drafts = all_bailiwicks.filter(b => b.draft_created)
      const potentials = all_bailiwicks.filter(b => !b.draft_created)

      const inventory = {
         published: published.map(b => {
            const delta_x = b.core_point.x - b.octave_point.x;
            const delta_y = b.core_point.y - b.octave_point.y;
            return {
               pattern: b.pattern,
               registry_filename: b.registry_filename,
               display_settings: b.display_settings,
               core_point: b.core_point,
               octave_point: b.octave_point,
               magnitude: Math.sqrt(delta_x * delta_x + delta_y * delta_y),
               normalized: b.normalized,
               draft_created: b.draft_created,
               published: b.published,
            }
         }),
         drafts: drafts.map(b => {
            const delta_x = b.core_point.x - b.octave_point.x;
            const delta_y = b.core_point.y - b.octave_point.y;
            return {
               pattern: b.pattern,
               registry_filename: b.registry_filename,
               display_settings: b.display_settings,
               core_point: b.core_point,
               octave_point: b.octave_point,
               magnitude: Math.sqrt(delta_x * delta_x + delta_y * delta_y),
               normalized: b.normalized,
               draft_created: b.draft_created,
            }
         }),
         potentials: potentials.map(b => {
            return {
               pattern: b.pattern,
               registry_filename: b.registry_filename,
               display_settings: b.display_settings,
               image_sizes: !b.png_files ? [] : b.png_files.map(p_f => p_f.size)
            }
         })
      }

      StoreS3.put_file_async(`bailiwicks/inventory.json`, JSON.stringify(inventory), "fracto", result => {
         console.log("StoreS3.put_file_async", `bailiwicks/inventory.json`, inventory, result);
         on_response_modal();
      })
   }

   render() {
      const {loading_registries, bailiwick_index, all_bailiwicks} = this.state;
      const {on_response_modal, bailiwick_files} = this.props;
      const done_processing = bailiwick_files.length === bailiwick_index;

      const modal_title = render_modal_title("inventory all bailiwicks")
      const progress = <CenteredBlock>
         {loading_registries ? `${bailiwick_index} of ${bailiwick_files.length} bailiwicks loaded...` : "inventory complete!"}
      </CenteredBlock>

      const published = all_bailiwicks.filter(b => b.published)
      const drafts = all_bailiwicks.filter(b => b.draft_created)
      const potentials = all_bailiwicks.filter(b => !b.draft_created)
      if (done_processing) {
         console.log("published", published)
         console.log("drafts", drafts)
         console.log("potentials", potentials)
         console.log("all_bailiwicks", all_bailiwicks)
      }
      const store_now = !done_processing ? '' : <CenteredBlock>
         <CoolButton
            content={"store now"}
            primary={1}
            on_click={e => this.store_now()}
         />
      </CenteredBlock>

      const published_block = <CategoryBlock>
         <CategoryTitle>{"Published"}</CategoryTitle>
      </CategoryBlock>
      const drafts_block = <CategoryBlock>
         <CategoryTitle>{"Drafts"}</CategoryTitle>
      </CategoryBlock>
      const potentials_block = <CategoryBlock>
         <CategoryTitle>{"Potentials"}</CategoryTitle>
      </CategoryBlock>

      const inventory_contents = [
         modal_title,
         progress,
         <CenteredBlock>
            {published_block}
            {drafts_block}
            {potentials_block}
         </CenteredBlock>,
         <CenteredBlock>
            {store_now}
         </CenteredBlock>
      ]

      return <CoolModal
         width={"50%"}
         contents={inventory_contents}
         response={r => on_response_modal(r)}/>
   }
}

export default BailiwickInventory
