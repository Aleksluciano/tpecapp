const cds = require("@sap/cds");
const WeekEntity = "TPEService.Week";
const UsersEntity = "TPEService.Users";
const ScheduleEntity = "TPEService.Schedule";
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
  /*   srv.after(["READ"], "Users", (data, req) => {
    const users = req.results;
    if (Array.isArray(users)) {
      users.forEach((user) => {
        user.status = _checkStatus(user);
        if (user.status == 1) user.statusText = "";
        else user.statusText = "";
      });
    } else {
      users.status = _checkStatus(users);
      if (users.status == 1) users.statusText = "";
      else users.statusText = "";
    }
    //console.log("dataaa", req);
  }); */
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

  //SCHEDULE
  srv.before(["UPDATE", "CREATE"], "Schedule", async (req) => {
    const schedule = req.data;
    await _checkIfDateBeginIsBeforeDateEnd(schedule);
    await _checkIfNameAlreadyExists(schedule, req);
    await _checkIfDateAlreadyExists(schedule, req);
  });

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
    if (week.name_code == 8 && !week.specialDay) {
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
