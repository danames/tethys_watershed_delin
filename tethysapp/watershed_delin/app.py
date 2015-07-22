from tethys_apps.base import TethysAppBase, url_map_maker


class WatershedDelineation(TethysAppBase):
    """
    Tethys app class for Watershed Delineation.
    """

    name = 'Watershed Delineation'
    index = 'watershed_delin:home'
    icon = 'watershed_delin/images/icon.gif'
    package = 'watershed_delin'
    root_url = 'watershed-delin'
    color = '#34495e'
        
    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (UrlMap(name='home',
                           url='watershed-delin',
                           controller='watershed_delin.controllers.home'),
        )

        return url_maps