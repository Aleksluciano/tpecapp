/* const checkGender = (user, gender) => user.gender_code == gender;
const selectUsersByGender = (users, gender) =>
  users.slice().filter((user) => areMen(user, gender));
const sortByLastime = (users) => users.sort((a, b) => a.lastime - b.lastime);
 */
const createSchedule = (schedule) => {
  const beginDate = new Date(`${schedule.begin}T00:00:00Z`);
  const endDate = new Date(`${schedule.end}T00:00:00Z`);
  const range = [];

  for (
    let date = beginDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const daysOfWeek = [
      "domingo",
      "segunda",
      "terça",
      "quarta",
      "quinta",
      "sexta",
      "sábado",
    ];
    const nameDayWeek = daysOfWeek[date.getUTCDay()];
    const codeDayWeek = date.getUTCDay();
    range.push({
      schedule: schedule.name,
      day: dateString,
      nameDayWeek,
      codeDayWeek,
      // add any other properties you need here
    });
  }

  return range;
};

const createReport = (rangeDate, weeks, points) => {
  //console.log("RANGE DATE", rangeDate);
  const designations = [];
  for (const idate of rangeDate) {
    const specialDayweeks = weeks.filter((day) => day.specialDay == idate.day);
    if (specialDayweeks.length > 0) {
      specialDayweeks.forEach((day) => {
        //console.log("DAY", day);
        if (day) {
          const point = points.find((point) => point.ID == day.point_ID);
          //console.log("PONTO1", point)
          if (point) {
            for (let i = 0; i < point.capacity; i++) {
              //console.log("PONTO2", point)
              designations.push({
                schedule: idate.schedule,
                day: idate.day,
                dayWeek: day.nameweek_code,
                point: day.point_ID,
                period: day.period_name,
                user: "",
                userName: "",
                userGender: "",
              });
            }
          }
        }
      });
    } else {
      weeks
        .filter((day) => day.nameweek_code == idate.codeDayWeek)
        .forEach((day) => {
          //console.log("DAY", day);
          if (day) {
            const point = points.find((point) => point.ID == day.point_ID);
            //console.log("PONTO1", point)
            if (point) {
              for (let i = 0; i < point.capacity; i++) {
                //console.log("PONTO2", point)
                designations.push({
                  schedule: idate.schedule,
                  day: idate.day,
                  dayWeek: idate.codeDayWeek,
                  point: day.point_ID,
                  period: day.period_name,
                  user: "",
                  userName: "",
                  userGender: "",
                });
              }
            }
          }
        });
    }
  }
  return designations;
};

const dispodayweek = {
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
};

//export the arrow functions above
module.exports = {
  findAnyUser,
  findUserByGender,
  findUserWithPartner,
  removeScheduleIncomplete,
  createSchedule,
  createReport,
};
