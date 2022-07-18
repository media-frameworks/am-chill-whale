import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import moment from 'moment';

import {AppStyles, AppColors} from "app/AppImports";
import StoreS3 from "common/StoreS3";

import TileProcessor from "./tile/TileProcessor";
import BailiwickDiscover from "./bailiwick/BailiwickDiscover";
import BailiwickFiles from "./bailiwick/BailiwickFiles";

const TitleBar = styled(AppStyles.Block)`
   background: linear-gradient(120deg, #999999, #eeeeee);
   height: 1.125rem;
   width: 100%;
   border-bottom: 0.15rem solid #666666;
`;

const TitleSpan = styled.span`
   ${AppStyles.uppercase}
   ${AppStyles.noselect}
   ${AppStyles.bold}
   font-size: 1.125rem;
   letter-spacing: 0.5rem;
   margin-left: 1rem;
   color: white;
   text-shadow: 0.01rem 0.01rem 0.2rem black;
`;

const OrderFilename = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   ${AppStyles.link}
   ${AppStyles.COOL_BLUE_TEXT};
   font-size: 1rem;   
   margin-right: 1rem;
`;

const ModifiedDate = styled.span`
   ${AppStyles.italic}
   color: #aaaaaa;
   padding-right: 1rem;
   font-size: 0.85rem;
   width: 5rem; 
`;

const OrderWrapper = styled(AppStyles.Block)`
   margin: 0.5rem 1rem;
`;

const BailiwickLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
`;

export class FractoTileFactory extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      orders: [],
      process_filename: '',
      process_tiles: [],
      discover_mode: false,
      bailiwick_values: {},
      bailiwick_files: []
   }

   componentDidMount() {
      BailiwickFiles.load_registry(bailiwick_files => {
         this.setState({bailiwick_files: bailiwick_files})
      })
      this.read_files();
   }

   read_files = () => {
      StoreS3.list_files_async("orders", "fracto", files => {
         console.log("order files", files);
         const orders = files.Contents.map(file => {
            return {
               filename: file.Key,
               modified_time: moment(file.LastModified, 'ddd MMM DD YYYY HH:mm:ss ZZ'),
               modified_str: file.LastModified.toDateString()
            }
         })
            .sort((a, b) => a.modified_time > b.modified_time ? -1 : 1)
         this.setState({orders: orders})
      })
   }

   process_order = (filename) => {
      const s3_filename = filename.replace("fracto/", "")
      StoreS3.get_file_async(s3_filename, "fracto", data => {
         const process_tiles = JSON.parse(data);
         this.setState({
            process_filename: filename,
            process_tiles: process_tiles
         })
      })
   }

   goto_bailiwick = (fracto_values) => {
      this.setState({
         discover_mode: true,
         bailiwick_values: fracto_values
      })
   }

   render() {
      const {orders, process_tiles, process_filename, discover_mode, bailiwick_values, bailiwick_files} = this.state
      const title_bar = <TitleBar><TitleSpan>tile factory</TitleSpan></TitleBar>
      const ready_orders = orders.map(order => {
         const proces_block = process_filename !== order.filename ? '' :
            <TileProcessor tiles={process_tiles}/>
         const coords = order.filename
            .replace("fracto/orders/", "")
            .replace("[", "")
            .replace("]", "")
            .replace(".json", "")
            .split(',')
         const x = parseFloat(coords[0]);
         const y = parseFloat(coords[1]);
         const filename = `${x} + ${y}i`
         const fracto_values = {
            scope: 0.025,
            focal_point: {x: x, y: y}
         }
         return [
            <OrderWrapper>
               <ModifiedDate>{order.modified_str}</ModifiedDate>
               <OrderFilename
                  onClick={e => this.process_order(order.filename)}>
                  {filename}
               </OrderFilename>
               <BailiwickLink
                  onClick={e => this.goto_bailiwick(fracto_values)}>
                  discover bailiwick
               </BailiwickLink>
            </OrderWrapper>,
            proces_block
         ]
      })
      console.log("bailiwick_values",bailiwick_values)
      const bailiwick_discover = !discover_mode ? '' : <BailiwickDiscover
         bailiwick_files={bailiwick_files}
         initial_params={bailiwick_values}
         on_response_modal={r => this.setState({discover_mode: false})}
      />
      return [
         title_bar,
         ready_orders,
         bailiwick_discover
      ]
   }
}

export default FractoTileFactory;
