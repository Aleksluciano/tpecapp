const cds = require("@sap/cds");
const WeekEntity = "TPEService.Week";
const UsersEntity = "TPEService.Users";
const ScheduleEntity = "TPEService.Schedule";
const PointsEntity = "TPEService.Points";
const PeriodsEntity = "TPEService.Periods";
const ReportEntity = "TPEService.Report";
const { createReport, createSchedule } = require("./utils");

//WEEK
module.exports = cds.service.impl(async function (srv) {
  srv.before(["UPDATE", "CREATE"], "Week", (req) => {
    const week = req.data;
    _checkIfDateForWeekendCodeIsFilled(week);
  });
  //PERIODS
  srv.before(["DELETE"], "Periods", async (req) => {
    const period = req.data;
    await _checkIfPeriodExistInWeek(period.name, req);
  });

  //POINTS
  srv.before(["DELETE"], "Points", async (req) => {
    const point = req.data;
    await _checkIfPointExistInWeek(point.ID, req);
  });

  //USERS
  srv.before(["UPDATE", "CREATE"], "Users", async (req) => {
    const user = req.data;
    if (user.partner_ID && user.partner_ID == user.ID) {
      throw new Error("Não é possível cadastrar o mesmo usuário como parceiro");
    }

    user.status = _checkStatus(user);
    if (user.status == 1) user.statusText = "";
    else user.statusText = "";

    const age = _calculateAge(user.birth_date);
    user.age = age;
    user.criticality = _calculateCriticality(user.age);
    user.lastdayCount = _daysBetweenDates(user.lastime);
    const whatsaap = _updateContactInfo(user.phone);
    user.whatsapp = whatsaap;

    if (user.partner_ID) {
      await _findOldPartnerReferencesAndRemoveThem(user.partner_ID, req);
      await _updatePartnerReference(user, req);
    }
    if (!user.partner_ID && user.history_partner) {
      await _removePartnerIdForTheOtherSide(user, req);
    }
  });

  srv.before(["DELETE"], "Users", async (req) => {
    const user = req.data;
    await _checkIfUserHasPartner(user.ID, req);
  });

  //REPORT
  srv.after(["READ"], "Report", async (req) => {
    const data = req;
    console.log(data);
    if (Array.isArray(data))
      data.sort(function (a, b) {
        // Sort by day
        const dateA = new Date(a.day);
        const dateB = new Date(b.day);

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        // If day is the same, sort by point.name
        if (a.point.name < b.point.name) return -1;
        if (a.point.name > b.point.name) return 1;

        // If point.name is the same, sort by period.name
        if (a.period.name < b.period.name) return -1;
        if (a.period.name > b.period.name) return 1;

        // If all fields are the same, return 0
        return 0;
      });
  });

  //SCHEDULE
  srv.before(["CREATE"], "Schedule", async (req) => {
    const schedule = req.data;
    await _checkIfDateBeginIsBeforeDateEnd(schedule);
    await _checkIfNameAlreadyExists(schedule, req);
    await _checkIfDateAlreadyExists(schedule, req);
  });

  srv.after(["CREATE"], "Schedule", async (req) => {
    const schedule = req;
    const weeks = await cds.run(SELECT.from(WeekEntity));
    const points = await cds.run(SELECT.from(PointsEntity));
    const periods = await cds.run(SELECT.from(PeriodsEntity));
    const usersAll = await cds.run(SELECT.from(UsersEntity));

    //console.log(schedule, weeks, points, periods, usersAll);
    const rangeDate = createSchedule(schedule);
    const designations = createReport(rangeDate, weeks, points);
    // console.log("DESIGNATIONS", designations);
    users = usersAll
      .map((obj) => Object.assign({}, obj))
      .filter((u) => !u.desativado);

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
      const sameDate = date == desig.day;

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
            userFound = findUserWithPartner(
              users,
              desig,
              userFirstPatner.partner_ID
            );
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
              const userReset = usersAll.find((u) => u.ID == desigback.user);
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
    let reports = [];
    for (const desig of designationsCompleted) {
      reports.push({
        schedule_name: desig.schedule,
        day: desig.day,
        dayweek_code: desig.dayWeek,
        point_ID: desig.point,
        period_name: desig.period,
        user_ID: desig.user,
      });
    }

    await cds.run(INSERT.into(ReportEntity).entries(reports));
  }); //method

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
            (u[dispodayweek[0]] &&
              u[dispodayweek[0]].includes(desig.period))) &&
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
            (u[dispodayweek[0]] &&
              u[dispodayweek[0]].includes(desig.period))) &&
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
      (ud) =>
        ud.user == u.ID && ud.day == desig.day && ud.period == desig.period
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

  //                 });

  //REPORT
  srv.before(["UPDATE", "CREATE"], "Report", async (req) => {
    const report = req.data;
    console.log(report);
    await _assignDayOfWeekCode(report, req);
  });

  //HELP FUNCTIONS
  async function _assignDayOfWeekCode(report, req) {
    const existInWeek = await cds
      .transaction(req)
      .run(SELECT.from(WeekEntity).where({ specialDay: report.day }));
    if (existInWeek && existInWeek.length > 0) {
      report.dayweek_code = existInWeek[0].name_code;
    } else {
      const date = new Date(`${report.day}T00:00:00Z`);
      report.dayweek_code = date.getUTCDay();
    }
  }

  async function _checkIfPointExistInWeek(pointID, req) {
    const existInWeek = await cds
      .transaction(req)
      .run(SELECT.from(WeekEntity).where({ point_ID: pointID }));
    if (existInWeek && existInWeek.length > 0) {
      throw new Error("Não é possível excluir um ponto que existe na semana");
    }
  }

  async function _checkIfPeriodExistInWeek(periodName, req) {
    const existInWeek = await cds
      .transaction(req)
      .run(SELECT.from(WeekEntity).where({ period_name: periodName }));
    if (existInWeek && existInWeek.length > 0) {
      throw new Error("Não é possível excluir um período que existe na semana");
    }
  }

  async function _removePartnerIdForTheOtherSide(user, req) {
    await cds
      .transaction(req)
      .run(
        UPDATE(UsersEntity)
          .set({
            partner_ID: null,
            history_partner: null,
          })
          .where({ ID: user.history_partner })
      )
      .then(() => {
        user.history_partner = null;
      });
  }

  async function _checkIfUserHasPartner(userID, req) {
    const hasPartnerID = await cds
      .transaction(req)
      .run(SELECT.from(UsersEntity).where({ partner_ID: userID }));
    if (hasPartnerID && hasPartnerID.length > 0) {
      throw new Error(
        "Não é possível excluir um usuário que possui companheiro fixo"
      );
    }
  }

  async function _checkIfDateBeginIsBeforeDateEnd(schedule) {
    if (schedule.begin > schedule.end) {
      throw new Error("A data de início deve ser menor que a data de fim");
    }
  }

  async function _checkIfDateAlreadyExists(schedule, req) {
    const newBeginDate = schedule.begin;
    const newEndDate = schedule.end;
    const sameDateSchedule = await cds.transaction(req).run(
      SELECT.from(ScheduleEntity).where({
        begin: { "<=": newBeginDate },
        and: {
          end: { ">=": newBeginDate },
          or: { begin: { "<=": newEndDate }, end: { ">=": newEndDate } },
        },
      })
    );
    if (sameDateSchedule && sameDateSchedule.length > 0) {
      throw new Error("Já existe um cronograma com esse período");
    }
  }

  async function _checkIfNameAlreadyExists(schedule, req) {
    const sameNameSchedule = await cds
      .transaction(req)
      .run(SELECT.from(ScheduleEntity).where({ name: schedule.name }));
    if (sameNameSchedule && sameNameSchedule.length > 0) {
      throw new Error("Já existe um cronograma com esse nome");
    }
  }

  function _checkIfDateForWeekendCodeIsFilled(week) {
    if (week.nameweek_code == 8 && !week.specialDay) {
      throw new Error(
        "Quando marcado fim de semana, deve ser informado o dia especial"
      );
    }
  }

  function _updateContactInfo(phone) {
    if (!phone) return null;
    const countryCode = "55";
    const numericPhoneNumber = phone.replace(/\D/g, "");
    const whatsappLink = `https://wa.me/${countryCode}${numericPhoneNumber}`;

    return whatsappLink;
  }

  async function _updatePartnerReference(user, req) {
    const partnerUser = await cds
      .transaction(req)
      .run(SELECT.from(UsersEntity).where({ ID: user.partner_ID }));
    if (partnerUser) {
      await cds
        .transaction(req)
        .run(
          UPDATE(UsersEntity)
            .set({
              dom: user.dom,
              seg: user.seg,
              ter: user.ter,
              qua: user.qua,
              qui: user.qui,
              sex: user.sex,
              sab: user.sab,
              desativado: user.desativado,
              partner_ID: user.ID,
              history_partner: user.ID,
            })
            .where({ ID: user.partner_ID })
        )
        .then(() => {
          user.history_partner = user.partner_ID;
        });
    }
  }

  async function _findOldPartnerReferencesAndRemoveThem(partnerId, req) {
    const usersRef = await cds
      .transaction(req)
      .run(SELECT.from(UsersEntity).where({ partner_ID: partnerId }));
    if (usersRef && usersRef.length > 0) {
      for (const itemUser of usersRef) {
        await cds.transaction(req).run(
          UPDATE(UsersEntity)
            .set({
              partner_ID: null,
            })
            .where({ ID: itemUser.ID })
        );
      }
    }
  }
  function _calculateCriticality(age) {
    return age < 18 ? 2 : 0;
  }

  function _checkStatus(user) {
    console.log("desativado", user.desativado);
    if (user.desativado == true) return 1;
    if (
      user.seg == "" &&
      user.ter == "" &&
      user.qua == "" &&
      user.qui == "" &&
      user.sex == "" &&
      user.sab == "" &&
      user.dom == ""
    )
      return 1;
    return 3;
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
});

/*   srv.after("CREATE", "Schedule", async (req) => {
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

     //   } */

// console.log("DESIGNATIONS",designations)
//   } catch (error) {
//console.error(error);
//   }
// });
// });
//}); */
