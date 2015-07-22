from django.shortcuts import render
from tethys_gizmos.gizmo_options import MapView, MVLayer, MVView
from tethys_apps.sdk.gizmos import Button, TextInput

def home(request):
    """
    Controller for the app home page.
    """
    # Define initial view for Map View
    view_options = MVView(
        projection='EPSG:4326',
        center=[-100, 40],
        zoom=3.5,
        maxZoom=18,
        minZoom=2
    )

    # Configure the map
    map_options = MapView(height='500px',
                          width='100%',
                          view=view_options,
                          legend=False)


     # Pre-populate lat-picker and lon_picker from model
    txtLocation = TextInput(display_text='Location Search:',
                    name="txtLocation",
                    initial="",
                    disabled=False,
                    attributes="onkeypress=handle_search_key(event);")

    btnSearch = Button(display_text="Search",
                        name="btnSearch",
                        attributes="onclick=run_geocoder();",
                        submit=False)

    btnDelineate = Button(display_text="Delineate Watershed",
                        name="btnDelineate",
                        attributes="id=btnDelineate onclick=run_navigation_delineation_service();",
                        submit=False)

    btnDownload = Button(display_text="Download Results",
                    name="btnDownload",
                    attributes="id=btnDownload onclick=run_download_results();",
                    submit=False)

    # Pass variables to the template via the context dictionary
    context = {'map_options': map_options,
               'txtLocation':txtLocation,
               'btnSearch':btnSearch,
               'btnDelineate':btnDelineate,
               'btnDownload':btnDownload}



    return render(request, 'watershed_delin/home.html', context)