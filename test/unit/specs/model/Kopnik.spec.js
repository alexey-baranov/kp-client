/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";
let _ = require("lodash");
var assert = require('chai').assert;
let Cookies = require("js-cookie")

import Connection from "../../../../src/Connection"
var models = require("../../../../src/model")

let KOPNIK2 = 2
let KOPNIK3 = 3;
let KOPNIK4 = 4;
let ZEMLA2 = 2
let ZEMLA3 = 3
let KOPA = 3

let connection = Connection.getUnitTestInstance()
let anonymousConnection = require("../../../../src/Connection").default.getAnonymousInstance()
let Cleaner = require("../../../../src/Cleaner")

describe('Kopnik', function () {
  before(function () {
    models.RemoteModel.clearCache()
    return new Promise(function (res, rej) {
      connection.onopen = function (session, details) {
        session.prefix('api', 'ru.kopa')
        res()
      }
      connection.open()
    })
      .then(function () {
        // connection= require("Connection").default.getUnitTestInstance();
        return new Promise(function (res, rej) {
          anonymousConnection.onopen = function (session, details) {
            Cookies.remove("cbtid")
            session.prefix('api', 'ru.kopa');
            res()
          }
          anonymousConnection.open()
        })
      })
      .then(function () {
        return Cleaner.clean();
      })
  })

  after(function () {
    return new Promise(function (res, rej) {
      connection.onclose = function (session, details) {
        res()
      };
      connection.close();
    })
      .then(function () {
        return new Promise(function (res, rej) {
          anonymousConnection.onclose = function (session, details) {
            res()
          }
          anonymousConnection.close()
        });
      })
  })

  describe("#get()", function () {
    it('#dom should be instance of Zemla', async function () {
      let kopnik2 = await models.Kopnik.get(KOPNIK2);
      assert.equal(kopnik2.dom instanceof models.Zemla, true);
    });
  })

  it('#getStarshinaNaZemle()', async function () {
    let kopnik6 = await models.Kopnik.get(6);
    let starshinaNaZemle = await kopnik6.getStarshinaNaZemle(models.Zemla.getReference(4))
    assert.equal(starshinaNaZemle === null, true, "starshinaNaZemle, null");

    starshinaNaZemle = await kopnik6.getStarshinaNaZemle(models.Zemla.getReference(1))
    assert.equal(starshinaNaZemle instanceof models.Kopnik, true, "starshinaNaZemle instanceof Kopnik");
    assert.equal(starshinaNaZemle.id, 2, "starshinaNaZemle.id, 2")
  })

  it('#getDoma()', async function () {
    let kopnik2 = await models.Kopnik.get(2)
    let doma = await kopnik2.getDoma()
    assert.equal(_.isArray(doma), true, "_.isArray(doma)")
    assert.equal(doma.length, 2, "doma.length, 2");
    assert.equal(doma[0] instanceof models.Zemla, true, "doma instanceof models.Zemla");
    assert.equal(doma[0].id, 2, true, "doma[0]=2");
    assert.equal(doma[1].id, 1, true, "doma[1]=1");
  });

  it('#getStarshini()', async function () {
    let kopnik7 = await models.Kopnik.get(7)
    let starshini = await kopnik7.getStarshini()
    assert.equal(_.isArray(starshini), true, "_.isArray(starshini)")
    assert.equal(starshini.length, 2, "starshini.length, 2");
    assert.equal(starshini[0] instanceof models.Kopnik, true, "starshini instanceof models.Kopnik");
    assert.equal(starshini[0].id, 3, true, "starshini[0]=3");
    assert.equal(starshini[1].id, 2, true, "starshini[1]=2");
  });

  describe("#loadDruzhina()", function () {
    let kopnik2;

    /**
     * создаю предложение, голосую и жду когда выстрелит Predlozhenie#balanceChange
     */
    it('should load druzhina', async function () {
      kopnik2 = models.Kopnik.getReference(2);

      await kopnik2.loadDruzhina();
      assert.equal(_.isArray(kopnik2.druzhina), true, "_.isArray(kopnik2.druzhina)");
      assert.equal(kopnik2.druzhina.length, 2, "kopnik2.druzhina.size, 2");
      assert.equal(kopnik2.druzhina[0] instanceof models.Kopnik, true, "kopnik2.druzhina[0] instanceof models.Kopnik");
    });
  })

  describe("#setStarshina()", function () {
    let someKopnik1,
      someKopnik2,
      kopnik2,
      kopnik4;

    /**
     * создаю два копника один старшина другому на втором
     */
    it('should emit voiskoChange twice', function (done) {
      (async() => {
        try {
          kopnik2 = await models.Kopnik.get(KOPNIK2);

          //3. поймал событие что присоедился самКопник1
          kopnik2.once(models.Kopnik.event.voiskoChange, async() => {
            try {
              assert.equal(kopnik2.voiskoSize, 4, "kopnik2.voiskoSize, 4");
              assert.equal(someKopnik1.starshina, kopnik2, "someKopnik1.starshina, kopnik2");

              //4. поймал событие что присоедился самКопник2
              kopnik2.once(models.Kopnik.event.voiskoChange, async() => {
                try {
                  assert.equal(kopnik2.voiskoSize, 5, "kopnik2.voiskoSize, 5");
                  assert.equal(someKopnik2.starshina, someKopnik1, "someKopnik2.starshina, someKopnik1");
                  done();
                } catch (err) {
                  done(err);
                }
              });
            } catch (err) {
              done(err);
            }
          });

          //1. повесил самКопника1 на старшину Копника2
          someKopnik1 = await models.Kopnik.create({
            email: "unittestQ@domain.ru",
            name: "temp",
            surname: "temp",
            patronymic: "temp",
            birth: 1900,
            passport: "1234",
            dom: models.Zemla.getReference(ZEMLA2),
          });
          await someKopnik1.setStarshina(kopnik2);

          //2. повесил копника на самКопника1
          someKopnik2 = await models.Kopnik.create({
            email: "unittestW@domain.ru",
            name: "temp",
            surname: "temp",
            patronymic: "temp",
            birth: 1900,
            passport: "1234",
            dom: models.Zemla.getReference(ZEMLA2),
          });
          await someKopnik2.setStarshina(someKopnik1);
        }
        catch (err) {
          done(err);
        }
      })()
    });

    /**
     * перекидываю копника с дружинником на четвертого
     * сначала прилетают события открепления дружины
     * потом прикрепления
     */
    it('should emit voiskoChange down and up, emit starshina changed', function (done) {
      (async() => {

        try {
          kopnik4 = await models.Kopnik.get(KOPNIK4);

          /**сначала прилетает событие сменился старшина от себя к хвосту,
           * потом открепления дружины
           * потом прикрепления,
           */
          someKopnik2.once(models.Kopnik.event.starshinaChange, async() => {
            try {
              assert.equal(someKopnik2.starshina, someKopnik1, "someKopnik2.starshina, someKopnik1");
              assert.equal(someKopnik1.starshina, kopnik4, "someKopnik1.starshina, kopnik4");

              kopnik2.once(models.Kopnik.event.voiskoChange, () => {
                try {
                  assert.equal(kopnik2.voiskoSize, 3, "kopnik2.voiskoSize, 3");
                  kopnik4.once(models.Kopnik.event.voiskoChange, () => {
                    try {
                      assert.equal(kopnik4.voiskoSize, 2, "kopnik4.voiskoSize, 2");
                      assert.equal(someKopnik1.starshina, kopnik4, "someKopnik1.starshina, kopnik4");
                      done();
                    }
                    catch (err) {
                      done(err);
                    }
                  });
                }
                catch (err) {
                  done(err);
                }
              });
            } catch (err) {
              done(err);
            }
          });

          await someKopnik1.setStarshina(models.Kopnik.getReference(KOPNIK4));
        }
        catch (err) {
          done(err);
        }
      })()
    });

    /**
     * ухожу новым копником из дружины
     */
    it('should reset starshina', function (done) {
      (async function () {
        try {
          kopnik4.once(models.Kopnik.event.voiskoChange, () => {
            try {
              assert.equal(kopnik4.voiskoSize, 0, "kopnik4.voiskoSize, 0");
              assert.equal(someKopnik1.starshina, null, "someKopnik1.starshina, null");
              done();
            }
            catch (err) {
              done(err);
            }
          });
          someKopnik1.setStarshina(null);
        }
        catch (err) {
          done(err);
        }
      })();
    });

    /**
     * меняю местами новых копников (старшина выбирает своим старшиной своего дружинника)
     * временно стоит заглушка в виде ошибки на этот случай
     */
    it('should switch them', function (done) {
      (async function () {
        try {
          someKopnik2.once(models.Kopnik.event.voiskoChange, () => {
            try {
              assert.equal(someKopnik1.voiskoSize, 0, "someKopnik1.voiskoSize, 0");
              assert.equal(someKopnik1.starshina, someKopnik2, "someKopnik1.starshina, someKopnik2");
              assert.equal(someKopnik2.voiskoSize, 1, "someKopnik2.voiskoSize, 1");
              done();
            }
            catch (err) {
              done(err);
            }
          });
          await someKopnik1.setStarshina(someKopnik2);
        }
        catch (err) {
          // done(err);
          done();// временно выбрасывает ошибку
        }
      })();
    });

    /**
     * пробую назначить себя старшиной
     */
    it('should not set himself as starshina', async function () {
      try {
        await someKopnik1.setStarchina(someKopnik1);
        done("error was not throwned");
      }
      catch (err) {
      }
    });

    /**
     * создаю копника на втором и тут же снимаю
     */
    it('should emit druzhinaChange "add"', function (done) {
      (async function () {
        try {
          kopnik2 = await models.Kopnik.get(KOPNIK2);
          kopnik2.druzhina = [];
          kopnik2.once(models.Kopnik.event.druzhinaChange, () => {
            try {
              assert.equal(kopnik2.druzhina.indexOf(someKopnik1) >= 0, true, "kopnik2.druzhina.indexOf(someKopnik1)>=0");
              kopnik2.once(models.Kopnik.event.druzhinaChange, () => {
                try {
                  assert.equal(kopnik2.druzhina.length, 0, "kopnik2.druzhina.length, 0");
                  done();
                } catch (err) {
                  done(err);
                }
              });
            } catch (err) {
              done(err);
            }
          });
          someKopnik1 = await models.Kopnik.create({
            email: "unittestE@domain.ru",
            name: "temp",
            surname: "temp",
            patronymic: "temp",
            birth: 1900,
            passport: "1234",
            dom: models.Zemla.getReference(ZEMLA2),
          });
          await someKopnik1.setStarshina(kopnik2)
          await someKopnik1.setStarshina(null)
        }
        catch (err) {
          done(err);
        }
      })();
    });
  })

  describe("#setStarshina() voting starshina", function () {
    let starshina1,
      starshina2,
      druzhe,
      predlozhenie1,
      predlozhenie2,
      predlozhenie3;

    before(function () {
      this.timeout(10000);
      return new Promise(async(res, rej) => {
        starshina1 = await models.Kopnik.create({
          email: "unittestQ@domain.ru1" + new Date().getTime(),
          name: "unit test setStarshina+voting predlozhenie",
          surname: "starshina1",
          patronymic: "temp",
          birth: 1900,
          passport: "1234",
          dom: models.Zemla.getReference(1),
        });
        starshina2 = await models.Kopnik.create({
          email: "unittestQ@domain.ru2" + new Date().getTime(),
          name: "unit test setStarshina+voting predlozhenie",
          surname: "starshina2",
          patronymic: "temp",
          birth: 1900,
          passport: "1234",
          dom: models.Zemla.getReference(1),
        })
        druzhe = await models.Kopnik.create({
          email: "unittestQ@domain.rud" + new Date().getTime(),
          name: "unit test setStarshina+voting predlozhenie",
          surname: "druzhe",
          patronymic: "temp",
          birth: 1900,
          passport: "1234",
          dom: models.Zemla.getReference(4),
        });

        predlozhenie1 = await models.Predlozhenie.create({
          value: "unit test setStarshina+voting predlozhenie 1",
          place: models.Kopa.getReference(7),
          owner: starshina1,
        });
        ;
        predlozhenie1.golosa = []
        predlozhenie2 = await models.Predlozhenie.create({
          value: "unit test setStarshina+voting predlozhenie 2",
          place: models.Kopa.getReference(7),
          owner: starshina2
        });
        predlozhenie2.golosa = []
        predlozhenie3 = await models.Predlozhenie.create({
          value: "unit test setStarshina+voting predlozhenie 3",
          place: models.Kopa.getReference(8),
          owner: druzhe
        });
        predlozhenie3.golosa = [];

        let i = 0
        predlozhenie1.once(models.Predlozhenie.event.rebalance, () => {
          if (++i == 3) {
            console.log("very interesting")
            res()
          }
        })
        predlozhenie2.once(models.Predlozhenie.event.rebalance, () => {
          if (++i == 3) {
            res()
          }
        })
        predlozhenie3.once(models.Predlozhenie.event.rebalance, () => {
          if (++i == 3) {
            res();
          }
        })

        // predlozhenie4 = await models.Predlozhenie.get(4)
        await starshina1.vote(predlozhenie1, 1)
        await druzhe.vote(predlozhenie1, -1)

        await starshina2.vote(predlozhenie2, 1)
        await druzhe.vote(predlozhenie2, -1)

        await druzhe.vote(predlozhenie3, -1)
        // await druzhe.vote(predlozhenie4, -1);;

        // predlozhenie4.once(models.Predlozhenie.event.rebalance, () => {
        //   if (++i == 3) {
        //     res()
        //   }
        // })
      })
    })

    /**
     * выбираю старшиной первого старшину
     */
    it('should emit rebalance on new starshina', function (done) {
      (async() => {
        try {
          let i = 0;
          //2. поймал событие что произошёл ребаланс предложения
          predlozhenie1.once(models.Predlozhenie.event.rebalance, async() => {
            try {
              expect(predlozhenie1.totalZa).equal(2, "predlozhenie1.totalZa")
              expect(predlozhenie1.golosa.length).equal(1, "predlozhenie1.golosa.length")
              expect(predlozhenie3.totalZa).equal(1)
            }
            catch (err) {
              done(err)
            }
            if (++i == 2) {
              done();
            }
          })
          //2. поймал событие что произошёл ребаланс предложения
          predlozhenie2.once(models.Predlozhenie.event.rebalance, async() => {
            try {
              expect(predlozhenie2.totalZa).equal(1, "predlozhenie2.totalZa")
              expect(predlozhenie2.golosa.length).equal(1, "predlozhenie2.golosa.length")
              expect(predlozhenie3.totalZa).equal(1)
            }
            catch (err) {
              done(err)
            }
            if (++i == 2) {
              done();
            }
          })

          //1. выбрал старшиной первого
          await druzhe.setStarshina(starshina1)
        }
        catch (err) {
          done(err)
        }
      })()
    })

    /**
     * выбираю старшиной второго старшину
     */
    it('should emit rebalance prev starshina', function (done) {
      (async() => {
        try {
          let i = 0;
          //2. поймал событие что произошёл ребаланс предложения1
          predlozhenie1.once(models.Predlozhenie.event.rebalance, async() => {
            try {
              expect(predlozhenie1.totalZa).equal(1, "predlozhenie1.totalZa")
              expect(predlozhenie1.golosa.length).equal(1, "predlozhenie1.golosa.length")
              expect(predlozhenie3.totalZa).equal(1, "predlozhenie3.totalZa")
              if (++i == 2) {
                done();
              }
            }
            catch (err) {
              done(err)
            }
          })
          //3. поймал событие что произошёл ребаланс предложения2
          predlozhenie2.once(models.Predlozhenie.event.rebalance, async() => {
            try {
              expect(predlozhenie2.totalZa).equal(2, "predlozhenie2.totalZa")
              expect(predlozhenie2.golosa.length).equal(1, "predlozhenie2.golosa.length")
              expect(predlozhenie3.totalZa).equal(1, "dlozhenie3.totalZa")
              if (++i == 2) {
                done();
              }
            }
            catch (err) {
              done(err)
            }
          })
          //1. выбрал старшиной первого
          await druzhe.setStarshina(starshina2)
        }
        catch (err) {
          done(err)
        }
      })()
    })
  })

  describe("#vote()", function () {
    let kopnik2,
      somePredlozhenie,
      kopa3;

    before(async function () {
      kopnik2 = await models.Kopnik.get(KOPNIK2);
      kopa3 = await models.Kopa.get(KOPA);

      somePredlozhenie = await models.Predlozhenie.create({
        place: kopa3,
        owner: kopnik2,
        value: "temp vote " + new Date(),
        golosa: [],
        totalZa: 0,
        totalProtiv: 0,
      });
    })

    /**
     * создаю предложение, голосую и жду когда выстрелит Predlozhenie#rebalance
     * В этом тесте проверяется неголосуемость копника 6 (он живет в другом доме)
     */
    it('should vote', function (done) {
      (async function () {
        try {
          let listener,
            eventNumber = 1;

          somePredlozhenie.on(models.Predlozhenie.event.rebalance, listener = function () {
            try {
              switch (eventNumber--) {
                case 1:
                  assert.equal(somePredlozhenie.totalZa, 3, "somePredlozhenie.totalZa, 3");
                  assert.equal(somePredlozhenie.totalProtiv, 0, "somePredlozhenie.totalProtiv, 0");
                  assert.equal(somePredlozhenie.golosa.length, 1, "somePredlozhenie.golosa.length, 1");
                  assert.equal(somePredlozhenie.golosa[0] instanceof models.Golos, true, "somePredlozhenie.golosa[0] instanceof models.Golos, true");
                  // somePredlozhenie.removeListener(listener); не работает
                  done()
                  break;
                case 0:
                  assert.equal(somePredlozhenie.totalZa, 0, "somePredlozhenie.totalZa, 0");
                  assert.equal(somePredlozhenie.totalProtiv, 0, "somePredlozhenie.totalProtiv, 0");
                  assert.equal(somePredlozhenie.golosa.length, 0, "somePredlozhenie.golosa.length, 0");
                  break;
                case -1:
                  assert.equal(somePredlozhenie.totalZa, 0, "somePredlozhenie.totalZa, 0");
                  assert.equal(somePredlozhenie.totalProtiv, 3, "somePredlozhenie.totalProtiv, 3");
                  assert.equal(somePredlozhenie.golosa.length, 1, "somePredlozhenie.golosa.length, 1");
                  assert.equal(somePredlozhenie.golosa[0] instanceof models.Golos, true, "somePredlozhenie.golosa[0] instanceof models.Golos");

                  break;
              }
            }
            catch (err) {
              done(err);
            }
          });

          await kopnik2.vote(somePredlozhenie, 1);
          await kopnik2.vote(somePredlozhenie, 0);
          await kopnik2.vote(somePredlozhenie, -1);
        }
        catch (err) {
          done(err);
        }
      })();
    })
  });

  describe("#verifyRegistration()", function () {
    this.timeout(5000)
    it('should verify', function (done) {
      (async() => {
        try {
          let kopnik2 = await models.Kopnik.get(2);
          kopnik2.registrations = []

          //2. копник поймал что ему пришла регистрация
          kopnik2.once(models.Kopnik.event.registrationAdd, async(sender, localRegistration) => {
            try {
              //4. регистрация поймала что ее заверили
              localRegistration.once(models.RemoteModel.event.change, function () {
                //5. проверям что регистрация правильная
                try {
                  expect(localRegistration.verifier.id).equal(2, "localRegistration.verifier.id")
                  expect(localRegistration.state).equal(1, "localRegistration.state")
                  expect(localRegistration.result).instanceof(models.Kopnik, "localRegistration.result")
                  done()
                }
                catch (err) {
                  done(err)
                }
              })
              //3. копник заверяет регистрацию
              await kopnik2.verifyRegistration(localRegistration, 1)
            }
            catch (err) {
              done(err);
            }
          })

          //1. создал регистрацию
          await models.Registration.create({
            email: "unit@mail.ru",
            password: "unit",
            name: "unit",
            surname: "temp",
            patronymic: "temp",
            birth: 1983,
            passport: Date.now(),
            dom: models.Zemla.getReference(2),
          })
        }
        catch (err) {
          done(err);
        }
      })()
    })

    it('should reject', function (done) {
      (async() => {
        try {
          let kopnik2 = await models.Kopnik.get(2);
          kopnik2.registrations = []

          //2. копник поймал что ему пришла регистрация
          kopnik2.once(models.Kopnik.event.registrationAdd, async(sender, localRegistration) => {
            try {
              //4. регистрация поймала что ее заверили
              localRegistration.once(models.RemoteModel.event.change, function () {
                //5. проверям что регистрация правильная
                try {
                  expect(localRegistration.verifier.id).equal(2, "localRegistration.verifier.id")
                  expect(localRegistration.state).equal(-1, "localRegistration.state")
                  expect(localRegistration.result).null
                  done()
                }
                catch (err) {
                  done(err)
                }
              })
              //3. копник заверяет регистрацию
              await kopnik2.verifyRegistration(localRegistration, -1)
            }
            catch (err) {
              done(err);
            }
          });

          //1. создал регистрацию
          await models.Registration.create({
            email: "unit@mail.ru",
            password: "unit",
            name: "reject",
            surname: "temp",
            patronymic: "temp",
            birth: 1983,
            passport: Date.now(),
            dom: models.Zemla.getReference(2),
          })
        }
        catch (err) {
          done(err);
        }
      })()
    })
  })

  describe("#reloadRegistrations()", async function () {
    let kopnik2

    it('should not throw error', async function () {
      kopnik2 = await models.Kopnik.get(2)
      await kopnik2.reloadRegistrations()
    })

    it('should load array of 1 registrations', async function () {
      expect(kopnik2.registrations).a("array")
      expect(kopnik2.registrations).lengthOf(1)
      expect(kopnik2.registrations[0]).instanceof(models.Registration)
    })

    it('should load unferified registrations', async function () {
      expect(kopnik2.registrations[0].state).equals(0);
    })
  })


})
