import  isEqual  from "lodash/isEqual"

export class ValueObject {
    public equals(vo: this): boolean {
        if (vo == null || vo == undefined) {
            return false
        }

        //verificar se os dois objetos sao da mesma classe
        if(vo.constructor.name !== this.constructor.name) {
            return false
        }
        
        return isEqual(vo, this)
    }

}