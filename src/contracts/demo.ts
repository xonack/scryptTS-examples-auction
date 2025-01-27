import { assert, bsv, method, prop, SmartContract } from 'scrypt-ts'
import { UTXO } from '../types'

export class Demo extends SmartContract {
    @prop()
    x: bigint

    @prop()
    y: bigint

    constructor(x: bigint, y: bigint) {
        super(...arguments)
        this.x = x
        this.y = y
    }

    @method()
    sum(a: bigint, b: bigint): bigint {
        return a + b
    }

    @method()
    public add(z: bigint) {
        assert(z == this.sum(this.x, this.y), 'add check failed')
    }

    @method()
    public sub(z: bigint) {
        assert(z == this.x - this.y, 'sub check failed')
    }

    getDeployTx(utxos: UTXO[], satoshis: number): bsv.Transaction {
        return new bsv.Transaction().from(utxos).addOutput(
            new bsv.Transaction.Output({
                script: this.lockingScript,
                satoshis: satoshis,
            })
        )
    }

    getCallTxForAdd(z: bigint, prevTx: bsv.Transaction): bsv.Transaction {
        return new bsv.Transaction()
            .addInputFromPrevTx(prevTx)
            .setInputScript(0, () => {
                return this.getUnlockingScript((self) => self.add(z))
            })
    }
}

/* uncomment to run this file as a standalone script: `ts-node src/contracts/demo.ts`
(async () => { 
    await Demo.compile()
    const demo = new Demo(1n, 2n)
    const sum = 3n
    demo.add(sum)
    console.log(`add to ${sum}`)
})()
*/
