/*************************************************************************************
 *  Office of Waters
 *  WATERS (Watershed Assessment, Tracking & Environmental ResultS) JavaScript Library
 *  More information: www.epa.gov/waters
 ************************************************************************************/ 

/* Note that jQuery is a requirement!! */ 

if (WATERS.Helpers == null || typeof(WATERS.Helpers) != "object") { 
   WATERS.Helpers = new Object();
}
WATERS.Helpers.jQuery = {};  //avoid multiple JQuery instances
WATERS.Helpers.jQuery = WATERS.Utilities.jQuery.noConflict(true); //avoid multiple JQuery instances

/*************************************************************************************
 *  Method:       WATERS.Utilities.GetFieldValue
 *  Description:  Function to return the value of varied HTML form elements
 ************************************************************************************/

WATERS.Helpers.GetFieldValue = function(id, suffix, default_val) {
   var field = document.getElementById(id);
   var return_value;
           
   if (field.type == 'checkbox') {
      return_value = field.checked ? true : false;
   } else if ( field.type == 'radio') {
      var checkboxes = document.getElementsByName(id);
      for(var i = 0; i < checkboxes.length; i++) {
         if (checkboxes[i].checked) {
            return_value = checkboxes[i].value;
         }
      }
      if ( return_value == null && default_val !== undefined) {
         return_value = default_val;
      }
   } else if (field.type == "select-multiple") {
      if ( $("#"+id).val() == null ) {
         if ( default_val !== undefined ) {
            return_value = default_val;
         } else {
            return_value = '';
         }
      } else {
         return_value = '';
         var items = document.getElementById(id);
         for(var i = 0; i < items.options.length; i++) {
            if (items.options[i].selected == true ) {
               if ( items.options[i].value == '' ) {
                  null;
               } else {
                  return_value += items.options[i].value + ',';
               }
            }
         }
         return_value = return_value.slice(0, -1);
      }
   } else {
      return_value = field.value;
   }
   return return_value != '' && suffix != undefined ? return_value + '' + suffix : return_value;
};

 /*************************************************************************************
 *  Method:       WATERS.Utilities.ParseURLParameters
 *  Description:  Function to return parameters as a hash
 ************************************************************************************/

WATERS.Helpers.ParseURLParameters = function(hrefval) {
   var qsParm = new Array();
   var pieces = hrefval.split('?');
   if ( pieces.length != 2 ) {
      return qsParm;
   }
   var parms = pieces[1].replace('&#38;amp;','&').split('&');
   for (var i=0; i<parms.length; i++) {
      var pos = parms[i].indexOf('=');
      if (pos > 0) {
         var key = parms[i].substring(0,pos);
         var val = parms[i].substring(pos+1);
         qsParm[key] = unescape(val);
      }
   }
   return qsParm;
};
 
/*************************************************************************************
 *  Method:       WATERS.Helpers.GetProgramHash 
 *  Description:  Common Public RAD programs
 ************************************************************************************/

WATERS.Helpers.GetProgramHash = function(keyword) { 
   var program_list = new Array();
   
   program_list = {
       '10001' : '303(d) Listed Impaired Waters'
      ,'10002' : '305(b) Assessed Waters'
      ,'10003' : 'Beaches'
      ,'10006' : 'Clean Watersheds Needs Survey'
      ,'10009' : 'Fish Consumption Advisories'
      ,'10010' : 'Fish Tissue Data'
      ,'10011' : 'Nonpoint Source Projects'
      ,'10012' : 'STORET Water Monitoring Locations'
      ,'10015' : 'Facilities that Discharge to Water'
      ,'10018' : 'TMDLs on Impaired Waters'
   };
   
   return program_list;    
}

/*************************************************************************************
 *  Method:       WATERS.Helpers.AddProgramNameToSelect 
 *  Description:  Add Common Public RAD programs to list
 ************************************************************************************/

WATERS.Helpers.AddProgramNameToSelect = function(select_form,keyword) { 

   var program_list = WATERS.Helpers.GetProgramHash(keyword);
   
   for (var program_abbr in program_list) {
      var insertion = new Option(program_list[program_abbr],program_abbr);
      insertion.title = program_abbr + " - " + program_list[program_abbr];
      select_form.add(insertion);
   }
   
   return true;
    
};


/*************************************************************************************
 *  Method:       WATERS.Helpers.Abbr2Program 
 *  Description:  Quick conversion of Program Abbreviation to Full Official Program Name
 ************************************************************************************/

WATERS.Helpers.Abbr2Program = function(program_abbr) { 
   
   if ( program_abbr == undefined ) {
      return '';
   }
   
   var program_hash = WATERS.Helpers.GetProgramHash();
   
   if (program_hash[program_abbr.toUpperCase()]) {
      return '<div title="' + program_abbr.toUpperCase() + '">' + program_hash[program_abbr.toUpperCase()] + '</div>';
   } else {
      return program_abbr;  
   }
   
};

/*************************************************************************************
 *  Method:       WATERS.Helpers.Program2Abbr
 *  Description:  Quick conversion of Program Abbreviation to Full Official Program Name
 ************************************************************************************/

WATERS.Helpers.Program2Abbr = function(program_name) { 
   
   if ( program_name == undefined ) {
      return '';
   }
   
   var program_hash = WATERS.Helpers.GetProgramHash();
   
   for ( program_abbr in program_hash ) {
      if ( program_hash[program_abbr] == program_name ) {
         return '<div title="' + program_name + '">' + program_abbr + '</div>';
      }  
   }
   
   return program_name;  
   
};

/*************************************************************************************
 *  Method:       WATERS.Helpers.GetStateHash 
 *  Description:  Common Public RAD programs
 ************************************************************************************/

WATERS.Helpers.GetStateHash = function(keyword) { 
   var states_list = new Array();
   states_list = {
      'AK' : 'Alaska',
      'AL' : 'Alabama',
      'AR' : 'Arkansas',      
      'AZ' : 'Arizona',
      'CA' : 'California',
      'CO' : 'Colorado',
      'CT' : 'Connecticut',
      'DC' : 'District of Columbia',
      'DE' : 'Delaware',
      'FL' : 'Florida',
      'GA' : 'Georgia',
      'HI' : 'Hawaii',
      'IA' : 'Iowa',
      'ID' : 'Idaho',
      'IL' : 'Illinois',
      'IN' : 'Indiana',
      'KS' : 'Kansas',
      'KY' : 'Kentucky',
      'LA' : 'Louisiana',
      'MA' : 'Massachusetts',
      'MD' : 'Maryland',
      'ME' : 'Maine',
      'MI' : 'Michigan',
      'MN' : 'Minnesota',
      'MO' : 'Missouri',
      'MS' : 'Mississippi',
      'MT' : 'Montana',
      'NC' : 'North Carolina',
      'ND' : 'North Dakota',
      'NE' : 'Nebraska',
      'NH' : 'New Hampshire',
      'NJ' : 'New Jersey',
      'NM' : 'New Mexico',
      'NV' : 'Nevada',
      'NY' : 'New York',
      'OH' : 'Ohio',
      'OK' : 'Oklahoma',
      'OR' : 'Oregon',
      'PA' : 'Pennsylvania',
      'PR' : 'Puerto Rico',
      'RI' : 'Rhode Island',
      'SC' : 'South Carolina',
      'SD' : 'South Dakota',
      'TN' : 'Tennessee',
      'TX' : 'Texas',
      'UT' : 'Utah',
      'VA' : 'Virginia',
      'VI' : 'Virgin Islands',
      'VT' : 'Vermont',
      'WA' : 'Washington',
      'WI' : 'Wisconsin',
      'WV' : 'West Virginia',
      'WY' : 'Wyoming'
   };
   
   var terr_list = new Array();
   terr_list = {
      'AS' : 'American Samoa',
      'GU' : 'Guam',
      'MP' : 'Commonwealth of the Northern Mariana Islands'
   };

   return states_list;    
}

/*************************************************************************************
 *  Method:       WATERS.Helpers.AddStatesToSelect 
 *  Description:  Add US State names to list
 ************************************************************************************/

WATERS.Helpers.AddStatesToSelect = function(select_form,keyword) { 

   var states_list = WATERS.Helpers.GetStateHash(keyword);
   
   for (var state_abbr in states_list) {
      var insertion = new Option(states_list[state_abbr],state_abbr);
      insertion.title = state_abbr;
      select_form.add(insertion);
   }
   
   return true;
    
};

/*************************************************************************************
 *  Method:       WATERS.Helpers.Abbr2State 
 *  Description:  Quick conversion of State Abbreviation to friendly full name
 ************************************************************************************/

WATERS.Helpers.Abbr2State = function(state_abbr) { 
   
   if (state_abbr == undefined ) {
      return ''
   }
   
   var state_hash = WATERS.Helpers.GetStateHash();
   
   if (state_hash[state_abbr.toUpperCase()]) {
      return '<div title="' + state_abbr.toUpperCase() + '">' + state_hash[state_abbr.toUpperCase()] + '</div>';
   } else {
      return state_abbr;  
   }
   
};

/*************************************************************************************
 *  Method:       WATERS.Helpers.State2Abbr
 *  Description:  Quick conversion of State full name to official abbreviation
 ************************************************************************************/

WATERS.Helpers.State2Abbr = function(state_name) { 
   
   if (state_name == undefined ) {
      return ''
   }
   
   var state_hash = WATERS.Helpers.GetStateHash();
   
   for ( state_abbr in state_hash ) {
      if ( state_hash[state_abbr] == state_name ) {
         return state_abbr;
      }  
   }
   
   return state_name;  
   
};

/*************************************************************************************
 *  Method:       WATERS.Helpers.AddNavTypesToSelect 
 *  Description:  Add Common Public RAD programs to list
 ************************************************************************************/

WATERS.Helpers.AddNavTypesToSelect = function(select_form,keyword) { 

   var navtype_list   = new Array();
   var navtype_titles = new Array();
   
   navtype_list = {
      'UT' : 'Upstream with Tributaries',
      'UM' : 'Upstream Main Path Only',
      'DD' : 'Downstream with Divergences',
      'DM' : 'Downstream Main Path Only',
      'PP' : 'Point to Point'
   };
   
   navtype_titles = {
      'UT' : 'Upstream with Tributaries',
      'UM' : 'Upstream Main Path Only',
      'DD' : 'Downstream with Divergences',
      'DM' : 'Downstream Main Path Only',
      'PP' : 'Point to Point'
   };
   
   if ( keyword == 'WATERSKMZ' ) {
      delete navtype_list['PP'];
   }
   
   for (var navtype_key in navtype_list) {
      var insertion = new Option(navtype_list[navtype_key],navtype_key);
      insertion.title = navtype_titles[navtype_key];
      select_form.options[select_form.length] = insertion;
   }
   
   return true;
    
};

/*************************************************************************************
 *  Object:       WATERS.Helpers.GetBaseURL
 *  Description:  Function to return the base url
 ************************************************************************************/

WATERS.Helpers.GetBaseURL = function() {
  
   var url = location.href;
   var baseURL = url.substring(0, url.indexOf('/', 14));

   if (baseURL.indexOf('http://localhost') != -1) {
      // Base Url for localhost
      var url = location.href;  // window.location.href;
      var pathname = location.pathname;  // window.location.pathname;
      var index1 = url.indexOf(pathname);
      var index2 = url.indexOf("/", index1 + 1);
      var baseLocalUrl = url.substr(0, index2);

      return baseLocalUrl + "/";
   } else {
      // Root Url for domain name
      return baseURL + "/";
   }

}

/*************************************************************************************
 *  Object:       WATERS.Helpers.GetBaseURL
 *  Description:  Function to return the base url
 ************************************************************************************/

WATERS.Helpers.GetWATERSURL = function() {
  
   var baseURL = WATERS.Helpers.GetBaseURL();
   var defaultURL = 'https://www.epa.gov/';

   if ( baseURL.slice(-13) == '.appspot.com/' )
      return defaultURL;
   else if ( baseURL.slice(-9) == '.epa.gov/' ) 
      return defaultURL;
   else if ( baseURL.slice(-12) == '.jshell.net/' ) 
      return defaultURL;
   else if ( baseURL.slice(-12) == '.codepen.io/' ) 
      return defaultURL;
   else if ( baseURL.slice(-11) == '.jsbin.com/' ) 
      return defaultURL;
   
   return baseURL;

}

/*************************************************************************************
 *  Object:       WATERS.Helpers.FetchWaitingImage
 *  Description:  Function to return url of image given a keyword value
 ************************************************************************************/

WATERS.Helpers.FetchWaitingImage = function(keyword) {
    
    var results;
    var str_keyword = keyword.toLowerCase();
    
    if ( str_keyword.slice(-4) == '.gif' || str_keyword.slice(-4) == '.png' || str_keyword.slice(-4) == '.jpg' ) {
       ;
    } else {
       str_keyword = str_keyword + '.gif';
    }
    
    if ( str_keyword.slice(0,7) == 'https://' ) {
       results = str_keyword;
    } else {
       results = WATERS.Helpers.GetWATERSURL() + 'waters/styles/waiting/' + str_keyword; 
    }
   
    return results;

}; 

/*************************************************************************************
 *  Object:       WATERS.Helpers.SearchingDialog
 *  Description:  Function to create the waiting for searching dialogue
 ************************************************************************************/

WATERS.Helpers.SearchingDialog = function(str_image,str_text,num_width,num_height,str_divid) {
   
   //-------------------------------------------------------------------
   // Step 10
   // Add default values to any parameters submitted empty
   //-------------------------------------------------------------------
   if ( str_image == undefined || str_image == null ) {
      str_image = "generic_spinner";
   }
   
   if ( str_text == undefined || str_text == null) {
      str_text = "Searching...";
   }
   
   if ( num_width == undefined || num_width == null || num_width == '') {
      num_width = '300';
   }
   
   if ( num_height == undefined || num_height == null || num_height == '') {
      num_height = '120';  
   }
   
   if ( str_divid == undefined || str_divid == null || str_divid == '') {
      str_divid = "dz_dialog";
   }
   
   //-------------------------------------------------------------------
   // Step 20
   // Set the object attributes
   //-------------------------------------------------------------------
   this.str_image  = str_image;
   this.str_text   = str_text;
   this.num_width  = parseFloat(num_width);
   this.num_height = parseFloat(num_height);
   this.str_divid  = str_divid;
   
   //-------------------------------------------------------------------
   // Step 30
   // Add the div to contain the dialog box to the document body
   // if does not exist already
   //-------------------------------------------------------------------
   var $div = $("#" + str_divid);
   $div = $div.length && $div || $("<div id='" + str_divid + "'></div>").appendTo("body"); 
   
   //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   this.build_dialog = function() {
      
      //-------------------------------------------------------------------
      // Step 10
      // Load the contents of the div
      //-------------------------------------------------------------------
      var str_html;
      
      str_html = 
      "<table border='0'>" +
      "   <tr>" +
      "      <td valign='top' align='left'>";
      
      if ( this.str_image !== null && this.str_image != '') { 
         str_html += "<img src='" + WATERS.Helpers.FetchWaitingImage(this.str_image) + "' />";
      }
      
      str_html +=
      "      </td>" +
      "      <td valign='top' align='left'>";
      
      if ( this.str_text.substr(0,1) == '<' ) {
         str_html += this.str_text;
      } else {
         str_html += "<h2>&nbsp;&nbsp;&nbsp;" + this.str_text + "</h2>";
      }
      
      str_html +=
      "      </td>" + 
      "   </tr>" + 
      "</table>";
      
      $("#" + this.str_divid).html(str_html);
   
      //-------------------------------------------------------------------
      // Step 20
      // Create the dialog object
      //-------------------------------------------------------------------
      $("#" + this.str_divid).dialog({
         autoOpen: false,
         bgiframe: true,
         modal: true,
         resizable: false,
         closeOnEscape: false,
         open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); }
      });
      
      //-------------------------------------------------------------------
      // Step 30
      // Force the height and width
      //-------------------------------------------------------------------
      $("#" + this.str_divid).data("width.dialog", this.num_width).data("height.dialog", this.num_height);
      $("#" + this.str_divid).data("minWidth.dialog", this.num_width).data("minHeight.dialog", this.num_height);
   }
   
   //-------------------------------------------------------------------
   // Step 40
   // Build a new dialog
   //-------------------------------------------------------------------
   this.build_dialog();
   
   //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   this.show = function() {
      $("#" + this.str_divid).dialog( 'open' );
   }
   
   //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   this.hide = function() {
      $("#" + this.str_divid).dialog( 'close' );
   }
   
};

/*************************************************************************************
 *  Object:       WATERS.Helpers.IframeSubmit
 *  Description:  Function to submit parameters to a url returning KML in an iframe
 ************************************************************************************/

WATERS.Helpers.IframeSubmit = function(hash_parameters,str_url,before_callback,after_callback) {
   
   //-------------------------------------------------------------------
   // Step 10
   // Check over incoming parameters
   //-------------------------------------------------------------------
   var str_iframeid = "dz_iframe";
   
   if ( typeof(before_callback) === 'function' ) {
      alert('ERROR, please provide before callback as text string rather than function pointer!');
      return false;
   }
   
   if ( typeof(after_callback) === 'function' ) {
      alert('ERROR, please provide after callback as text string rather than function pointer!');
      return false;
   }
   
   //-------------------------------------------------------------------
   // Step 20
   // Add the iframe to page body if it does not already exist
   //-------------------------------------------------------------------
   var $iframe = $("#" + str_iframeid);
   if ($iframe.length) {
      $iframe.remove();
   }
   $("<iframe id='" + str_iframeid + "' width=0 height=0></iframe>").appendTo("body");
   
   //-------------------------------------------------------------------
   // Step 30
   // Convert hash into url-escaped parameters and build submission string
   //-------------------------------------------------------------------
   var str_submission;
   if (hash_parameters == undefined || hash_parameters == null ) {
      str_submission = str_url;
   } else {
      var str_parameters = jQuery.param(hash_parameters);
      
      if ( str_url.slice(-1) == '/' ) {
         str_submission = str_url.slice(0,str_url.length-1) + '?' + str_parameters;
      } else {
         str_submission = str_url + '?' + str_parameters;
      }
   }

   //-------------------------------------------------------------------
   // Step 40
   // Execute the before callback if provided
   //-------------------------------------------------------------------
   if ( before_callback == undefined || before_callback == null || before_callback == '') {
      ;
   } else {
      eval(before_callback);
   }
   
   //-------------------------------------------------------------------
   // Step 50
   // Add the submission url to the iframe src
   //-------------------------------------------------------------------
   $("#" + str_iframeid).attr('src',str_submission);
   
   //-------------------------------------------------------------------
   // Step 60
   // Monitor if the iframe is loaded for after callback
   //-------------------------------------------------------------------
   function isLoaded(str_iframeid,after_callback) {
      var iframe = document.getElementById(str_iframeid);
      alert(iframe.readyState);
      if (iframe.readyState == "complete") {
         eval(after_callback); 
      } else { 
         setTimeout(isLoaded, 333); 
      }
      
   }
   
   if ( after_callback == undefined || after_callback == null || after_callback == '') {
      ;
   } else {
      isLoaded(str_iframeid,after_callback);      
   }
   
};
