import { LightningElement, track } from 'lwc';
import  taskSave from '@salesforce/apex/customLookUpController.taskSave';

export default class TaskLoggerComponent extends LightningElement {
    @track roleValue;
    @track displayTable = false;
    @track loginUserName;
    @track loginUserEmail;
    @track fromDate;
    @track toDate;
    @track projectSelected = [];
    @track tableData = {};
    @track hourList = [];
    @track isLoading = false; 

    values = [{ label: 'Project A', value: 'Project A', selected: false },
    { label: 'Project B', value: 'Project B', selected: false },
    { label: 'Project C', value: 'Project C', selected: false },
    { label: 'Project D', value: 'Project D', selected: false },
    { label: 'Project E', value: 'Porject E', selected: false }];

    roleValues = [{ label: 'Role A', value: 'Role A' },
    { label: 'Role B', value: 'Role B' },
    { label: 'Role C', value: 'Role C' }];

    taskValues = [{ label: 'Task A', value: 'Task A' },
    { label: 'Task B', value: 'Task B' },
    { label: 'Task C', value: 'Task C' }];

    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    columns = ['Day', 'Task', 'Hours', 'Description'];

    connectedCallback() {
        //prepare the hours list
        for (let hour = 0; hour < 24; hour++) {
            for (let mins = 0; mins < 2; mins++) {
                //
                let strMin = mins === 0 ? '00' : '50';
                let str = String(hour) + ':' + strMin;
                console.log('Hours -- ' + hour);
                console.log('Min -- ' + mins);
                console.log(str);
                this.hourList.push({ label: str, value: str });
            }
        }
    }

    handleChange(event) {
        this.roleValue = event.target.value;
    }

    handleDateChange(event) {
        console.log(event);
        if (event.target.name === 'fromDate') {
            this.fromDate = event.target.value;
        } else {
            this.toDate = event.target.value;
        }

        if (this.toDate && this.fromDate && this.projectSelected.length > 0) {
            this.displayTable = true;
        } else {
            this.displayTable = false;
        }
    }

    handleMultiSelect(event) {
        console.log('handling multi select');
        console.log(event);
        let values = event.detail;
        this.projectSelected = values;
        console.log('after event : ' + this.projectSelected);
        if (this.toDate && this.fromDate && this.projectSelected.length > 0) {
            this.displayTable = true;
        } else {
            this.displayTable = false;
        }
    }

    handleSave() {
        this.isLoading = true;
        let projectDetails = {};
        projectDetails.loginUserId = this.loginUserName;
        projectDetails.loginUserEmail = this.loginUserEmail;
        projectDetails.fromDate = this.fromDate;
        projectDetails.toDate = this.toDate;
        projectDetails.projects = this.projectSelected;
        projectDetails.roleValue = this.roleValue;
        //projectDetails.taskDetail = this.tableData;
        let searchParams = {
            projectDetails: JSON.stringify(projectDetails),
            taskDetails: JSON.stringify(this.tableData)
        }
        taskSave(searchParams)
        .then(result => console.log(result))
        .catch(error => console.log(error))
        this.isLoading = false;
    }

    lookupSelected(event) {
        console.log(event.detail);
        if (event.detail.name === 'Name') {
            this.loginUserName = event.detail.recordId;
        } else if (event.detail.name === 'Email') {
            this.loginUserEmail = event.detail.value ? event.detail.value.Name : '';
        }
    }

    taskChanged(event) {
        let key = event.target.name;
        this.addTaskDetail(key, event.target.value, 'task');
    }

    hoursChanged(event) {
        let key = event.target.name;
        this.addTaskDetail(key, event.target.value, 'hour');
    }

    descriptionChanged(event) {
        let key = event.target.name;
        this.addTaskDetail(key, event.target.value, 'description');
    }

    addTaskDetail(key, value, fieldName) {
        let task = {};
        if (key in this.tableData) {
            task = this.tableData[key];
            task[fieldName] = value;
        } else {
            task[fieldName] = value;
            this.tableData[key] = task;
        }
    }
}