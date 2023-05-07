namespace tpens;

using {managed} from '@sap/cds/common';


entity UsersTable : managed {
    key ID           : UUID            @(Core.Computed: true);
        name         : String not null @mandatory;
        gender       : Association to GenTable;
        birth_date   : Date not null   @UI.HiddenFilter;
        lastime      : Date not null;
        desativado   : Boolean;
        seg          : Integer;
        ter          : Integer;
        qua          : Integer;
        qui          : Integer;
        sex          : Integer;
        sab          : Integer;
        dom          : Integer;
        criticality  : Integer;
        age          : Integer;
        lastdayCount : Integer;

};

entity PointsTable : managed {
    key ID       : UUID @(Core.Computed: true);
        name     : String not null;
        capacity : Integer not null;
        descr    : String not null;

}

entity PeriodsTable : managed {
    key name  : String(1) not null;
        descr : String not null;
}

entity WeekTable : managed {
    key ID     : UUID @(Core.Computed: true);
        name   : Association to DaysOfWeekTable;
        point  : Association to PointsTable;
        period : Association to PeriodsTable;
}

entity DaysOfWeekTable : managed {
    key code : Integer not null;
        day  : String;
}

entity GenTable : managed {
    key code : String;
        sexo : String;
}

entity ScheduleTable : managed {
    key name  : String;
    key begin : Date not null;
    key end   : Date not null;
}


entity ReportTable : managed {
    key ID       : UUID @(Core.Computed: true);
        schedule : Association to ScheduleTable;
        day      : Date not null;
        dayweek  : Association to DaysOfWeekTable;
        point    : Association to PointsTable;
        period   : Association to PeriodsTable;
        user     : Association to UsersTable;
}
