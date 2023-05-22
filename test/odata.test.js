const cds = require("@sap/cds/lib");
const { GET, expect } = cds.test(__dirname + "/../");

const {
  createReport,
  createSchedule,
  findAnyUser,
  findUserByGender,
  findUserWithPartner,
  removeScheduleIncomplete,
} = require("../srv/utils");

const user = require("@sap/cds/lib/req/user");

describe("TPEService", () => {
  cds.test.in(__dirname + "/../").run("serve", "--in-memory");
  //cds.test.in(__dirname + "/../").run("serve");

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
    let users = dataUsers.value;

    const rangeDate = createSchedule({
      name: "MAR",
      begin: "2023-04-01",
      end: "2023-04-30",
    });
    console.log("weeks,points", weeks, points);
    const designations = createReport(rangeDate, weeks, points);

    users = USERSfake.map((obj) => Object.assign({}, obj)).filter(
      (u) => !u.desativado
    );

    let date = "";
    let period = "";
    let userFirstPatner = null;
    let gender_changed_already = false;
    // let gende_change = false;
    for (let i = 0; i < designations.length; ) {
      const desig = designations[i];
      i++;

      const firtAssignDatePeriod =
        date !== desig.day || period !== desig.period;
      const sameDate = date == desig.day && period == desig.period;

      if (!sameDate) {
        // console.log("ordenação", users);
        users.sort((a, b) => {
          // Convert string to date object for comparison.
          let dateA = new Date(a.lastime);
          let dateB = new Date(b.lastime);

          // Return 1 if dateA is less than dateB, -1 if dateA is greater than dateB, or 0 if they're equal.
          // The inversion is achieved by swapping the places of dateA and dateB in the comparison.
          return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
        });
        // console.log("ordenação", users);
      }

      date = desig.day;
      period = desig.period;
      if (firtAssignDatePeriod) {
        gender_changed_already = false;
        const userFound = findAnyUser(users, desig, designations);
        userFirstPatner = userFound;
        if (userFound) {
          desig.user = userFound.ID;
          desig.userName = userFound.name;
          desig.userGender = userFound.gender_code;
          userFound.lastime = desig.day;
        }
      } else {
        if (userFirstPatner) {
          let userFound = null;
          if (userFirstPatner.partner_ID) {
            userFound = findUserWithPartner(users, userFirstPatner.partner_ID);
          }
          if (!userFirstPatner.partner_ID) {
            userFound = findUserByGender(
              users,
              desig,
              designations,
              userFirstPatner.gender_code
            );
          }

          if (userFound) {
            desig.user = userFound.ID;
            desig.userName = userFound.name;
            desig.userGender = userFound.gender_code;
            userFound.lastime = desig.day;
          } else if (!userFound && gender_changed_already == false) {
            gender_changed_already = true;
            //back first position and change gender to avoid a empty space
            i -= 2;
            const desigback = designations[i];
            if (desigback.user !== "") {
              const userReset = USERSfake.find((u) => u.ID == desigback.user);
              if (userReset) {
                const userRemoved = users.find((u) => u.ID == desigback.user);
                console.log(
                  "RESET DATA USER",
                  userRemoved.lastime,
                  userReset.lastime
                );
                userRemoved.lastime = userReset.lastime;
              }
            }
            console.log("DESIGNBACK", desigback);

            const userFoundBack = findAnyUser(users, desig, designations);

            console.log("userFoundBack", userFoundBack);
            userFirstPatner = userFoundBack;
            if (userFoundBack) {
              i++;
              desigback.user = userFoundBack.ID;
              desigback.userName = userFoundBack.name;
              desigback.userGender = userFoundBack.gender_code;
              userFoundBack.lastime = desigback.day;
            } else {
              i++;
              desigback.user = "";
              desigback.userName = "";
              desigback.userGender = "";
            }
          }
        }
      }
    }

    const designationsCompleted = removeScheduleIncomplete([...designations]);
    console.log("DESIGNATIONS", designationsCompleted);
    // console.log("DESIGNATIONS", designations);
  }); //method
}); //Service

/* const dispodayweek = {
  0: "dom",
  1: "seg",
  2: "ter",
  3: "qua",
  4: "qui",
  5: "sex",
  6: "sab",
};

const findAnyUser = (users, desig, designations) => {
  let user = null;
  if (desig.dayWeek == 8) {
    user = users.find(
      (u) =>
        ((u[dispodayweek[6]] && u[dispodayweek[6]].includes(desig.period)) ||
          (u[dispodayweek[0]] && u[dispodayweek[0]].includes(desig.period))) &&
        notDesignedYet(u, desig, designations)
    );
  } else {
    user = users.find(
      (u) =>
        u[dispodayweek[desig.dayWeek]] &&
        u[dispodayweek[desig.dayWeek]].includes(desig.period) &&
        notDesignedYet(u, desig, designations)
    );
  }
  return user;
};
const findUserByGender = (users, desig, designations, gender_code) => {
  let user = null;
  if (desig.dayWeek == 8) {
    user = users.find(
      (u) =>
        !u.partner_ID &&
        u.gender_code == gender_code &&
        ((u[dispodayweek[6]] && u[dispodayweek[6]].includes(desig.period)) ||
          (u[dispodayweek[0]] && u[dispodayweek[0]].includes(desig.period))) &&
        notDesignedYet(u, desig, designations)
    );
  } else {
    user = users.find(
      (u) =>
        !u.partner_ID &&
        u.gender_code == gender_code &&
        u[dispodayweek[desig.dayWeek]] &&
        u[dispodayweek[desig.dayWeek]].includes(desig.period) &&
        notDesignedYet(u, desig, designations)
    );
  }
  return user;
};
const findUserWithPartner = (users, partner_ID) => {
  const user = users.find((u) => u.ID == partner_ID);
  return user;
};

const notDesignedYet = (u, desig, designations) =>
  !designations.find(
    (ud) => ud.user == u.ID && ud.day == desig.day && ud.period == desig.period
  );

const removeScheduleIncomplete = (designations) => {
  const emptySchedule = designations.filter((d) => d.user == "");

  for (let i = 0; i < designations.length; i++) {
    if (
      emptySchedule.find(
        (d) =>
          d.day == designations[i].day &&
          d.period == designations[i].period &&
          d.point == designations[i].point
      )
    ) {
      designations.splice(i, 1);
      i--;
    }
  }

  return designations;
}; */

const USERSfake = [
  {
    ID: "125e1a94-d6a5-4ef7-a1b5-ab6bc3ccb8c5",
    name: "Aliceapar Balloch",
    gender_code: "H",
    birth_date: "1977-03-04",
    lastime: "2023-03-01",
    desativado: false,
    seg: "2",
    ter: "1",
    qua: "1",
    qui: "3",
    sex: "1",
    sab: "1",
    dom: "2",
    criticality: null,
    age: 62,
    lastdayCount: null,
    email: null,
    phone: null,
    whatsapp: null,
    partner_ID: "e4461882-b84b-4159-901b-9f2c857133bf",
    history_partner: null,
    status: null,
    statusText: null,
  },
  {
    ID: "6de49a32-4f0d-42b4-ace8-e8317ddecc9c",
    name: "Anica De Michetti",
    gender_code: "H",
    birth_date: "1979-02-24",
    lastime: "2023-03-01",
    desativado: false,
    seg: "2",
    ter: "2",
    qua: "2",
    qui: "1",
    sex: "3",
    sab: "3",
    dom: "1",
    criticality: null,
    age: 33,
    lastdayCount: null,
    email: null,
    phone: null,
    whatsapp: null,
    partner_ID: null,
    history_partner: null,
    status: null,
    statusText: null,
  },
  {
    ID: "820688ec-f701-4fda-8362-efd739f053f6",
    name: "Anna Burgett",
    gender_code: "M",
    birth_date: "1991-10-31",
    lastime: "2023-03-01",
    desativado: false,
    seg: "1",
    ter: "3",
    qua: "1",
    qui: "2",
    sex: "2",
    sab: "2",
    dom: "1",
    criticality: null,
    age: 66,
    lastdayCount: null,
    email: null,
    phone: null,
    whatsapp: null,
    partner_ID: null,
    history_partner: null,
    status: null,
    statusText: null,
  },
  {
    ID: "a1ae594b-14ed-4905-9d4a-8f2abd47cffc",
    name: "Annadiana Towhey",
    gender_code: "H",
    birth_date: "1982-12-09",
    lastime: "2023-03-01",
    desativado: false,
    seg: "1",
    ter: "1",
    qua: "1",
    qui: "3",
    sex: "2",
    sab: "3",
    dom: "1",
    criticality: null,
    age: 14,
    lastdayCount: null,
    email: null,
    phone: null,
    whatsapp: null,
    partner_ID: null,
    history_partner: null,
    status: null,
    statusText: null,
  },
  {
    ID: "e4461882-b84b-4159-901b-9f2c857133bf",
    name: "Ardellapar Brassill",
    gender_code: "H",
    birth_date: "1981-12-15",
    lastime: "2023-03-01",
    desativado: false,
    seg: "2",
    ter: "1",
    qua: "1",
    qui: "3",
    sex: "1",
    sab: "1",
    dom: "2",
    criticality: null,
    age: 54,
    lastdayCount: null,
    email: null,
    phone: null,
    whatsapp: null,
    partner_ID: "125e1a94-d6a5-4ef7-a1b5-ab6bc3ccb8c5",
    history_partner: null,
    status: null,
    statusText: null,
  },
  {
    ID: "3d46ab2c-6365-4aed-a0ef-1cca1912c03f",
    name: "Arleta Ellesmere",
    gender_code: "H",
    birth_date: "1969-02-19",
    lastime: "2023-03-01",
    desativado: false,
    seg: "1",
    ter: "3",
    qua: "2",
    qui: "1",
    sex: "1",
    sab: "2",
    dom: "2",
    criticality: null,
    age: 45,
    lastdayCount: null,
    email: null,
    phone: null,
    whatsapp: null,
    partner_ID: null,
    history_partner: null,
    status: null,
    statusText: null,
  },
  {
    ID: "f424b2e2-9238-460a-8c14-03bdf02a79b2",
    name: "Augustine Lomax",
    gender_code: "H",
    birth_date: "2003-11-17",
    lastime: "2023-03-01",
    desativado: false,
    seg: "1",
    ter: "3",
    qua: "3",
    qui: "2",
    sex: "3",
    sab: "2",
    dom: "1",
    criticality: null,
    age: 59,
    lastdayCount: null,
    email: null,
    phone: null,
    whatsapp: null,
    partner_ID: null,
    history_partner: null,
    status: null,
    statusText: null,
  },
  {
    ID: "1456f265-6f80-46a5-9c57-61379674885b",
    name: "AAAveril Swindall",
    gender_code: "H",
    birth_date: "1978-12-13",
    lastime: "2023-03-01",
    desativado: false,
    seg: "123",
    ter: "123",
    qua: "3",
    qui: "1",
    sex: "2",
    sab: "12",
    dom: "12",
    criticality: null,
    age: 23,
    lastdayCount: null,
    email: null,
    phone: null,
    whatsapp: null,
    partner_ID: null,
    history_partner: null,
    status: null,
    statusText: null,
  },
];
