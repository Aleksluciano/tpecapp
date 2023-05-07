const checkGender = (user, gender) => user.gender_code == gender;
const selectUsersByGender = (users, gender) =>
  users.slice().filter((user) => areMen(user, gender));
const sortByLastime = (users) =>
  users.slice().sort((a, b) => a.lastime - b.lastime);

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
  // console.log("RANGE DATE", rangeDate);
  const designations = [];
  for (const idate of rangeDate) {
    weeks
      .filter((day) => day.name_code == idate.codeDayWeek)
      .forEach((day) => {
        //console.log("DAY", day)
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
  return designations;
};

//export the arrow functions above
module.exports = {
  checkGender,
  selectUsersByGender,
  sortByLastime,
  createSchedule,
  createReport,
};
