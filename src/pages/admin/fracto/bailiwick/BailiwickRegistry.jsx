import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import CoolTabs from "common/cool/CoolTabs";
import CoolGrid from "common/cool/CoolGrid";

import FractoLocate from "../FractoLocate";
import {render_title_bar, render_main_link, render_pattern_block} from "../FractoStyles";
import CommonFiles from "../common/CommonFiles";

import BailiwickDiscover from "./BailiwickDiscover";
import BailiwickInventory from "./BailiwickInventory";
import BailiwickEdit from "./BailiwickEdit";
import BailiwickFiles from "./BailiwickFiles";
import BailiwickDraft from "./BailiwickDraft";

const POTENTIALS_GRID_COLUMNS = [
   {label: "#", key: "pattern", width_rem: 3},
   {label: "location", key: "location", width_rem: 23},
   {label: "scope", key: "scope", width_rem: 12},
   {label: "image sizes", key: "sizes", width_rem: 14},
   {label: "extra", key: "extra", width_rem: 8},
]

const DRAFTS_GRID_COLUMNS = [
   {label: "#", key: "pattern", width_rem: 3},
   {label: "location", key: "location", width_rem: 23},
   {label: "scope", key: "scope", width_rem: 12},
   {label: "normalized", key: "normalized", width_rem: 16},
   {label: "extra", key: "extra", width_rem: 8},
]

const BailiwicksWrapper = styled(AppStyles.Block)`
   margin: 0.5rem 1rem;
`;

const GridWrapper = styled(AppStyles.Block)`
   margin: 1rem;
`;

const EditWrapper = styled(AppStyles.Block)`
   margin: 0 1rem;
`;

const SizesListing = styled.span`
   ${AppStyles.monospace}
   font-size: 0.80rem;
   color: #333333;
`;

const CenteredColumn = styled(AppStyles.Block)`
   ${AppStyles.centered}
`;

const ItemLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   ${AppColors.COLOR_COOL_BLUE}
`;

export class BailiwickRegistry extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      discover_mode: false,
      bailiwick_files: [],
      editing_bailiwick: null,
      inventory_mode: false,
      inventory: [],
      inventory_loaded: false,
      selected_potential: -1,
      selected_draft: -1
   }

   componentDidMount() {
      this.load_registry();
      this.load_inventory();
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      // this.load_registry();
   }

   load_registry = () => {
      BailiwickFiles.load_registry(bailiwick_files => {
         this.setState({bailiwick_files: bailiwick_files})
      })
   }

   load_inventory = () => {
      CommonFiles.load_json_file("bailiwicks", "inventory.json", inventory => {
         console.log("CommonFiles.load_json_file", "bailiwicks", "inventory.json", inventory)
         this.setState({
            inventory: inventory,
            inventory_loaded: true
         })
      })
   }

   response_modal = (r) => {
      console.log("response_modal", r);
      this.setState({discover_mode: false});
   }

   fill_potentials_data = (bal) => {
      let data = {};
      const pattern_block = render_pattern_block(bal.pattern);
      data["pattern"] = <CenteredColumn>{pattern_block}</CenteredColumn>
      if (bal.display_settings) {
         data["location"] = FractoLocate.render_coordinates(
            bal.display_settings.focal_point.x, bal.display_settings.focal_point.y);
         data["scope"] = <SizesListing>{bal.display_settings.scope}</SizesListing>;
      }
      if (bal.image_sizes) {
         data["sizes"] = <SizesListing>{`[${bal.image_sizes.join(',')}]`}</SizesListing>;
      }
      if (bal.normalized) {
         data["normalized"] = <SizesListing>{bal.normalized}</SizesListing>;
      }
      return data;
   }

   render() {
      const {
         bailiwick_files,
         discover_mode, inventory_mode,
         inventory, inventory_loaded,
         selected_potential, selected_draft
      } = this.state;
      const {width_px} = this.props;

      const title_bar = render_title_bar("registry of bailiwicks");

      const discover_link = render_main_link("new bailiwick", e => this.setState({discover_mode: true}));
      const discover_modal = !discover_mode ? '' : <BailiwickDiscover
         bailiwick_files={bailiwick_files}
         on_response_modal={r => this.response_modal(r)}/>;

      const inventory_link = render_main_link("take inventory", e => this.setState({inventory_mode: true}));
      const inventory_modal = !inventory_mode ? '' : <BailiwickInventory
         bailiwick_files={bailiwick_files}
         on_response_modal={r => this.setState({inventory_mode: false})}/>;

      const potentials = !inventory_loaded ? [] : inventory.potentials
         .sort((a, b) => {
            if (a.display_settings && b.display_settings) {
               return b.display_settings.scope - a.display_settings.scope;
            }
            if (a.display_settings) {
               return -1;
            }
            return 1;
         })
         .map((bal, i) => {
            let data = this.fill_potentials_data(bal);
            data["extra"] = <ItemLink
               onClick={e => this.setState({selected_potential: i === selected_potential ? -1 : i})}>
               {"edit"}
            </ItemLink>
            if (i === selected_potential) {
               data["row_expanded"] = <EditWrapper><BailiwickEdit
                  registry_filename={bal.registry_filename}
                  width_px={width_px - 120}/>
               </EditWrapper>
            }
            return data;
         })

      const drafts = !inventory_loaded ? [] : inventory.drafts
         .sort((a, b) => b.display_settings.scope - a.display_settings.scope)
         .map((bal, i) => {
            let data = this.fill_potentials_data(bal);
            data["extra"] = <ItemLink
               onClick={e => this.setState({selected_draft: i === selected_draft ? -1 : i})}>
               {"edit"}
            </ItemLink>
            if (i === selected_draft) {
               data["row_expanded"] = <EditWrapper><BailiwickDraft
                  registry_filename={bal.registry_filename}
                  width_px={width_px - 120}/>
               </EditWrapper>
            }
            return data;
         })

      const category_tabs = [
         {
            label: !inventory_loaded ? "potentials" : `potentials (${inventory.potentials.length})`,
            content: <GridWrapper><CoolGrid
               columns={POTENTIALS_GRID_COLUMNS}
               data={potentials}/>
            </GridWrapper>
         },
         {
            label: !inventory_loaded ? "drafts" : `drafts (${inventory.drafts.length})`,
            content: <GridWrapper><CoolGrid
               columns={DRAFTS_GRID_COLUMNS}
               data={drafts}/>
            </GridWrapper>
         },
         {
            label: !inventory_loaded ? "published" : `published (${inventory.published.length})`,
            content: "published list"
         },
      ];

      const bailiwicks_syle = {width: `${width_px - 70}px`}
      return [
         title_bar,
         discover_link, discover_modal,
         inventory_link, inventory_modal,
         <BailiwicksWrapper
            style={bailiwicks_syle}>
            <CoolTabs tab_data={category_tabs}/>
         </BailiwicksWrapper>
      ]
   }
}

export default BailiwickRegistry;
