using TPEService as service from '../../srv/tpeservice';

annotate service.Week with @(UI.LineItem: [


    {
        $Type: 'UI.DataField',
        Label: 'Dia da Semana',
        Value: name_code,
    },
    {
        $Type: 'UI.DataField',
        Label: 'Ponto',
        Value: point_ID,
    },
    {
        $Type: 'UI.DataField',
        Label: 'Período',
        Value: period_name,
    },
            {
                $Type: 'UI.DataField',
                Label: 'Dia especial',
                Value: specialDay,
            }
]);

annotate service.Week with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Dia da Semana',
                Value: name_code,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Ponto',
                Value: point_ID,

            },
            {
                $Type: 'UI.DataField',
                Label: 'Período',
                Value: period_name,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Dia especial',
                Value: specialDay,
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

annotate service.Week with {

    name   @(Common: {
        Text           : name.day,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : 'Days of the Week',
            CollectionPath: 'DaysOfWeek',

            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: name_code,
                    ValueListProperty: 'code'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'day'
                },

            ]
        }
    });

    point  @(Common: {
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

    period @(Common: {
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
}
