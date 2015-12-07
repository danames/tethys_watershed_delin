import sys
import tempfile
import shutil
import os
import traceback

from tethys_gizmos.gizmo_options import MapView, MVLayer, MVView
from tethys_apps.sdk.gizmos import Button, TextInput, SelectInput
from hs_restclient import HydroShare, HydroShareAuthBasic
from oauthlib.oauth2 import TokenExpiredError
from hs_restclient import HydroShare, HydroShareAuthOAuth2, HydroShareNotAuthorized, HydroShareNotFound
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from social_auth.models import UserSocialAuth
from django.conf import settings


hs_hostname = "www.hydroshare.org"


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


def getOAuthHS(request):

    client_id = getattr(settings, "SOCIAL_AUTH_HYDROSHARE_KEY", "None")
    client_secret = getattr(settings, "SOCIAL_AUTH_HYDROSHARE_SECRET", "None")

    # this line will throw out from django.core.exceptions.ObjectDoesNotExist if current user is not signed in via HydroShare OAuth
    token = request.user.social_auth.get(provider='hydroshare').extra_data['token_dict']
    auth = HydroShareAuthOAuth2(client_id, client_secret, token=token)
    hs = HydroShare(auth=auth, hostname=hs_hostname)

    return hs


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
            hs = getOAuthHS(request)

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
            else:
                raise

    except ObjectDoesNotExist as e:
        print ("1231")
        print str(e)
        return_json['error'] = 'Login timed out! Please re-sign in with your HydroShare account.'
    except TokenExpiredError as e:
        print str(e)
        return_json['error'] = 'Login timed out! Please re-sign in with your HydroShare account.'
    except Exception, err:
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
        print return_json
        return JsonResponse(return_json)
