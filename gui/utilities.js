module.exports = class Utilities {
    static findById(array, id){
        for (var i = 0; i < array.length; i++){
            if (array[i].id == id){
                return i
            }
        }
        return -1
    }

    static linkToTitle(link){
        //deletes http and page main link, replaces _ and / with spaces
        return link.replace(/((http:\/\/)|(www\.mangago\.me\/read-manga\/))/g, "").replace(/_|\//g, " ")
    }

    static insertLi(text, index, className, id, targetHtmlObject, document){
        var itemText = document.createTextNode(text);
        var li = document.createElement('li');
        li.className = className;
        li.id = id
        li.appendChild(itemText);
        if (index > -1){
            targetHtmlObject.insertBefore(li, targetHtmlObject.children[index])
        }
        else{
            targetHtmlObject.appendChild(li)
        }
    }

    static removeItem(id, list, document){
        var index = Utilities.findById(list, id)
        if (index > -1){
            let item = document.getElementById(id)
            item.remove()
            list.splice(index, 1)
        }
    }
}