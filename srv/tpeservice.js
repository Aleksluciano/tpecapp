const cds = require("@sap/cds");
const WeekEntity = "TPEService.Week";
const { createReport, createSchedule } = require("./utils");

module.exports = cds.service.impl(async function (srv) {
  srv.before(["UPDATE", "CREATE"], "Users", (req) => {
    const user = req.data;
    const age = _calculateAge(user.birth_date);
    user.age = age;
    user.criticality = _calculateCriticality(user.age);
    user.lastdayCount = _daysBetweenDates(user.lastime);
  });
  function _calculateCriticality(age) {
    return age < 18 ? 2 : 0;
  }

  function _calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    return m < 0 || (m === 0 && now.getDate() < birth.getDate())
      ? age - 1
      : age;
  }

  function _daysBetweenDates(dateString) {
    const date = new Date(dateString);
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const diffMilliseconds = Math.abs(currentDate - date);

    // Convert milliseconds to days
    const days = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));

    return days;
  }
  srv.after("CREATE", "Schedule", async (req) => {
    setImmediate(async () => {
      try {
        // console.log(req)
        const tx = cds.transaction(req);
        // const schedules = req.data
        //console.log("Allanxx",req)
        //const schedule = schedules[0];

        const weeks = await tx.read("TPEService.Week");
        const points = await tx.read("TPEService.Points");
        const periods = await tx.read("TPEService.Periods");
        const users = await tx.read("TPEService.Users");
        await tx.commit();
        //console.log("weeks",weeks);
        const rangeDate = createSchedule(req);
        //console.log("rangedate",rangeDate)
        const designations = createReport(rangeDate, weeks, points);
        //loop designations
        const dispodayweek = {
          0: "dom",
          1: "seg",
          2: "ter",
          3: "qua",
          4: "qui",
          5: "sex",
          6: "sab",
        };
        //console.log("users",users)
        /*     for (const desig of designations) {
          if(desig.user == ""){
            //console.log("desig",desig)

            const userIndex = users.findIndex((u) => u[dispodayweek[desig.dayWeek]] && u[dispodayweek[desig.dayWeek]].toString().includes(desig.period.toString()));
            if(userIndex !== -1)
            desig.user = users.splice(userIndex, 1)[0].ID;

          }

        } */

        // console.log("DESIGNATIONS",designations)
      } catch (error) {
        //console.error(error);
      }
    });
  });
});
