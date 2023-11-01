const cds = require("@sap/cds");
const WeekEntity = "TPEService.Week";
const UsersEntity = "TPEService.Users";
const ScheduleEntity = "TPEService.Schedule";
const PointsEntity = "TPEService.Points";
const ReportEntity = "TPEService.Report";
const {
  shuffle,
  createReport,
  createSchedule,
  findAnyUser,
  findUserByGender,
  findUserWithPartner,
  removeScheduleIncomplete,
  findUserByGenderNotLastPartner,
} = require("./utils");

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

  srv.before(["UPDATE", "CREATE"], "Report", async (req) => {
    const report = req.data;
    if (!report.schedule_begin && !report.schedule_end) {
      await cds
        .run(
          SELECT.from(ScheduleEntity).where({
            name: report.schedule_name,
          })
        )
        .then((schedule) => {
          req.data.schedule_begin = schedule[0].begin;
          req.data.schedule_end = schedule[0].end;
        });
    }

    await _assignDayOfWeekCode(report, req);
    await cds
      .run(SELECT.from(UsersEntity).where({ ID: req.data.user_ID }))
      .then((_) => {
        cds.run(
          UPDATE(UsersEntity)
            .set({
              lastime: report.day,
              lastdayCount: _daysBetweenDates(report.day),
            })
            .where({ ID: report.user_ID })
        );
      });
  });

  //SCHEDULE
  srv.before(["CREATE"], "Schedule", async (req) => {
    const schedule = req.data;
    await _checkIfDateBeginIsBeforeDateEnd(schedule);
    await _checkIfNameAlreadyExists(schedule, req);
    await _checkIfDateAlreadyExists(schedule, req);
  });

  srv.after(["DELETE"], "Schedule", async (data, req) => {
    const schedule = req.data;

    await cds
      .run(SELECT.from(ReportEntity).where({ schedule_name: schedule.name }))
      .then((reports) => {
        for (const rep of reports) {
          rep.day = "2022" + rep.day.substring(4);
          cds.run(
            UPDATE(UsersEntity)
              .set({
                lastime: rep.day,
                lastdayCount: _daysBetweenDates(rep.day),
              })
              .where({ ID: rep.user_ID })
          );
        }
      });
    await DELETE.from(ReportEntity).where({ schedule_name: schedule.name });
  });

  srv.after(["CREATE"], "Schedule", async (req) => {
    const schedule = req;
    const weeks = await cds.run(SELECT.from(WeekEntity));
    const points = await cds.run(SELECT.from(PointsEntity));
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
    let userFirstPartner = null;
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
        users = shuffle(users);
        users.sort((a, b) => {
          // Convert string to date object for comparison.
          let dateA = new Date(a.lastime);
          let dateB = new Date(b.lastime);

          return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
        });
        // console.log("ordenação", users);
      }

      date = desig.day;
      period = desig.period;
      if (firtAssignDatePeriod) {
        gender_changed_already = false;
        const userFound = findAnyUser(users, desig, designations);
        userFirstPartner = userFound;
        if (userFound) {
          desig.user = userFound.ID;
          desig.userName = userFound.name;
          desig.userGender = userFound.gender_code;
          userFound.lastime = desig.day;
        }
      } else {
        if (userFirstPartner) {
          let userFound = null;
          if (userFirstPartner.partner_ID) {
            userFound = findUserWithPartner(users, userFirstPartner.partner_ID);
          }
          if (!userFirstPartner.partner_ID) {
            //procura primeiro por alguem que não seja o ultimo parceiro
           // console.log("findUserByGenderNotLastPartner_entra");
            userFound = findUserByGenderNotLastPartner(
              users,
              desig,
              designations,
              userFirstPartner.gender_code,
              userFirstPartner.ID
            );
            if (!userFound) {
              userFound = findUserByGender(
                users,
                desig,
                designations,
                userFirstPartner.gender_code
              );
            }
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
                userRemoved.lastime = userReset.lastime;
              }
            }

            const userFoundBack = findAnyUser(users, desig, designations);

            userFirstPartner = userFoundBack;
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
    //console.log("DESIGNATIONS", designationsCompleted);
    let reports = [];
    for (const desig of designationsCompleted) {
      reports.push({
        schedule_name: desig.schedule,
        schedule_begin: schedule.begin,
        schedule_end: schedule.end,
        day: desig.day,
        dayweek_code: desig.dayWeek,
        point_ID: desig.point,
        period_name: desig.period,
        user_ID: desig.user,
      });
    }

    await cds.run(INSERT.into(ReportEntity).entries(reports)).then((_) => {
      //console.log("inicio");
      //Update the users lastime and lastdayCount and lastPartner
      for (const rep of reports) {
        // console.log("rep", rep);
        let lastPartnerFound = reports.find(
          (a) =>
            a.user_ID !== rep.user_ID &&
            a.day === rep.day &&
            a.period_name === rep.period_name &&
            a.point_ID === rep.point_ID
        );
        //console.log(lastPartnerFound.user_ID);
        cds.run(
          UPDATE(UsersEntity)
            .set({
              lastime: rep.day,
              lastdayCount: _daysBetweenDates(rep.day),
              lastPartner_ID: lastPartnerFound
                ? lastPartnerFound.user_ID
                : null,
            })
            .where({ ID: rep.user_ID })
        );
      }
    });
  }); //method

  //                 });

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
    // console.log("desativado", user.desativado);
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
    //const diffMilliseconds = Math.abs(currentDate - date);
    const diffMilliseconds = currentDate - date;

    // Convert milliseconds to days
    const days = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));

    return days;
  }
});
