import { TiledObject } from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur"

class DoorObject extends ex.Actor {
    public leadsTo; 
    public properties;
    constructor(doorConfig: TiledObject) {
        super({
            name: doorConfig.name,
            x: doorConfig.x,
            y: doorConfig.y,
            height: doorConfig.height,
            width: doorConfig.width
        }) 
        this.leadsTo = doorConfig.type;
        this.properties = doorConfig.properties;
    }
}

export default DoorObject;