sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/report/test/integration/FirstJourney',
		'ns/report/test/integration/pages/ReportList',
		'ns/report/test/integration/pages/ReportObjectPage'
    ],
    function(JourneyRunner, opaJourney, ReportList, ReportObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/report') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheReportList: ReportList,
					onTheReportObjectPage: ReportObjectPage
                }
            },
            opaJourney.run
        );
    }
);