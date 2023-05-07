sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/schedule/test/integration/FirstJourney',
		'ns/schedule/test/integration/pages/ScheduleList',
		'ns/schedule/test/integration/pages/ScheduleObjectPage'
    ],
    function(JourneyRunner, opaJourney, ScheduleList, ScheduleObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/schedule') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheScheduleList: ScheduleList,
					onTheScheduleObjectPage: ScheduleObjectPage
                }
            },
            opaJourney.run
        );
    }
);