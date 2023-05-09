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
        $Type                : 'UI.DataField',
        Value                : age,
        Criticality          : criticality,
        ![@HTML5.CssDefaults]: {width: '5rem'}


    },
    {
        $Type                : 'UI.DataField',
        Value                : lastdayCount,
        ![@HTML5.CssDefaults]: {width: '5rem'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : seg,
        ![@HTML5.CssDefaults]: {width: '5rem'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : ter,
        ![@HTML5.CssDefaults]: {width: '5rem'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : qua,
        ![@HTML5.CssDefaults]: {width: '5rem'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : qui,
        ![@HTML5.CssDefaults]: {width: '5rem'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : sex,
        ![@HTML5.CssDefaults]: {width: '5rem'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : sab,
        ![@HTML5.CssDefaults]: {width: '5rem'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : dom,
        ![@HTML5.CssDefaults]: {width: '5rem'}
    }

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
                Value: partner_ID,
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
    UI.FieldGroup #GeneratedGroup3: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: email,
            },
            {
                $Type: 'UI.DataField',
                Value: phone,
            },
            {
                $Type                  : 'UI.DataFieldWithUrl',
                Url                    : whatsapp,
                Value                  : whatsapp,
                ![@Common.FieldControl]: #ReadOnly
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
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet3',
            Label : 'Contatos',
            Target: '@UI.FieldGroup#GeneratedGroup3'
        }
    ]

);

annotate service.Users with {
    partner @(Common: {
        Text           : partner.name,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : 'Usuário',
            CollectionPath: 'Users',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: partner_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name'
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'age',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'lastdayCount',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'dom',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'seg',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'ter',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'qua',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'qui',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'sex',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                },

                {
                    $Type                : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty    : 'sab',
                    ![@HTML5.CssDefaults]: {width: '5rem'}
                }
            ]
        }
    });

    gender  @(Common: {ValueList: {

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
