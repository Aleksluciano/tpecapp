sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/periods/test/integration/FirstJourney',
		'ns/periods/test/integration/pages/PeriodsList',
		'ns/periods/test/integration/pages/PeriodsObjectPage'
    ],
    function(JourneyRunner, opaJourney, PeriodsList, PeriodsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/periods') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePeriodsList: PeriodsList,
					onThePeriodsObjectPage: PeriodsObjectPage
                }
            },
            opaJourney.run
        );
    }
);