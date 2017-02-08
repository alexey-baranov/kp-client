import join from '../../../../src/decorator/join'

describe.only('join()', () => {
  it('should return correct result', (done) => {
    let func = (a, b) => Promise.resolve(7)
    let joined = join(func)

    Promise.all([0, 1, 2, 3, 4].map(() => joined().then((result) => {
      if (result!=7){
        throw new Error("result = "+ result)
      }
    })))
      .then(()=>done(), done)
  })

  it('should bind correct context', async() => {
    class Accumulator {
      constructor() {
        this.a = 1
        this.b = 2

        this.joinedDo = join(this.do)
      }

      do() {
        return Promise.resolve(this.a + this.b)
      }
    }
    let accumulator = new Accumulator()

    expect(await accumulator.do()).equal(await accumulator.joinedDo())
  })

  it('should not call twice', (done) => {
    let count = 0

    let inc = (a, b) => Promise.resolve(count++)
    let joinedInc = join(inc)

    Promise.all([0, 1, 2, 3, 4].map(() => joinedInc()))
      .then(() => {
        if (count > 1) {
          done(new Error("many calls: " + count))
        }
        done()
      }, done)
  })

  it('should re-throw errors', (done) => {
    let broken = (a, b) => Promise.reject(new Error(123))
    let joinedBroken = join(broken)

    let count=0

    Promise.all([0, 1, 2, 3, 4].map(() => joinedBroken().catch((result) => {
      count++
      if (result.message!= "123"){
        throw new Error("result = "+ result)
      }
    })))
      .then(()=>{
        if (count!=5) throw new Error("Errors thrown less then 5 times")
        done()
      })
      .catch(done)
  })
})
