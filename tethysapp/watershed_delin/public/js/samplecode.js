/**
 * Created by dan on 7/21/15.
 */
      OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
         OpenLayers.Util.onImageLoadErrorColor = "transparent";
         var proj4269,proj4326,projSM;
         var map,velayer,vectors,results;
         var wktformatter,geojsonformatter,sldformatter;
         var drawControls;
                       OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
         OpenLayers.Util.onImageLoadErrorColor = "transparent";
         var proj4269,proj4326,projSM;
         var map,velayer,vectors,results;
         var wktformatter,geojsonformatter,sldformatter;
         var drawControls;
         var $tabs,waiting_srv,waiting_pt;
         var sldstyle = WATERS.SLD.general_styles(null,['DROPLET','GENERIC_STREAM','INDEXING_PATH']);
         var bingapi = "AmV2-FOWOEUjICR1lRxws9e2hUr7Vig5wACrvubpFGbqO61pxUxHzvIwhonYvVd0";

         $(document).ready(function(){

            $tabs = $("#tabs").tabs({ disabled: [1,2] });
            $("#dz_draw_point").attr('checked',false);
            $("#dz_run_service").attr('disabled',true);

            // Projections in usage - NAD83, WSG84 and Spherical Mercator
            proj4269 = new OpenLayers.Projection("EPSG:4269");
            proj4326 = new OpenLayers.Projection("EPSG:4326");
            projSM   = new OpenLayers.Projection("EPSG:900913");

            // Build some common formatters
            wktformatter = new OpenLayers.Format.WKT();
            geojsonformatter = new OpenLayers.Format.GeoJSON();
            sldformatter = new OpenLayers.Format.SLD();

            /* Create the map object */
            var options = {
               projection: projSM,
               displayProjection: proj4269,
               units: "m",
               numZoomLevels: 18,
               maxResolution: 156543.0339,
               maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                                                 20037508, 20037508.34)
            };

            map = new OpenLayers.Map('map', options);

            var veroad = new OpenLayers.Layer.Bing(
               {
                  'name' : "Bing Roads",
                  'type' : 'Road',
                  'key'  : bingapi
               }
            );
            veroad.projection = projSM;
            map.addLayers([veroad]);

            var veaerial = new OpenLayers.Layer.Bing(
               {
                  'name' : "Bing Aerial",
                  'type' : 'Aerial',
                  'key'  : bingapi
               }
            );
            veaerial.projection = projSM;
            map.addLayers([veaerial]);

            var nhddetailed = new OpenLayers.Layer.ArcGIS93Rest(
               "Office of Water NHD Detailed",
               "http://watersgeo.epa.gov/ArcGIS/rest/services/OW/NHD_Med_Detailed_WMERC/MapServer/export",
                   {
                      layers: '0,1,3,4',
                      srs: 102113,
                      format: 'image/png'
                   },
                   {
                      isBaseLayer: true
                   }
            );
            nhddetailed.projection = projSM;
            map.addLayers([nhddetailed]);

            vectors = new OpenLayers.Layer.Vector(
               "Sketch Layer",
               {
                  format: OpenLayers.Format.WKT
               },
               {
                  isFixed: false
               }
            );

            start_point = new OpenLayers.Layer.Vector(
               "Starting Points",
               {
                  format: OpenLayers.Format.GEOJSON
               },
               {
                  isFixed: false
               }
            );

            end_point = new OpenLayers.Layer.Vector(
               "Ending Points",
               {
                  format: OpenLayers.Format.GEOJSON
               },
               {
                  isFixed: false
               }
            );

            indexing_path = new OpenLayers.Layer.Vector(
               "Indexing Paths",
               {
                  format: OpenLayers.Format.GEOJSON
               },
               {
                  isFixed: false
               }
            );

            flowlines = new OpenLayers.Layer.Vector(
               "NHD Flowlines",
               {
                  format: OpenLayers.Format.GEOJSON
               },
               {
                  isFixed: false
               }
            );

            map.addLayers([vectors,start_point,end_point,indexing_path,flowlines]);

            vectors.preFeatureInsert = function(feature) {
               if ( vectors.features.length == 1 ) {
                  vectors.removeFeatures(vectors.features[0]);
                  vectors.redraw();
               }
            }

            vectors.onFeatureInsert = function(feature) {
               if ( feature !== null ) {
                  var tempFeature = feature.clone();
                  tempFeature.geometry.transform(projSM,proj4269);
                  $("#wktbox").val(wktformatter.write(tempFeature));
                  $tabs.tabs("enable", 2);
                  $("#dz_run_service").attr('disabled',false);
               }
            }

            var sld = sldformatter.read(sldstyle);
            var stylelibrary = sld.namedLayers["common_styles"].userStyles;
            for (i in stylelibrary) {
               if ( stylelibrary[i].name == "DROPLET" ) {
                  start_point.styleMap.styles["default"] = stylelibrary[i];
                  end_point.styleMap.styles["default"] = stylelibrary[i];
               } else if ( stylelibrary[i].name == "GENERIC_STREAM" ) {
                  flowlines.styleMap.styles["default"] = stylelibrary[i];
               } else if ( stylelibrary[i].name == "INDEXING_PATH" ) {
                  indexing_path.styleMap.styles["default"] = stylelibrary[i];
               }
            }

            // Add controls to the map
            map.addControl(new OpenLayers.Control.LayerSwitcher());
            map.addControl(new OpenLayers.Control.MousePosition());
            map.addControl(new OpenLayers.Control.Navigation());

            // Center on DC
            var mapcenter = new OpenLayers.LonLat(-77.035271,38.883430);
            map.setCenter(
               OpenLayers.Layer.SphericalMercator.forwardMercator(
                  mapcenter.lon,
                  mapcenter.lat
               ),
               13
            );

            //Add some drawing tools
            drawControls = {
               point: new OpenLayers.Control.DrawFeature(
                  vectors,
                  OpenLayers.Handler.Point
               )
            };

            map.addControl(drawControls['point']);

            // Create the three waiting overlay objects
            waiting_pt = new WATERS.Helpers.SearchingDialog("globe_spinning_small.gif","<h4>&nbsp;&nbsp;Snapping Point...</h4>",null,80,"dz_p1");
            waiting_srv = new WATERS.Helpers.SearchingDialog("globe_spinning_small.gif","<h4>&nbsp;&nbsp;Searching...</h4>",null,80,"dz_in");

        });

        function toggle_draw_point() {
           if ( drawControls['point'].active == true ) {
              drawControls['point'].deactivate();
           } else {
              drawControls['point'].activate();
           }
        }

        function run_service() {
           var options = {
              "success" : "success",
              "error"   : "error",
              "timeout" : 60 * 1000
           };

           var data = {
               "pGeometry"               : WATERS.Helpers.GetFieldValue("wktbox")
              ,"pGeometryMod"            : "WKT,SRID=8265"
              ,"pResolution"             : 3
              ,"pPointIndexingMethod"    : "DISTANCE"
              ,"pPointIndexingMaxDist"   : WATERS.Helpers.GetFieldValue("dz_maxdistance")
              ,"pOutputPathFlag"         : "TRUE"
              ,"pReturnFlowlineGeomFlag" : "FULL"
              ,"optNHDPlusDataset"       : "2.1"
           };

           waiting_srv.show();
           rtnStr = WATERS.Services.PointIndexingService(data, options);

           if (rtnStr != "") {
              alert(rtnStr);
           };
        }

        function success(result, textStatus) {
           document.getElementById("output").innerHTML = '';

           var srv_rez = result.output;

           waiting_srv.hide();
           if (srv_rez == null) {
              if ( result.status.status_message !== null ) {
                 document.getElementById("output").innerHTML = result.status.status_message;
              } else {
                 document.getElementById("output").innerHTML = "No results found";
              }
           } else {

              var srv_fl  = result.output.ary_flowlines;

              function drawTable() {
                 var tableData = new google.visualization.DataTable();
                 tableData.addColumn('string', 'Total Distance');
                 tableData.addColumn('string', 'NHD Flowline');
                 tableData.addColumn('string', 'NHD Reach Code');
                 tableData.addColumn('string', 'NHD Reach SmDate');
                 tableData.addColumn('string', 'NHD Measure');
                 tableData.addColumn('string', 'NHD FCODE');
                 tableData.addColumn('string', 'NHD GNIS');
                 tableData.addColumn('string', 'WBD HUC12');

                 var rowIndex = 0;
                 var output = document.getElementById("output");
                 var distance = Math.round(srv_rez.total_distance*1000)/1000;

                 for (index in srv_fl) {
                    tableData.addRows(1);
                    var colIndex = 0;
                    var rsm = new Date(srv_fl[index].reachsmdate);
                    tableData.setCell(rowIndex, colIndex++, distance.toString());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].comid.toString());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].reachcode);
                    tableData.setCell(rowIndex, colIndex++, (rsm.getUTCMonth() + 1) + "/" + rsm.getUTCDate() + "/" + rsm.getUTCFullYear());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].fmeasure.toString());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].fcode.toString());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].gnis_name);
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].wbd_huc12);
                    rowIndex++;
                 }

                 var table = new google.visualization.Table(output);
                 table.draw(
                    tableData,
                    {
                       showRowNumber: true,
                       allowHtml: true,
                       sortColumn: 1,
                       page: "enable",
                       pageSize: Math.floor((document.body.clientHeight - 135)/19)
                    }
                 );
              }

              google.load('visualization', '1', {packages:['table'], callback: drawTable});

              start_point.addFeatures(geojson2feature(srv_rez.start_point));
              end_point.addFeatures(geojson2feature(srv_rez.end_point));
              indexing_path.addFeatures(geojson2feature(srv_rez.indexing_path));
              for ( i in srv_rez.ary_flowlines ) {
                 flowlines.addFeatures(geojson2feature(srv_rez.ary_flowlines[i].shape));
              }
              start_point.refresh();
              end_point.refresh();
              indexing_path.refresh();
              flowlines.refresh();
           }

           $tabs.tabs("option", "disabled", []);
           $tabs.tabs("select", "results");

        }

        function error(XMLHttpRequest, textStatus, errorThrown) {
           alert(textStatus);
           waiting_srv.hide();
        }


        function geojson2feature(dz_geojson) {
            // Force jquery coordinates into real js Array
            if (dz_geojson.coordinates instanceof Array == false) {
               dz_geojson.coordinates = WATERS.Utilities.RepairArray(dz_geojson.coordinates,0);
            }
            var dz_geometry = geojsonformatter.parseGeometry(dz_geojson);
            dz_geometry.transform(proj4269,projSM);
            var dz_feature = new OpenLayers.Feature;
            dz_feature.geometry = dz_geometry;
            return dz_feature;
         }

        function dz_clear_results() {
           indexing_path.destroyFeatures();
           start_point.destroyFeatures();
           end_point.destroyFeatures();
           flowlines.destroyFeatures();
           indexing_path.refresh();
           start_point.refresh();
           end_point.refresh();
           flowlines.refresh();
        }

        function dz_greater_than_zero(field) {
           with (field) {
              if ( value == null || value == "" || isNaN(value) || value <= 0) {
                 alert(field.name + " must be populated, be number and be greater than zero.");
                 $("#dz_run_service").attr('disabled',true);
                 return false;
              } else {
                 if ( $("#wktbox").val.length > 0 ) {
                    $("#dz_run_service").attr('disabled',false);
                 }
                 return true;
              }
           }
        }
         var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
         document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));


         try {
            var pageTracker = _gat._getTracker("UA-10077177-1");
            pageTracker._trackPageview();
         } catch(err) {}

         var sldstyle = WATERS.SLD.general_styles(null,['DROPLET','GENERIC_STREAM','INDEXING_PATH']);
         var bingapi = "AmV2-FOWOEUjICR1lRxws9e2hUr7Vig5wACrvubpFGbqO61pxUxHzvIwhonYvVd0";

         $(document).ready(function(){

            $tabs = $("#tabs").tabs({ disabled: [1,2] });
            $("#dz_draw_point").attr('checked',false);
            $("#dz_run_service").attr('disabled',true);

            // Projections in usage - NAD83, WSG84 and Spherical Mercator
            proj4269 = new OpenLayers.Projection("EPSG:4269");
            proj4326 = new OpenLayers.Projection("EPSG:4326");
            projSM   = new OpenLayers.Projection("EPSG:900913");

            // Build some common formatters
            wktformatter = new OpenLayers.Format.WKT();
            geojsonformatter = new OpenLayers.Format.GeoJSON();
            sldformatter = new OpenLayers.Format.SLD();

            /* Create the map object */
            var options = {
               projection: projSM,
               displayProjection: proj4269,
               units: "m",
               numZoomLevels: 18,
               maxResolution: 156543.0339,
               maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                                                 20037508, 20037508.34)
            };

            map = new OpenLayers.Map('map', options);

            var veroad = new OpenLayers.Layer.Bing(
               {
                  'name' : "Bing Roads",
                  'type' : 'Road',
                  'key'  : bingapi
               }
            );
            veroad.projection = projSM;
            map.addLayers([veroad]);

            var veaerial = new OpenLayers.Layer.Bing(
               {
                  'name' : "Bing Aerial",
                  'type' : 'Aerial',
                  'key'  : bingapi
               }
            );
            veaerial.projection = projSM;
            map.addLayers([veaerial]);

            var nhddetailed = new OpenLayers.Layer.ArcGIS93Rest(
               "Office of Water NHD Detailed",
               "http://watersgeo.epa.gov/ArcGIS/rest/services/OW/NHD_Med_Detailed_WMERC/MapServer/export",
                   {
                      layers: '0,1,3,4',
                      srs: 102113,
                      format: 'image/png'
                   },
                   {
                      isBaseLayer: true
                   }
            );
            nhddetailed.projection = projSM;
            map.addLayers([nhddetailed]);

            vectors = new OpenLayers.Layer.Vector(
               "Sketch Layer",
               {
                  format: OpenLayers.Format.WKT
               },
               {
                  isFixed: false
               }
            );

            start_point = new OpenLayers.Layer.Vector(
               "Starting Points",
               {
                  format: OpenLayers.Format.GEOJSON
               },
               {
                  isFixed: false
               }
            );

            end_point = new OpenLayers.Layer.Vector(
               "Ending Points",
               {
                  format: OpenLayers.Format.GEOJSON
               },
               {
                  isFixed: false
               }
            );

            indexing_path = new OpenLayers.Layer.Vector(
               "Indexing Paths",
               {
                  format: OpenLayers.Format.GEOJSON
               },
               {
                  isFixed: false
               }
            );

            flowlines = new OpenLayers.Layer.Vector(
               "NHD Flowlines",
               {
                  format: OpenLayers.Format.GEOJSON
               },
               {
                  isFixed: false
               }
            );

            map.addLayers([vectors,start_point,end_point,indexing_path,flowlines]);

            vectors.preFeatureInsert = function(feature) {
               if ( vectors.features.length == 1 ) {
                  vectors.removeFeatures(vectors.features[0]);
                  vectors.redraw();
               }
            }

            vectors.onFeatureInsert = function(feature) {
               if ( feature !== null ) {
                  var tempFeature = feature.clone();
                  tempFeature.geometry.transform(projSM,proj4269);
                  $("#wktbox").val(wktformatter.write(tempFeature));
                  $tabs.tabs("enable", 2);
                  $("#dz_run_service").attr('disabled',false);
               }
            }

            var sld = sldformatter.read(sldstyle);
            var stylelibrary = sld.namedLayers["common_styles"].userStyles;
            for (i in stylelibrary) {
               if ( stylelibrary[i].name == "DROPLET" ) {
                  start_point.styleMap.styles["default"] = stylelibrary[i];
                  end_point.styleMap.styles["default"] = stylelibrary[i];
               } else if ( stylelibrary[i].name == "GENERIC_STREAM" ) {
                  flowlines.styleMap.styles["default"] = stylelibrary[i];
               } else if ( stylelibrary[i].name == "INDEXING_PATH" ) {
                  indexing_path.styleMap.styles["default"] = stylelibrary[i];
               }
            }

            // Add controls to the map
            map.addControl(new OpenLayers.Control.LayerSwitcher());
            map.addControl(new OpenLayers.Control.MousePosition());
            map.addControl(new OpenLayers.Control.Navigation());

            // Center on DC
            var mapcenter = new OpenLayers.LonLat(-77.035271,38.883430);
            map.setCenter(
               OpenLayers.Layer.SphericalMercator.forwardMercator(
                  mapcenter.lon,
                  mapcenter.lat
               ),
               13
            );

            //Add some drawing tools
            drawControls = {
               point: new OpenLayers.Control.DrawFeature(
                  vectors,
                  OpenLayers.Handler.Point
               )
            };

            map.addControl(drawControls['point']);

            // Create the three waiting overlay objects
            waiting_pt = new WATERS.Helpers.SearchingDialog("globe_spinning_small.gif","<h4>&nbsp;&nbsp;Snapping Point...</h4>",null,80,"dz_p1");
            waiting_srv = new WATERS.Helpers.SearchingDialog("globe_spinning_small.gif","<h4>&nbsp;&nbsp;Searching...</h4>",null,80,"dz_in");

        });

        function toggle_draw_point() {
           if ( drawControls['point'].active == true ) {
              drawControls['point'].deactivate();
           } else {
              drawControls['point'].activate();
           }
        }

        function run_service() {
           var options = {
              "success" : "success",
              "error"   : "error",
              "timeout" : 60 * 1000
           };

           var data = {
               "pGeometry"               : WATERS.Helpers.GetFieldValue("wktbox")
              ,"pGeometryMod"            : "WKT,SRID=8265"
              ,"pResolution"             : 3
              ,"pPointIndexingMethod"    : "DISTANCE"
              ,"pPointIndexingMaxDist"   : WATERS.Helpers.GetFieldValue("dz_maxdistance")
              ,"pOutputPathFlag"         : "TRUE"
              ,"pReturnFlowlineGeomFlag" : "FULL"
              ,"optNHDPlusDataset"       : "2.1"
           };

           waiting_srv.show();
           rtnStr = WATERS.Services.PointIndexingService(data, options);

           if (rtnStr != "") {
              alert(rtnStr);
           };
        }

        function success(result, textStatus) {
           document.getElementById("output").innerHTML = '';

           var srv_rez = result.output;

           waiting_srv.hide();
           if (srv_rez == null) {
              if ( result.status.status_message !== null ) {
                 document.getElementById("output").innerHTML = result.status.status_message;
              } else {
                 document.getElementById("output").innerHTML = "No results found";
              }
           } else {

              var srv_fl  = result.output.ary_flowlines;

              function drawTable() {
                 var tableData = new google.visualization.DataTable();
                 tableData.addColumn('string', 'Total Distance');
                 tableData.addColumn('string', 'NHD Flowline');
                 tableData.addColumn('string', 'NHD Reach Code');
                 tableData.addColumn('string', 'NHD Reach SmDate');
                 tableData.addColumn('string', 'NHD Measure');
                 tableData.addColumn('string', 'NHD FCODE');
                 tableData.addColumn('string', 'NHD GNIS');
                 tableData.addColumn('string', 'WBD HUC12');

                 var rowIndex = 0;
                 var output = document.getElementById("output");
                 var distance = Math.round(srv_rez.total_distance*1000)/1000;

                 for (index in srv_fl) {
                    tableData.addRows(1);
                    var colIndex = 0;
                    var rsm = new Date(srv_fl[index].reachsmdate);
                    tableData.setCell(rowIndex, colIndex++, distance.toString());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].comid.toString());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].reachcode);
                    tableData.setCell(rowIndex, colIndex++, (rsm.getUTCMonth() + 1) + "/" + rsm.getUTCDate() + "/" + rsm.getUTCFullYear());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].fmeasure.toString());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].fcode.toString());
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].gnis_name);
                    tableData.setCell(rowIndex, colIndex++, srv_fl[index].wbd_huc12);
                    rowIndex++;
                 }

                 var table = new google.visualization.Table(output);
                 table.draw(
                    tableData,
                    {
                       showRowNumber: true,
                       allowHtml: true,
                       sortColumn: 1,
                       page: "enable",
                       pageSize: Math.floor((document.body.clientHeight - 135)/19)
                    }
                 );
              }

              google.load('visualization', '1', {packages:['table'], callback: drawTable});

              start_point.addFeatures(geojson2feature(srv_rez.start_point));
              end_point.addFeatures(geojson2feature(srv_rez.end_point));
              indexing_path.addFeatures(geojson2feature(srv_rez.indexing_path));
              for ( i in srv_rez.ary_flowlines ) {
                 flowlines.addFeatures(geojson2feature(srv_rez.ary_flowlines[i].shape));
              }
              start_point.refresh();
              end_point.refresh();
              indexing_path.refresh();
              flowlines.refresh();
           }

           $tabs.tabs("option", "disabled", []);
           $tabs.tabs("select", "results");

        }

        function error(XMLHttpRequest, textStatus, errorThrown) {
           alert(textStatus);
           waiting_srv.hide();
        }


        function geojson2feature(dz_geojson) {
            // Force jquery coordinates into real js Array
            if (dz_geojson.coordinates instanceof Array == false) {
               dz_geojson.coordinates = WATERS.Utilities.RepairArray(dz_geojson.coordinates,0);
            }
            var dz_geometry = geojsonformatter.parseGeometry(dz_geojson);
            dz_geometry.transform(proj4269,projSM);
            var dz_feature = new OpenLayers.Feature;
            dz_feature.geometry = dz_geometry;
            return dz_feature;
         }

        function dz_clear_results() {
           indexing_path.destroyFeatures();
           start_point.destroyFeatures();
           end_point.destroyFeatures();
           flowlines.destroyFeatures();
           indexing_path.refresh();
           start_point.refresh();
           end_point.refresh();
           flowlines.refresh();
        }

        function dz_greater_than_zero(field) {
           with (field) {
              if ( value == null || value == "" || isNaN(value) || value <= 0) {
                 alert(field.name + " must be populated, be number and be greater than zero.");
                 $("#dz_run_service").attr('disabled',true);
                 return false;
              } else {
                 if ( $("#wktbox").val.length > 0 ) {
                    $("#dz_run_service").attr('disabled',false);
                 }
                 return true;
              }
           }
        }
         var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
         document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));


         try {
            var pageTracker = _gat._getTracker("UA-10077177-1");
            pageTracker._trackPageview();
         } catch(err) {}
