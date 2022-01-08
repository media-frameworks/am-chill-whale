import vimeo_auth from "../../config/vimeo.json";

var Vimeo = require('vimeo').Vimeo;

export function check_vimeo_auth() {

   const query_parms = window.location.href.split("?#").pop();
   const all_queries = query_parms.split("&");
   let vimeo_access_token = 0;
   let vimeo_access_token_timestamp = 0;
   let vimeo_access_scope = 0;
   all_queries.forEach(query => {
      const name_value = query.split('=');
      if (name_value[0] === 'access_token') {
         vimeo_access_token = name_value[1];
      }
      if (name_value[0] === 'scope') {
         vimeo_access_scope = name_value[1];
      }
   })

   if (vimeo_access_token) {
      console.log("vimeo_access_token", vimeo_access_token);
      console.log("vimeo_access_scope", vimeo_access_scope);
      localStorage.setItem("vimeo_access_token", vimeo_access_token)
      localStorage.setItem("vimeo_access_token_timestamp", Date.now())
   } else {
      vimeo_access_token_timestamp = localStorage.getItem("vimeo_access_token_timestamp", null);
      const now = Date.now();
      if (now - vimeo_access_token_timestamp < 3600000) {
         vimeo_access_token = localStorage.getItem("vimeo_access_token", null);
      }
      else {
         console.log("refreshing vimeo after", now - vimeo_access_token_timestamp)
      }
   }
   if (vimeo_access_token) {
      var vimeo_client = new Vimeo(
         vimeo_auth.VIMEO_USER_ID,
         vimeo_auth.VIMEO_CLIENT_SECRET,
         vimeo_access_token);

      console.log("VIMEO CLIENT HERE", vimeo_client)
      if (vimeo_client) {
         return vimeo_client;
      }
   }

   const scope = "private public create edit video_files"
   const redirect_uri = "http://dev.mikehallstudio.com:3000/admin"
   window.location.href = `https://api.vimeo.com/oauth/authorize?response_type=token&scope=${scope}&client_id=${vimeo_auth.VIMEO_CLIENT_IDENTIFIER}&redirect_uri=${redirect_uri}&state=am-chill-whale`
}