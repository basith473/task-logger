/* eslint-disable @lwc/lwc/no-api-reassignments*/
import { api, LightningElement, track } from 'lwc';

export default class MutliSelectPicklist extends LightningElement {
    @api values = [];
    @api picklistlabel = 'Status';
    @track selectedvalues = [];

    showdropdown;

    handleleave() {
        let dropCheck= this.showdropdown;
        if(dropCheck){
            this.showdropdown = false;
            this.fetchSelectedValues();
            console.log('lost focus');
            if(this.selectedvalues){
                const custEvt = new CustomEvent('select',{detail : this.selectedvalues});
                this.dispatchEvent(custEvt);
            }
        }
    }

    connectedCallback(){
        this.values.forEach(element => element.selected 
                            ? this.selectedvalues.push(element.value) : '');
        console.log('connected');
    }

    fetchSelectedValues() {
        this.selectedvalues = [];
        //get all the selected values
        this.template.querySelectorAll('c-picklist-values').forEach(
            element => {
                if(element.selected){
                    console.log(element.value);
                    this.selectedvalues.push(element.value);
                }
            }
        );
        //refresh original list
        this.refreshOrginalList();
    }

    refreshOrginalList() {
        //update the original value array to shown after close
        const picklistvalues = this.values.map(eachvalue => ({...eachvalue}));

        picklistvalues.forEach((element, index) => {
            if(this.selectedvalues.includes(element.value)){
                picklistvalues[index].selected = true;
            }else{
                picklistvalues[index].selected = false;
            }
        });

        this.values = picklistvalues;
    }

    handleShowdropdown(){
        let dropCheck = this.showdropdown;
        if(dropCheck){
            this.showdropdown = false;
            this.fetchSelectedValues();
        }else{
            this.showdropdown = true;
        }
    }

    closePill(event){
        let selection = event.target.dataset.value;
        let selectedpills = this.selectedvalues;
        let pillIndex = selectedpills.indexOf(selection);
        this.selectedvalues.splice(pillIndex, 1);
        this.refreshOrginalList();
        const custEvt = new CustomEvent('select',{detail : this.selectedvalues});
        this.dispatchEvent(custEvt);
    }

    get selectedmessage() {
        return this.selectedvalues.length + ' values are selected';
    }
}