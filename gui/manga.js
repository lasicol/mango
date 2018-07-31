//exports.__esModule = true;
module.exports = class Manga {
    constructor(title, volume, chapter, status, author, notes){
        this.title = title
        this.volume = volume
        this.chapter = chapter
        this.status = status
        this.author = author
        this.notes = notes
        this.id = uniqid("manga-")
    }
    toString(){
        if (this.notes != ""){
            return `${this.title} v${this.volume} c${this.chapter} ${this.status} ${this.author} ${this.notes}` 
        }
        else{
            return `${this.title} v${this.volume} c${this.chapter} ${this.status} ${this.author}` 
        }
    }
}

