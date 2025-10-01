export default class Project {
    #hashcolor;

    constructor(title, id = crypto.randomUUID()) {
        this.id = id;
        this.title = title;
        this.#hashcolor = `#${Math.random().toString(16).slice(-6)}`;
    }

    getColor() {
        return this.#hashcolor;
    }
}