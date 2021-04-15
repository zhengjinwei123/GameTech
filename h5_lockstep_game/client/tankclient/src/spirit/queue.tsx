
export default class Queue {
    count: number
    lowestCount: number
    items: Array<any>

    constructor() {
        this.count = 0
        this.lowestCount = 0;
        this.items = new Array<any>()
    }

    enqueue(element: any) {
        this.items[this.count] = element
        this.count ++
    }

    dequeue(): any {
        if (this.isEmpty()) {
            return null
        }
        let result = this.items[this.lowestCount]
        delete this.items[this.lowestCount]
        this.lowestCount ++
        return result
    }

    peek(): any {
        return this.items[this.lowestCount]
    }

    peekall(): any {

        let arr = new Array<any>()

        for (let index = this.lowestCount; index !== this.count; ++ index) {
            arr.push(this.items[index])
        }
        return arr
    }

    isEmpty(): boolean {
        return this.count - this.lowestCount === 0
    }

    size(): number {
        return this.count - this.lowestCount
    }

    clear() {
        this.count = 0;
        this.lowestCount = 0;
        
        while (!this.isEmpty()) {
            this.dequeue()
        }
    }


}