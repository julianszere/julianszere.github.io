export class PhrasesHelper {
    constructor() {
        this.titleVariables = [
            'Rayuela',
            'El árbol del orgullo'
        ];
        this.textVariables = [
           '«La corrosión profunda de un mundo denunciado como falso, el ataque por acumulación y no por destrucción»',
           '«Imaginé (vi) un universo plástico, cambiante, lleno de maravilloso azar, un cielo elástico, un sol que de pronto falta o se queda fijo o cambia de forma»',
           '«Algo que tenía la forma de un pájaro y que otra vez, en otra soledad, tuvo la forma de una serpiente»',
           '«Yo he sido Homero; en breve, seré Nadie, como Ulises; en breve seré todos: estaré muerto»'
        ];
        this.authorVariables = [
            'Julio Cortázar',
            'Chesterton'
        ];
    }

    newCombination(text) {
        return text[Math.floor(Math.random() * text.length)];
    }

    getTitleTextAndAuthor() {
        return [null, this.newCombination(this.textVariables), null]
    }
}
