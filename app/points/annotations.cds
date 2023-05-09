using TPEService as service from '../../srv/tpeservice';

annotate service.Points with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: name,
    },
    {
        $Type: 'UI.DataField',
        Value: capacity,
    },
    {
        $Type: 'UI.DataField',
        Value: descr,
    },


]);

annotate service.Points with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: name,
            },
            {
                $Type: 'UI.DataField',
                Value: capacity,
            },
            {
                $Type: 'UI.DataField',
                Value: descr,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Ponto',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
