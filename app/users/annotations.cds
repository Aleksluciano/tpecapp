using TPEService as service from '../../srv/tpeservice';

annotate service.Users with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: name,
    },
    {
        $Type: 'UI.DataField',
        Value: gender_code,
    },
    {
        $Type      : 'UI.DataField',
        Value      : age,
        Criticality: criticality

    },
    {
        $Type: 'UI.DataField',
        Value: lastdayCount,
    },

]);

annotate service.Users with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: name,
            },
            {
                $Type: 'UI.DataField',
                Value: gender_code,
            },
            {
                $Type: 'UI.DataField',
                Value: birth_date,

            },
            {
                $Type                  : 'UI.DataField',
                Value                  : age,
                Criticality            : criticality,
                ![@Common.FieldControl]: #ReadOnly,

            },
            {
                $Type: 'UI.DataField',
                Value: lastime,
            },
            {
                $Type                  : 'UI.DataField',
                Value                  : lastdayCount,
                ![@Common.FieldControl]: #ReadOnly,
            },
            {
                $Type: 'UI.DataField',
                Value: desativado,
            }
        ],
    },
    UI.FieldGroup #GeneratedGroup2: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: seg,
            },
            {
                $Type: 'UI.DataField',
                Value: ter,
            },
            {
                $Type: 'UI.DataField',
                Value: qua,
            },
            {
                $Type: 'UI.DataField',
                Value: qui,
            },
            {
                $Type: 'UI.DataField',
                Value: sex,
            },
            {
                $Type: 'UI.DataField',
                Value: sab,
            },
            {
                $Type: 'UI.DataField',
                Value: dom,
            }
        ],
    },
    UI.Facets                     : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'Perfil',
            Target: '@UI.FieldGroup#GeneratedGroup1'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet2',
            Label : 'Disponibilidade',
            Target: '@UI.FieldGroup#GeneratedGroup2'
        },
    ]

);

annotate service.Users with {

    gender @(Common: {ValueList: {

        Label         : 'Sexo',
        CollectionPath: 'Gender',

        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: gender_code,
                ValueListProperty: 'code'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'sexo'
            },

        ]
    }});
}
