sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/points/test/integration/FirstJourney',
		'ns/points/test/integration/pages/PointsList',
		'ns/points/test/integration/pages/PointsObjectPage'
    ],
    function(JourneyRunner, opaJourney, PointsList, PointsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/points') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePointsList: PointsList,
					onThePointsObjectPage: PointsObjectPage
                }
            },
            opaJourney.run
        );
    }
);