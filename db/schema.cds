namespace tpens;

using {managed} from '@sap/cds/common';

entity UsersTable : managed {
    key ID              : UUID                    @(Core.Computed: true);
        name            : String not null         @mandatory;
        gender          : Association to GenTable @mandatory;
        birth_date      : Date not null           @mandatory;
        lastime         : Date not null           @mandatory;
        desativado      : Boolean;
        seg             : String(10);
        ter             : String(10);
        qua             : String(10);
        qui             : String(10);
        sex             : String(10);
        sab             : String(10);
        dom             : String(10);
        criticality     : Integer;
        age             : Integer;
        lastdayCount    : Integer;
        email           : String                  @assert.format: '^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}|)$';
        phone           : String                  @assert.format: '^((\([0-9]{2}\))\s([0-9]{4,5})-([0-9]{4})|)$';
        whatsapp        : String;
        partner         : Association to UsersTable;
        history_partner : String;
        status          : Integer;
        statusText      : String;
        par             : Boolean;
        impar           : Boolean;
        lastPartner     : Association to UsersTable;

};

entity PointsTable : managed {
    key ID       : UUID             @(Core.Computed: true);
        name     : String not null  @mandatory;
        capacity : Integer not null @mandatory;
        descr    : String not null  @mandatory;

}

entity PeriodsTable : managed {
    key name  : String(1) not null @mandatory;
        descr : String not null    @mandatory;
}

entity WeekTable : managed {
    key ID         : UUID                           @(Core.Computed: true);
        nameweek   : Association to DaysOfWeekTable @mandatory;
        point      : Association to PointsTable     @mandatory;
        period     : Association to PeriodsTable    @mandatory;
        specialDay : Date;
}

entity DaysOfWeekTable : managed {
    key code : Integer not null;
        day  : String;
}

entity GenTable : managed {
    key code : String(1);
        sexo : String;
}

entity ScheduleTable : managed {
    key name  : String not null @mandatory;
    key begin : Date            @mandatory default '';
    key end   : Date            @mandatory default '';
}


entity ReportTable : managed {
    key ID       : UUID                         @(Core.Computed: true);
        schedule : Association to ScheduleTable @mandatory;
        day      : Date not null                @mandatory;
        dayweek  : Association to DaysOfWeekTable;
        point    : Association to PointsTable   @mandatory;
        period   : Association to PeriodsTable  @mandatory;
        user     : Association to UsersTable    @mandatory;
}
