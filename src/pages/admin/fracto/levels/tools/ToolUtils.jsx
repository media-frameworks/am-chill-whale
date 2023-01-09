// import React, {Component} from 'react';
// import PropTypes from 'prop-types';
// import styled from "styled-components";

const FRACTO_PHP_URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";

export class ToolUtils {

   static tile_to_bin = (short_code, from, to, cb) => {
      const url = `${FRACTO_PHP_URL_BASE}/tile_to_bin.php?from=${from}&to=${to}&short_code=${short_code}`;
      fetch(url)
         .then(response => response.json())
         .then(result => {
            cb(result)
         })
   }

}

export default ToolUtils;
