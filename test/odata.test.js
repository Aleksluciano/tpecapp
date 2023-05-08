const cds = require("@sap/cds/lib");
const { GET, expect } = cds.test(__dirname + "/../");

const {
  selectUsersByGender,
  sortByLastime,
  checkGender,
} = require("../srv/utils");
const { createSchedule, createReport } = require("../srv/utils");

describe("TPEService", () => {
  cds.test.in(__dirname + "/../").run("serve", "--in-memory");

  it("should select users by gender", async () => {
    const { data } = await GET("service/tpe/Users");
    const users = data.value;
    const gender = "M";
    const areAllUsersMen = selectUsersByGender(users, gender).every((user) =>
      checkGender(user, gender)
    );
    expect(areAllUsersMen).equal(true);
  });

  it("should order users by lastime older", async () => {
    const { data } = await GET("service/tpe/Users");
    const users = data.value;
    const user = sortByLastime(users)[0];
    expect(user).to.have.property("name").to.equal("Carlos Pereira");
  });

  it("should have the correct date for Schedule", async () => {
    const { data } = await GET("service/tpe/Schedule");
    const schedules = data.value;
    const schedule = schedules[0];

    expect(schedule).to.have.property("end").to.equal("2023-01-15");
  });

  it("should create a object based in Schedule", async () => {
    let { data: dataSchedule } = await GET("service/tpe/Schedule");
    const schedules = dataSchedule.value;
    const schedule = schedules[0];
    /*  let { data: dataWeek } = await GET(
      "service/tpe/Week?$expand=name,point,period"
    ); */
    let { data: dataWeek } = await GET("service/tpe/Week");
    let { data: dataPoints } = await GET("service/tpe/Points");
    let { data: dataPeriods } = await GET("service/tpe/Periods");
    const weeks = dataWeek.value;
    const points = dataPoints.value;
    const periods = dataPeriods.value;

    const rangeDate = createSchedule(schedule);
    const secondDay = rangeDate[1];

    expect(secondDay.day).equal("2023-01-02");
    expect(secondDay.nameDayWeek).equal("segunda");
    expect(secondDay.codeDayWeek).equal(1);
    createReport(rangeDate, weeks, points, periods);
  });
  it("should get correctly the Week data", async () => {
    const { data } = await GET("service/tpe/Week");
    const dataWeek = data;
    const weeks = dataWeek.value;
    const week = weeks[0];
    expect(week.name_code).equal(1);
  });

  it("should test methods", async () => {
    let { data: dataWeek } = await GET("service/tpe/Week");
    let { data: dataPoints } = await GET("service/tpe/Points");
    let { data: dataPeriods } = await GET("service/tpe/Periods");
    const { data: dataUsers } = await GET("service/tpe/Users");

    const weeks = dataWeek.value;
    const points = dataPoints.value;
    const periods = dataPeriods.value;
    const users = dataUsers.value;

    const dispodayweek = {
      0: "dom",
      1: "seg",
      2: "ter",
      3: "qua",
      4: "qui",
      5: "sex",
      6: "sab",
    };
    const rangeDate = createSchedule({
      name: "MAR",
      begin: "2022-04-01",
      end: "2022-04-30",
    });
    const designations = createReport(rangeDate, weeks, points);
    let sex = "";
    let date = "";
    let period = "";
    let userIndex = -1;
    //console.log("A1");
    for (const desig of designations) {
      // console.log("A2");
      if (desig.user == "") {
        if (date != desig.day || period != desig.period) {
          date = desig.day;
          period = desig.period;

          userIndex = users.findIndex(
            (u) =>
              u[dispodayweek[desig.dayWeek]] &&
              u[dispodayweek[desig.dayWeek]].includes(desig.period)
          );
          //  console.log("A3");
        } else {
          userIndex = users.findIndex(
            (u) =>
              u[dispodayweek[desig.dayWeek]] &&
              u[dispodayweek[desig.dayWeek]]
                .toString()
                .includes(desig.period) &&
              u.gender_code == sex
          );
        }
        if (
          userIndex !== -1 &&
          !designations.find(
            (u) =>
              u.user == users[userIndex].ID &&
              u.day == desig.day &&
              u.period == desig.period
          )
        ) {
          // console.log("A3");
          const userSelected = users.splice(userIndex, 1)[0];
          desig.user = userSelected.ID;
          desig.userName = userSelected.name;
          desig.userGender = userSelected.gender_code;
          sex = desig.userGender;
          users.push(userSelected);
        }
      }
    }
    console.log("DESIGNATIONS", designations);

    // const gender = "H";
    // const areAllUsersMen = selectUsersByGender(users, gender).every((user) =>
    //   checkGender(user, gender)
    // );
    //expect(users[0].lastime).equal('2022-04-22');
  });
});
