export class UIElement {

    /*  UIElements can be anyhing from
        FontSizes
        FontStyles
        BackgroundColor
        Theme Color
        UIElement positions
        Etc...

        Middle states are considered "optimal"

        "Example Theme Color states"
        0 - Orange
        1 - Light Blue (Optimal)
        2 - Black 
        
        "Example UIElement size"
        0 - Small
        1 - Medium (Optimal)
        2 - Hidden 
    */

    private property_count:number;
    private current_property:number = 0;
    private name:string;

    constructor(p_count:number, current_property:number, name:string){
      this.property_count = p_count;
      this.current_property = current_property;
      this.name = name;
    }

    setState = (property:number) => {
      this.current_property = property;
    }
    getState = () => {
      return this.current_property;
    }
    getState_Count = () => {
      return this.property_count;
    }
    getName = () => {
      return this.name;
    }
}