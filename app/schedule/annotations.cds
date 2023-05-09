using TPEService as service from '../../srv/tpeservice';

annotate service.Schedule with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: name,
    },
    {
        $Type: 'UI.DataField',
        Value: begin,
    },
    {
        $Type: 'UI.DataField',
        Value: end,
    },
]);

annotate service.Schedule with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: name,
            },
            {
                $Type: 'UI.DataField',
                Value: begin,
            //          ![@Common.FieldControl]       : #ReadOnly,
            },
            {
                $Type: 'UI.DataField',
                Value: end,
            //        ![@Common.FieldControl]       : #ReadOnly,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Escala',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);

//annotate service.Schedule with @Capabilities: {UpdateRestrictions: {Updatable: false}, };
