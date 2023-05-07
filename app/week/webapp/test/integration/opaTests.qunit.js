sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/week/test/integration/FirstJourney',
		'ns/week/test/integration/pages/WeekList',
		'ns/week/test/integration/pages/WeekObjectPage'
    ],
    function(JourneyRunner, opaJourney, WeekList, WeekObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/week') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheWeekList: WeekList,
					onTheWeekObjectPage: WeekObjectPage
                }
            },
            opaJourney.run
        );
    }
);