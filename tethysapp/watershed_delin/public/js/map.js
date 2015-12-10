//variables related to the map
var map, start_point_layer, click_point_layer, end_point_layer, indexing_path_layer, flow_lines_layer;
var basin_layer, streams_layer;
var upstream_layer, downstream_layer;
var flag_geocoded;
var resLoc, resAbstr, upAbstract, downAbstract;
var resKwds,upKwds,downKwds;
var USRivers;
var baseMapLayer=null;

//variables related to the delineation process
var comid, fmeasure, reach_code, gnis_name, wbd_huc12;
var displayStatus = $('#display-status');
var popupDiv = $('#welcome-popup');

$(document).ready(function () {
    //hide the delineate and download buttons at first

    popupDiv.modal('show');

    hide_buttons();
    /*    var esri = new ol.layer.Tile({
        source: new ol.source.XYZ({
            attribution: [new ol.Attribution({
                html: 'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/' +
                'rest/services/World_Topo_Map/MapServer>ArcGIS</a>'
            })],
            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
        })
    });

*/
    //Set basemap dropdownbox initial display as 'Bing'
    dropdown_obj=document.getElementById("select_input");
    dropdown_obj.selectedIndex=0;

    //map = TETHYS_MAP_VIEW.getMap();


    kansas_city_lonlat = [-94.5783, 39.0997]
    kansas_city_3857 = ol.proj.transform(kansas_city_lonlat, 'EPSG:4326', 'EPSG:3857');

    map = new ol.Map({
	layers: [ ],
	controls: ol.control.defaults(),
	target: 'map',
	view: new ol.View({
		center: kansas_city_3857,
		zoom: 8,
        projection: "EPSG:3857"
	})
    });


    //remove the default openstreetmap that Tethys adds.
    map.getLayers().clear();

    //build the bing map layer
	bing_layer = new ol.layer.Tile({

		source: new ol.source.BingMaps({
			imagerySet: 'AerialWithLabels',
			key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3'
		})
	});

    //build OpenStreet map layer
    openstreet_layer = new ol.layer.Tile({
          source: new ol.source.OSM()
        });

    //build MapQuest map layer
    mapQuest_layer = new ol.layer.Tile({
        source: new ol.source.MapQuest({layer: 'sat'})
                 });

    //build Stamen map layer
    stamen_layer = new ol.layer.Tile({
        source:new ol.source.Stamen({
    layer: "toner-lite",
    url: "https://stamen-tiles-{a-d}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
        })
    });

    var urlTemplate = 'http://141.142.168.50/arcgis/rest/services/hydro/NFIEGeoNational_flowline/MapServer/tile/{z}/{y}/{x}';
    // var urlTemplate = 'https://cgmap1.ncsa.illinois.edu/arcgis/rest/services/hydro/NFIEGeoNational_flowline/MapServer/tile/{z}/{y}/{x}';

    USRivers = new ol.layer.Tile({
        source: new ol.source.XYZ({
            tilesize : 256,
            tileUrlFunction: function(tileCoord) {
            return urlTemplate.replace('{z}', tileCoord[0].toString())
                            .replace('{x}', tileCoord[1].toString())
                            .replace('{y}', tileCoord[2].toString());
            }
            }),
        maxResolution: 1000 // layer shows up when current view is greater than this scale (1:1000), like 1:800
        })

    click_point_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    })

    start_point_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255,100,100,0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffccff',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#ffccff'
                })
            })
        })
    });

    end_point_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255,100,100,0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#00ccff',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#00ccff'
                })
            })
        })
    });

    indexing_path_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255,100,100,0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#00cc00',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#00cc00'
                })
            })
        })
    });

    flow_lines_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0,0,255,0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#0000ff',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#0000ff'
                })
            })
        })
    });

    basin_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0,0,255,0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#0000ff',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#0000ff'
                })
            })
        })
    });

    streams_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0,0,255,0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#0000ff',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#0000ff'
                })
            })
        })
    });

    upstream_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0,0,255,0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#00ffff',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#00ffff'
                })
            })
        })
    });

    downstream_layer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0,0,255,0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#00ffff',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#00ffff'
                })
            })
        })
    });


    //set bing map as base map
    baseMapLayer=bing_layer;
    map.addLayer(baseMapLayer);
    map.addLayer(USRivers);
    map.addLayer(click_point_layer);
    map.addLayer(start_point_layer);
    map.addLayer(end_point_layer);
    map.addLayer(indexing_path_layer);
    map.addLayer(flow_lines_layer);
    map.addLayer(basin_layer);
    map.addLayer(streams_layer);
    map.addLayer(upstream_layer);
    map.addLayer(downstream_layer);

    find_current_location();

    map.getView().setZoom(5);

    map.on('click', function(evt) {
        flag_geocoded=false;
        var coordinate = evt.coordinate;
        addClickPoint(coordinate);
        $("#select_navigation")[0][0].selected = true;
        hide_buttons();
        var lonlat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');

        //Each time the user clicks on the map, let's run the point
        //indexing service to show them the closest NHD reach segment.
        run_point_indexing_service(lonlat);
    })

});


//select a basemap you want
function run_select_basemap() {

    dropdown_obj=document.getElementById("select_input");
    selected_index=dropdown_obj.selectedIndex;
    selected_value=dropdown_obj.options[selected_index].value;

    new_baseMapLayer=null;
    if (selected_value == "bing_layer")
    {
        new_baseMapLayer=bing_layer
    }
    else if (selected_value == "mapQuest_layer")
    {
        new_baseMapLayer=mapQuest_layer;
    }
    else if(selected_value=="openstreet_layer")
    {
        new_baseMapLayer=openstreet_layer;
    }
     else if(selected_value=="stamen_layer")
    {
        new_baseMapLayer=stamen_layer;
    }

    //remove base map layer
    //insert selected layer as basemap
    map.removeLayer(baseMapLayer);
    map.getLayers().insertAt(0, new_baseMapLayer);
    baseMapLayer=new_baseMapLayer


    }

function find_current_location() {
    //var lat = 40.2380;
    //var lon = -111.5500;
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        CenterMap(lat,lon);
        map.getView().setZoom(6);
    });


}

function addClickPoint(coordinates){
    // Check if the feature exists. If not then create it.
    // If it does exist, then just change its geometry to the new coords.
    var geometry = new ol.geom.Point(coordinates);
    if (click_point_layer.getSource().getFeatures().length==0){
        var feature = new ol.Feature({
            geometry: geometry,
            attr: 'Some Property'
        });
        click_point_layer.getSource().addFeature(feature);
    } else {
        click_point_layer.getSource().getFeatures()[0].setGeometry(geometry);
    }
}

function hide_buttons() {
    //document.getElementById("btnDelineate").style.visibility="hidden";
    document.getElementById("select_navigation").style.visibility="hidden";
    document.getElementById("btnDownload").style.visibility="hidden";
    document.getElementById("btnUpload").style.visibility="hidden";
    document.getElementById("delineation_output").innerHTML="";
    document.getElementById("up_down_output").innerHTML="";
    document.getElementById("waiting_output").innerHTML = '';
}

function clear_location_layers() {
    start_point_layer.getSource().clear();
    end_point_layer.getSource().clear();
    indexing_path_layer.getSource().clear();
    flow_lines_layer.getSource().clear();
    basin_layer.getSource().clear();
    streams_layer.getSource().clear();
    upstream_layer.getSource().clear();
    downstream_layer.getSource().clear();
}

function CenterMap(lat,lon){
    var dbPoint = {
        "type": "Point",
        "coordinates": [lon, lat]
    }
    var coords = ol.proj.transform(dbPoint.coordinates, 'EPSG:4326','EPSG:3857');
    map.getView().setCenter(coords);
}


//Functions for working with EPA WATERS web services

//Search button, function if point indexing service
function run_point_indexing_service(lonlat) {
    var inputLon = lonlat[0];
    var inputLat = lonlat[1];
    var wktval = "POINT(" + inputLon + " " + inputLat + ")";

    var options = {
        "success" : "pis_success",
        "error"   : "pis_error",
        "timeout" : 60 * 1000
    };

    var data = {
        "pGeometry": wktval,
        "pGeometryMod": "WKT,SRSNAME=urn:ogc:def:crs:OGC::CRS84",
        "pPointIndexingMethod": "DISTANCE",
        "pPointIndexingMaxDist": 10,
        "pOutputPathFlag": "TRUE",
        "pReturnFlowlineGeomFlag": "FULL",
        "optOutCS": "SRSNAME=urn:ogc:def:crs:OGC::CRS84",
        "optOutPrettyPrint": 0,
        "optClientRef": "CodePen"
    };
    hide_buttons();
    clear_location_layers();
    waiting_pis();
    rtnStr = WATERS.Services.PointIndexingService(data, options);
    // The service runs and when it is done, ti will call either the
    // success or error functions. So the actual actions upon success all
    // happen in the success function.
}

function pis_success(result, textStatus) {
    document.getElementById("search_output").innerHTML = '';
    var srv_rez = result.output;
    if (srv_rez == null) {
        if ( result.status.status_message !== null ) {
            report_failed_search(result.status.status_message);
        } else {
            report_failed_search("No results found");
        }
        return;
    }

    //build output results text block for display
    srv_fl = result.output.ary_flowlines;
    comid = srv_fl[0].comid.toString();
    reachcode = srv_fl[0].reachcode;
    fmeasure = srv_fl[0].fmeasure.toFixed(2).toString();
    gnis_name = srv_fl[0].gnis_name;
    wbd_huc12 = srv_fl[0].wbd_huc12;

    var outstring =
            '<strong>Search Results:</strong><br>' +
            'Feature Name = ' + gnis_name + '<br>' +
            'Reach Code = ' + reachcode + '<br>' +
            'Measure = ' + fmeasure + ' %<br>' +
            'HUC 12 = ' + wbd_huc12 ;

    document.getElementById("search_output").innerHTML = outstring;

    //add the found start point, end point, indexing path, and flow line to the map
    //clear_location_layers();
    start_point_layer.getSource().addFeature(geojson2feature(srv_rez.start_point));
    end_point_layer.getSource().addFeature(geojson2feature(srv_rez.end_point));
    indexing_path_layer.getSource().addFeature(geojson2feature(srv_rez.indexing_path));
    for (i in srv_fl){
        flow_lines_layer.getSource().addFeature(geojson2feature(srv_fl[i].shape));
    }

    //turn on the delineate button and turn off the download button and clear delin results
    //document.getElementById("btnDelineate").style.visibility="visible";
    document.getElementById("select_navigation").style.visibility="visible";
    document.getElementById("delineation_output").innerHTML="";
    document.getElementById("up_down_output").innerHTML="";

    var coord = end_point_layer.getSource().getFeatures()[0].getGeometry().getCoordinates();
    var LLcoord = ol.proj.transform(coord,'EPSG:3857','EPSG:4326');

    if(flag_geocoded==false){
        //reverse geocode our click point so the search box isn't empty
        reverse_geocode(LLcoord);
    }

    //get a little closer if we are zoomed way out.
    if (map.getView().getZoom()<12) {
        map.getView().setZoom(12);
        CenterMap(LLcoord[1],LLcoord[0]);
    }
}

function pis_error(XMLHttpRequest, textStatus, errorThrown) {
    report_failed_search(textStatus);
}

function report_failed_search(MessageText){
    //Set the message of the bad news
    document.getElementById("search_output").innerHTML = "<strong>Search Results:</strong><br>" + MessageText;

    gnis_name = null;
    map.getView().setZoom(4);

    if(flag_geocoded==false) {
        //reverse geocode our click point so the search box isn't empty
        var coord = click_point_layer.getSource().getFeatures()[0].getGeometry().getCoordinates();
        var LLcoord = ol.proj.transform(coord,'EPSG:3857','EPSG:4326');
        reverse_geocode(LLcoord);
    }
}

//Delineate watershed button, function of navigation delineation service

function geojson2feature(myGeoJSON) {
        //Convert GeoJSON object into an OpenLayers 3 feature.
    //Also force jquery coordinates into real js Array if needed
    var geojsonformatter = new ol.format.GeoJSON;
    if (myGeoJSON.coordinates instanceof Array == false) {
        myGeoJSON.coordinates = WATERS.Utilities.RepairArray(myGeoJSON.coordinates,0);
    }
    var myGeometry = geojsonformatter.readGeometry(myGeoJSON);
    myGeometry.transform('EPSG:4326','EPSG:3857');
    var myFeature = new ol.Feature(myGeometry);
    return myFeature;

}


var value_selected;

function select_function(){
    dropdown_obj=document.getElementById("select_navigation");
    selected_index=dropdown_obj.selectedIndex;
    value_selected=dropdown_obj.options[selected_index].value;

    if (value_selected == "select"){
        return;
    }
    else if (value_selected == "DeWa"){
        run_navigation_delineation_service();
    }
    else{
        run_upstream_service();
    }
}

function run_navigation_delineation_service(){
    var options = {
        "success": "nds_success",
        "error": "nds_error",
        "timeout": 60 * 1000,
        "geomFormat": "GEOJSON"
    };

    var data = {
        "pNavigationType": "UT",
        "pStartComid": comid,
        "pStartMeasure": fmeasure,
        "pMaxDistance": 1000,
        "pAggregationFlag": "TRUE",
        "pFeatureType": "CATCHMENT",
        "pOutputFlag": "BOTH",
        "optNHDPlusDataset": "2.1"
    };

     waiting_output();
    rtnStr = WATERS.Services.NavigationDelineationService(data, options);
    //this will start the service. If it succeeds, it will call nds_success.
}

function nds_success(result, textStatus) {

   document.getElementById("waiting_output").innerHTML = '';

    var srv_rez = result.output;

    if (srv_rez == null) {
        if (result.status.status_message !== null) {
            report_failed_delineation(result.status.status_message);
        } else {
            report_failed_delineation("No results found");
        }
    } else {

        streams_layer.getSource().clear();
        basin_layer.getSource().clear();

        if (result.output.shape == null) {
            for (i in result.output.catchments) {
                basin_layer.getSource().addFeature(geojson2feature(result.output.catchments[i].shape));
            }
        } else {
            basin_layer.getSource().addFeature(geojson2feature(result.output.shape));
        }

        if (result.output.flowlines.length > 0) {
            for (i in result.output.flowlines) {
                streams_layer.getSource().addFeature(geojson2feature(result.output.flowlines[i].shape));
            }
        }
        var basin_area = (basin_layer.getSource().getFeatures()[0].getGeometry().getArea()/1000000).toFixed(3);
        var stream_count = streams_layer.getSource().getFeatures().length;
        var success_text = "<strong>Delineation Results:</strong><br>" +
                            "Watershed Area = " + basin_area + " sq-km<br>" +
                            "Stream Segments = " + stream_count;

        resAbstr = 'This resource contains automatically created KML files representing a watershed boundary and ' +
            'stream network delineated by the EPA Waters Services using the Tethys EPA Waters Services web app. ' +
            'National Hydrologic Dataset (NHD) stream outlet details:' + 'Feature Name = ' + gnis_name +
            ', Reach Code = ' + reachcode +', Measure = ' + fmeasure +
            ', HUC 12 = ' + wbd_huc12 + '. Delineation Results: Watershed Area = ' + basin_area + ' sq-km. ' +
            'Stream Segments = ' + stream_count +'.';

        resKwds = resLoc+', Watershed, Delineation';

        if( upstream_layer.getSource().getFeatures().length> 0){
            $('#resource-abstract').val(resAbstr+upAbstract);
            $('#resource-keywords').val(resKwds+', '+upKwds);

        }else if(downstream_layer.getSource().getFeatures().length> 0){
            $('#resource-abstract').val(resAbstr+downAbstract);
            $('#resource-keywords').val(resKwds+', '+downKwds);
        }else{
            $('#resource-abstract').val(resAbstr);
            $('#resource-keywords').val(resKwds);}


        document.getElementById("delineation_output").innerHTML = success_text;
        document.getElementById("btnDownload").style.visibility="visible";
        document.getElementById("btnUpload").style.visibility="visible";
        map.getView().fitExtent(basin_layer.getSource().getExtent(), map.getSize());
    }


}

function nds_error(XMLHttpRequest, textStatus, errorThrown) {
    document.getElementById("waiting_output").innerHTML = '';
    report_failed_delineation(textStatus);
}

function report_failed_delineation(textMessage) {
    document.getElementById("delineation_output").innerHTML = "<strong>Delineation Error:</strong><br>" + textMessage;
}

//function of upstream service

function run_upstream_service(){

    var options = {
        "success": "us_success",
        "error": "us_error",
        "timeout": 60 * 1000,
        "geomFormat": "GEOJSON"
    };

    var data = {
        "pNavigationType": value_selected,
        "pStartComid": comid,
        "pStartMeasure": fmeasure,
        "pTraversalSummary" : "TRUE",
        "pFlowlinelist" : "TRUE",
        "pStopDistancekm": 1000,
        "optNHDPlusDataset": "2.1"
    };

    waiting_output();
    rtnStr = WATERS.Services.UpstreamDownstreamService(data, options);
    //this will start the service. If it succeeds, it will call us_success.
}

function us_success(result, textStatus) {

    document.getElementById("waiting_output").innerHTML = '';

    var srv_rez = result.output;

    if (srv_rez == null) {
        if (result.status.status_message !== null) {
            document.getElementById("up_down_output").innerHTML = result.status.status_message;
        } else {
            document.getElementById("up_down_output").innerHTML = "No results found";
        }
    } else {

        upstream_layer.getSource().clear();
        downstream_layer.getSource().clear();

        dropdown_obj=document.getElementById("select_navigation");
        selected_index=dropdown_obj.selectedIndex;
        selected_value=dropdown_obj.options[selected_index].value;

        var srv_fl  = result.output.flowlines_traversed;

        if (selected_value == "UT" ||selected_value == "UM") {
            for (i in result.output.flowlines_traversed) {
                upstream_layer.getSource().addFeature(geojson2feature(result.output.flowlines_traversed[i].shape));
            }
            var stream_count = upstream_layer.getSource().getFeatures().length;
            var success_text = "<strong>Upstream Results:</strong><br>" +
                "Stream Segments = " + stream_count;
            map.getView().fitExtent(upstream_layer.getSource().getExtent(), map.getSize());

            upAbstract = 'This resource contains automatically created kml file representing upstream of this point '
                + 'queried by the EPA Waters Service using the Tethys EPA Waters Service web app. ' + 'Upstream Results: '
                + 'Stream Segments = ' + stream_count + '.';

            if (selected_value == "UT") {
                upKwds = 'Upstream, Tributaries';
            } else {
                upKwds = 'Upstream, Mainstem';
            }

            if (basin_layer.getSource().getFeatures().length > 0) {
                $('#resource-abstract').val(resAbstr + upAbstract);
                $('#resource-keywords').val(resKwds + ', ' + upKwds)
            }
            else
            {
                $('#resource-abstract').val(upAbstract);
                $('#resource-keywords').val(resLoc + ', ' + upKwds);
            }
        }
        else
        {
            for ( i in result.output.flowlines_traversed) {
                downstream_layer.getSource().addFeature(geojson2feature(result.output.flowlines_traversed[i].shape));
            }
            var stream_count = downstream_layer.getSource().getFeatures().length;
            var success_text = "<strong>Downstream Results:</strong><br>" +
                            "Stream Segments = " + stream_count;

            downAbstract = 'This resource contains automatically created kml file representing downstream of this point '
                +'queried by the EPA Waters Service using the Tethys EPA Waters Service web app. '+ 'Downstream Results: '
                +'Stream Segments = ' + stream_count +'.';

            if (selected_value=="DM")
            {
                downKwds='Downstream, Mainstem';
            }
            else
            {
                downKwds='Downstream, Divergences';
            }

            if( basin_layer.getSource().getFeatures().length> 0)
            {
                $('#resource-abstract').val(resAbstr+downAbstract);
                $('#resource-keywords').val(resKwds+', '+downKwds);
            }
            else
            {
                $('#resource-abstract').val(downAbstract);
                $('#resource-keywords').val(resLoc + ', ' + downKwds)
            }

            map.getView().fitExtent(downstream_layer.getSource().getExtent(), map.getSize());
        }


        document.getElementById("up_down_output").innerHTML = success_text;
        document.getElementById("btnDownload").style.visibility="visible";
        document.getElementById("btnUpload").style.visibility="visible";

    }
}

function us_error(XMLHttpRequest, textStatus, errorThrown) {
    document.getElementById("waiting_output").innerHTML = '';
    report_failed_upstream(textStatus);

}

function report_failed_upstream(textMessage) {
    document.getElementById("up_down_output").innerHTML = "<strong>Upstream Query Error:</strong><br>" + textMessage;
}


// Show a point in the map of the location inputted in the search box,
// or show the location information of the point clicked in the map
function run_geocoder() {
    g = new google.maps.Geocoder();
    myAddress=document.getElementById('txtLocation').value;
    g.geocode({'address': myAddress}, geocoder_success);
}

function geocoder_success(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        r=results;
        flag_geocoded=true;
        Lat = results[0].geometry.location.lat();
        Lon = results[0].geometry.location.lng();

        var dbPoint = {
            "type": "Point",
            "coordinates": [Lon, Lat]
        }

        var coords = ol.proj.transform(dbPoint.coordinates, 'EPSG:4326','EPSG:3857');
        addClickPoint(coords);
        CenterMap(Lat,Lon);
        //map.getView().setZoom(14);
        run_point_indexing_service([Lon,Lat]);
//        alert(results[0].formatted_address);
    } else {
        alert("Geocode was not successful for the following reason: " + status);
    }
}

function reverse_geocode(coord){
    var latlon = new google.maps.LatLng(coord[1],coord[0]);
    var g = new google.maps.Geocoder();
    g.geocode({'location':latlon}, reverse_geocode_success);
}

function reverse_geocode_success(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        var location = results[1].formatted_address;
        if (gnis_name != null) {
            location = gnis_name + ", " + location;
        }
        document.getElementById("txtLocation").value = location;
        resLoc = location.split(",")[0];
        var resourceTitle = 'Watershed at '+ location;
        $('#resource-title').val(resourceTitle);

    } else {
        document.getElementById("txtLocation").value = "Location Not Available";
    }
}

function handle_search_key(e) {
    // Handle a key press in the location search text box.
    // This handles pressing the enter key to initiate the search.
    if (e.keyCode == 13) {
        run_geocoder();
    }
}

//Download the results(kml files)

function run_download_results() {
    //Download sasin and streams features
    if(basin_layer.getSource().getFeatures().length != 0) {
        download_features("basin.kml", basin_layer.getSource().getFeatures());
    }
    if(streams_layer.getSource().getFeatures().length != 0) {
        download_features("streams.kml", streams_layer.getSource().getFeatures());
    }
    if(upstream_layer.getSource().getFeatures().length != 0) {
        download_features("upstream.kml", upstream_layer.getSource().getFeatures());
    }
    if(downstream_layer.getSource().getFeatures().length != 0) {
        download_features("downstream.kml", downstream_layer.getSource().getFeatures());
    }
}

function download_features(filename, features) {
    //This function only works on HTML5 browsers.
    var kmlformat = new ol.format.KML();
    var filetext = kmlformat.writeFeatures(features, {'dataProjection':'EPSG:4326','featureProjection': 'EPSG:3857'});
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(filetext));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


//Upload basin and streams kml file to hydroshare

var csrftoken = $.cookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

$('#hydroshare-proceed').on('click', function ()  {
           //This function only works on HTML5 browsers.
    var kmlformat = new ol.format.KML();
    var basin_kml_filetext = kmlformat.writeFeatures(basin_layer.getSource().getFeatures(), {'dataProjection': 'EPSG:4326', 'featureProjection': 'EPSG:3857'});
    var streams_kml_filetext = kmlformat.writeFeatures(streams_layer.getSource().getFeatures(), {'dataProjection':'EPSG:4326','featureProjection': 'EPSG:3857'});
    var upstream_kml_filetext = kmlformat.writeFeatures(upstream_layer.getSource().getFeatures(), {'dataProjection':'EPSG:4326','featureProjection': 'EPSG:3857'});
    var downstream_kml_filetext = kmlformat.writeFeatures(downstream_layer.getSource().getFeatures(), {'dataProjection':'EPSG:4326','featureProjection': 'EPSG:3857'});


    displayStatus.removeClass('error');
    displayStatus.addClass('uploading');
    displayStatus.html('<em>Uploading...</em>');
    var resourceTypeSwitch = function(typeSelection) {
        var options = {
            'Generic': 'GenericResource',
            'Geographic Raster': 'RasterResource',
            'HIS Referenced Time Series': 'RefTimeSeries',
            'Model Instance': 'ModelInstanceResource',
            'Model Program': 'ModelProgramResource',
            'Multidimensional (NetCDF)': 'NetcdfResource',
            'Time Series': 'TimeSeriesResource',
            'Application': 'ToolResource'
        };
        return options[typeSelection];
    };

    var resourceAbstract = $('#resource-abstract').val();
    var resourceTitle = $('#resource-title').val();
    var resourceKeywords = $('#resource-keywords').val() ? $('#resource-keywords').val() : "";
    var resourceType = resourceTypeSwitch($('#resource-type').val());

     if (!resourceTitle || !resourceKeywords || !resourceAbstract) {
        displayStatus.removeClass('uploading');
        displayStatus.addClass('error');
        displayStatus.html('<em>You must provide all metadata information.</em>');
        return;
    }

    $(this).prop('disabled', true);
    $.ajax({
        type: 'POST',
        url: 'upload-to-hydroshare/',
        dataType:'json',
        data: {
                'basin_kml_filetext': basin_kml_filetext,
                'streams_kml_filetext': streams_kml_filetext,
                'upstream_kml_filetext': upstream_kml_filetext,
                'downstream_kml_filetext': downstream_kml_filetext,
                'r_title': resourceTitle,
                'r_type': resourceType,
                'r_abstract': resourceAbstract,
                'r_keywords': resourceKeywords
                        },
        success: function (data) {
            debugger;
            $('#hydroshare-proceed').prop('disabled', false);
            if ('error' in data) {
                displayStatus.removeClass('uploading');
                displayStatus.addClass('error');
                displayStatus.html('<em>' + data.error + '</em>');
            }
            else
            {
                displayStatus.removeClass('uploading');
                displayStatus.addClass('success');
                displayStatus.html('<em>' + data.success + ' View in HydroShare <a href="https://www.hydroshare.org/resource/' + data.newResource +
                    '" target="_blank">HERE</a></em>');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error");
            debugger;
            $('#hydroshare-proceed').prop('disabled', false);
            console.log(jqXHR + '\n' + textStatus + '\n' + errorThrown);
            displayStatus.removeClass('uploading');
            displayStatus.addClass('error');
            displayStatus.html('<em>' + errorThrown + '</em>');
        }
    });
});

function waiting_pis() {
    var wait_text = "<strong>Loading...</strong><br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='/static/watershed_delin/images/earth_globe.gif'>";
    document.getElementById('search_output').innerHTML = wait_text;
}

function waiting_output() {
    var wait_text = "<strong>Loading...</strong><br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='/static/watershed_delin/images/earth_globe.gif'>";
    document.getElementById('waiting_output').innerHTML = wait_text;
}
