using TPEService as service from '../../srv/tpeservice';

annotate service.Report with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: schedule_name,
    },
    {
        $Type: 'UI.DataField',
        Value: day,
    },
    {
        $Type: 'UI.DataField',
        Value: dayweek_code,
    },
    {
        $Type: 'UI.DataField',
        Value: point_ID,
    },
    {
        $Type: 'UI.DataField',
        Value: period_name,
    },
    {
        $Type: 'UI.DataField',
        Value: user_ID,
    }
]);

annotate service.Report with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: schedule_name,
            },
            {
                $Type: 'UI.DataField',
                Value: day,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Dia da Semana',
                Value: dayweek_code,
            },
            {
                $Type: 'UI.DataField',
                Value: point_ID,
            },
            {
                $Type: 'UI.DataField',
                Value: period_name,
            },
            {
                $Type: 'UI.DataField',
                Value: user_ID,
            }
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);


annotate service.Report with {
    schedule @(Common: {ValueList: {
        Label         : 'Escala',
        CollectionPath: 'Schedule',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: schedule_name,
            ValueListProperty: 'name'
        }]
    }});
    user     @(Common: {
        Text           : user.name,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : 'Usuário',
            CollectionPath: 'Users',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: user_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name'
                }
            ]
        }
    });

    point    @(Common: {
        //show text, not id for mitigation in the context of risks
        Text           : point.name,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : 'Ponto',
            CollectionPath: 'Points',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: point_ID,
                    ValueListProperty: 'ID'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'descr'
                }
            ]
        }
    });

    period   @(Common: {
        //show text, not id for mitigation in the context of risks
        Text           : period.descr,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : 'Período',
            CollectionPath: 'Periods',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: period_name,
                    ValueListProperty: 'name'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'descr'
                }


            ]
        }
    });

    dayweek  @(Common: {
        Text           : dayweek.day,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : 'Days of the Week',
            CollectionPath: 'DaysOfWeek',

            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: dayweek_code,
                    ValueListProperty: 'code'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'day'
                },

            ]
        }
    });
}
