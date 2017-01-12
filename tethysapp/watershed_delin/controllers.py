import tempfile
import shutil
import os
import traceback
import logging

from tethys_sdk.gizmos import Button, TextInput, SelectInput
from oauthlib.oauth2 import TokenExpiredError
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

logger = logging.getLogger(__name__)
try:
    from tethys_services.backends.hs_restclient_helper import get_oauth_hs
except ImportError:
    logger.error("could not load: tethys_services.backends.hs_restclient_helper import get_oauth_hs")

@login_required
def home(request):
    """
    Controller for the app home page.
    """

     # Pre-populate lat-picker and lon_picker from model
    select_input = SelectInput(display_text='Basemap',
                            name='select_input',
                            multiple=False,
                            options=[('Bing', 'bing_layer'), ('MapQuest', 'mapQuest_layer'), ('OpenStreet', 'openstreet_layer'), ('Stamen', 'stamen_layer')],
                            original=['Bing'],
                            attributes="id=selectInput onchange=run_select_basemap()")

    txtLocation = TextInput(display_text='Location Search:',
                            name="txtLocation",
                            initial="",
                            disabled=False,
                            attributes="onkeypress=handle_search_key(event);")

    btnSearch = Button(display_text="Search",
                        name="btnSearch",
                        attributes="onclick=run_geocoder();",
                        submit=False)

    select_navigation = SelectInput(display_text="",
                                name='select_navigation',
                                multiple=False,
                                options=[('Select EPA WATERS Service', 'select'), ('Delineate watershed','DeWa'), ('Upstream mainstem', 'UM'), ('Upstream with tributaries', 'UT'), ('Downstream mainstem', 'DM'), ('Downstream with divergences', 'DD')],
                                original=['Select EPA WATERS Service'],
                                attributes="id=select_navigation onchange=select_function();")

    # Pass variables to the template via the context dictionary
    context = {'select_input': select_input,
               'txtLocation': txtLocation,
               'btnSearch': btnSearch,
               'select_navigation': select_navigation
            }
    return render(request, 'watershed_delin/home.html', context)

@login_required
def upload_to_hydroshare(request):

    temp_dir = None
    try:
        return_json = {}
        if request.method == 'POST':
            get_data = request.POST

            basin_kml_filetext = str(get_data['basin_kml_filetext'])
            streams_kml_filetext = str(get_data['streams_kml_filetext'])
            upstream_kml_filetext = str(get_data['upstream_kml_filetext'])
            downstream_kml_filetext = str(get_data['downstream_kml_filetext'])
            r_title = str(get_data['r_title'])
            r_type = str(get_data['r_type'])
            r_abstract = str(get_data['r_abstract'])
            r_keywords_raw = str(get_data['r_keywords'])
            r_keywords = r_keywords_raw.split(',')

            # startup a Hydroshare instance with user's credentials
            # auth = HydroShareAuthBasic(username=hs_username, password=hs_password)
            # hs = HydroShare(auth=auth, hostname="www.hydroshare.org", use_https=True)
            #hs = getOAuthHS(request)
            hs = get_oauth_hs(request)

            #download the kml file to a temp directory
            temp_dir = tempfile.mkdtemp()

            basin_kml_file_path = os.path.join(temp_dir, "basin.kml")
            streams_kml_file_path = os.path.join(temp_dir, "streams.kml")
            upstream_kml_file_path = os.path.join(temp_dir, "upstream.kml")
            downstream_kml_file_path = os.path.join(temp_dir, "downstream.kml")


            with open(basin_kml_file_path, 'w') as fd:
                        fd.write(basin_kml_filetext)

            with open(streams_kml_file_path, 'w') as fd:
                    fd.write(streams_kml_filetext)

            with open(upstream_kml_file_path, 'w') as fd:
                    fd.write(upstream_kml_filetext)

            with open(downstream_kml_file_path, 'w') as fd:
                    fd.write(downstream_kml_filetext)


            #upload the temp file to HydroShare
            if os.path.exists(basin_kml_file_path):
                basin_resource_id = hs.createResource(r_type, r_title, resource_file=basin_kml_file_path,
                                                      keywords=r_keywords, abstract=r_abstract)
                resource_id = hs.addResourceFile(basin_resource_id, streams_kml_file_path)
                resource_id = hs.addResourceFile(basin_resource_id, upstream_kml_file_path)
                resource_id = hs.addResourceFile(basin_resource_id, downstream_kml_file_path)
                return_json['success'] = 'File uploaded successfully!'
                return_json['newResource'] = resource_id
                return_json['hs_domain'] = hs.hostname
            else:
                raise

    except ObjectDoesNotExist as e:
        logger.exception(e.message)
        return_json['error'] = 'Login timed out! Please re-sign in with your HydroShare account.'
    except TokenExpiredError as e:
        logger.exception(e.message)
        return_json['error'] = 'Login timed out! Please re-sign in with your HydroShare account.'
    except Exception, err:
        logger.exception(err.message)
        if "401 Unauthorized" in str(err):
            return_json['error'] = 'Username or password invalid.'
        elif "400 Bad Request" in str(err):
            return_json['error'] = 'File uploaded successfully despite 400 Bad Request Error.'
        else:
            traceback.print_exc()
            return_json['error'] = 'HydroShare rejected the upload for some reason.'
    finally:
        if temp_dir != None:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
        logger.debug(return_json)
        return JsonResponse(return_json)
