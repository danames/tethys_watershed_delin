from tethys_apps.base import TethysAppBase, url_map_maker


class WatershedDelineation(TethysAppBase):
    """
    Tethys app class for Watershed Delineation.
    """

    name = 'EPA WATERS Services'
    index = 'watershed_delin:home'
    icon = 'watershed_delin/images/icon_1.gif'
    package = 'watershed_delin'
    root_url = 'watershed-delin'
    color = '#34495e'
    description =   'This app allows you to perform various navigation and data exploration tasks on the NHD Plus data set using web services provided by the United States Environmental Protection Agency'
        
    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (UrlMap(name='home',
                           url='watershed-delin',
                           controller='watershed_delin.controllers.home'),
                    UrlMap(name='upload_to_hydroshare_ajax',
                           url='watershed-delin/upload-to-hydroshare',
                           controller='watershed_delin.controllers.upload_to_hydroshare'),
                    UrlMap(name='pywps',
                       url='watershed-delin/pywps',
                       controller='watershed_delin.controllers.pywps_handler'),
        )

        return url_maps