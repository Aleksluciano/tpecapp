using {tpens as my} from '../db/schema';

@path: 'service/tpe'
service TPEService {

    entity Users      as projection on my.UsersTable;
    annotate Users with @odata.draft.enabled;
    entity Points     as projection on my.PointsTable;
    annotate Points with @odata.draft.enabled;
    entity Periods    as projection on my.PeriodsTable;
    annotate Periods with @odata.draft.enabled;
    entity Week       as projection on my.WeekTable;
    annotate Week with @odata.draft.enabled;
    entity DaysOfWeek as projection on my.DaysOfWeekTable;
    annotate DaysOfWeek with @odata.draft.enabled;
    entity Schedule   as projection on my.ScheduleTable;
    annotate Schedule with @odata.draft.enabled;
    entity Report     as projection on my.ReportTable;
    annotate Report with @odata.draft.enabled;
    entity Gender     as projection on my.GenTable;
    annotate Gender with @odata.draft.enabled;

}
