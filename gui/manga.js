const uniqid = require('uniqid');

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
    getTitle(){return this.title}

    getVolume(){return this.volume}
    setVolume(value){this.volume = value}

    getChapter(){return this.chapter}
    setChapter(value){this.chapter = value}

    getStatus(){return this.status}
    setStatus(value){this.status = value}

    getAuthor(){return this.author}
    setAuthor(value){this.author = value}

    getNotes(){return this.notes}
    setNotes(value){this.notes = value}
    
    getId(){return this.id}
}

