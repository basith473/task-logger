/* eslint-disable @lwc/lwc/no-api-reassignments*/
import { api, LightningElement } from 'lwc';

export default class PicklistValues extends LightningElement {
    @api
    selected = false;
    
    @api
    label;
    
    @api
    value;


    handleselect(event) {
        //this.selected = true;
        console.log(event);
        if(this.selected){
            this.selected = false;
        }else{
            this.selected = true;
        } 
        
    }
}