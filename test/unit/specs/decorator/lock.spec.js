import lock from '../../../../src/decorator/lock'

describe('lock()', () => {
  it('should return correct result', async() => {
    let sum = (a, b) => Promise.resolve(a + b)
    let lockedSum = lock(sum)

    expect(await sum(1, 2)).equal(await lockedSum(1, 2))
  })

  it('should bind correct context', async() => {
    class Accumulator {
      constructor() {
        this.a = 1
        this.b = 2

        this.lockedDo = lock(this.do)
      }

      do() {
        return Promise.resolve(this.a + this.b)
      }
    }
    let accumulator = new Accumulator()

    expect(await accumulator.do()).equal(await accumulator.lockedDo())
  })

  it('should re-throw errors', (done) => {
    let broken = (a, b) => Promise.reject(new Error(123))
    let lockedBroken = lock(broken)

    lockedBroken(1, 2)
      .catch((err) => {
        expect(err).instanceof(Error)
        expect(err.message).equal("123")
        done()
      })
      .catch(done)
  })

  it('should lock', (done) => {
    let sum = (a, b) => Promise.resolve(a + b)
    let lockedSum = lock(sum)

    lockedSum()
    lockedSum()
      .catch(() => done())
  })

  it('should set locked property', (done) => {
    let sum = (a, b) => Promise.resolve(a + b)
    let lockedSum = lock(sum)

    expect(lockedSum.locked).false
    lockedSum()
      .then(() => {
        expect(lockedSum.locked).false
        done()
      })
      .catch(done)
    expect(lockedSum.locked).true
  })
})
