public with sharing class customLookupController {
  @AuraEnabled
  public static List<sObject> fetchLookUpValues(
    String searchKeyWord,
    String objectName,
    String searchField
  ) {
    String fieldsToReturn = 'id, Name';
    return customLookUpController.fetchExtendedLookUpValues(
      searchKeyWord,
      objectName,
      fieldsToReturn,
      searchField
    );
  }

  @AuraEnabled
  public static List<sObject> fetchExtendedLookUpValues(
    String searchKeyWord,
    String objectName,
    String fieldsToQuery,
    String searchField
  ) {
    String realObjectName = String.escapeSingleQuotes(objectName);
    String realFieldsToQuery = String.escapeSingleQuotes(fieldsToQuery);
    String searchKey = searchKeyWord + '%';

    List<sObject> returnList = new List<sObject>();
    String key = '%' + searchKey + '%';

    // Create a Dynamic SOQL Query For Fetch Record List with LIMIT 5
    String sQuery =
      'select ' +
      realFieldsToQuery +
      ' from ' +
      realObjectName +
      ' where ' +
      searchField +
      ' LIKE : key limit 10';

    try {
      List<sObject> lstOfRecords = Database.query(sQuery);
      for (sObject obj : lstOfRecords) {
        returnList.add(obj);
      }
    } catch (Exception e) {
      throw new AuraHandledException(
        'That didn\'n work:' +
        sQuery +
        '\n' +
        e.getMessage()
      );
    }
    return returnList;
  }

  @AuraEnabled
  public static string taskSave(String projectDetails, String taskDetails) {
    try {
      System.debug('check save');
      ProjectDetail pDetail = (ProjectDetail) JSON.deserialize(
        projectDetails,
        ProjectDetail.class
      );
      Map<String, TaskDetail> tDetail = (Map<String, TaskDetail>) JSON.deserialize(
        taskDetails,
        Map<String, TaskDetail>.class
      );
      System.debug(pDetail);
      System.debug(tDetail);
      if (pDetail != null) {
        String projects = pDetail.projects != null
          ? String.join(pDetail.projects, ',')
          : '';
        Project_Details__c PD = new Project_Details__c(
          Login_User__c = pDetail.loginUserId,
          User_Email__c = pDetail.loginUserEmail,
          From_Date__c = pDetail.fromDate,
          To_Date__c = pDetail.toDate,
          Projects__c = projects,
          Role__c = pDetail.roleValue
        );
        insert PD;

        if (tDetail != null && !tDetail.isEmpty()) {
          List<Project_Tasks__c> pTasks = new List<Project_Tasks__c>();
          for (String key : tDetail.keySet()) {
            String hour = (tDetail.get(key).hour).replace(':', '.');
            System.debug('key -- ' + key);
            System.debug('task -- ' + tDetail.get(key).task);
            System.debug('hour -- ' + hour);
            System.debug('description -- ' + tDetail.get(key).description);
            System.debug('PD -- ' + PD.Id);
            pTasks.add(
              new Project_Tasks__c(
                Day__c = key,
                Task__c = tDetail.get(key).task,
                Hours__c = decimal.valueOf(hour),
                Description__c = tDetail.get(key).description,
                Project_Detail__c = PD.Id
              )
            );
          }
          if (pTasks != null && !pTasks.isEmpty()) {
            insert pTasks;
          }
        }
      }
      return 'success';
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  public class ProjectDetail {
    public String loginUserId { get; set; }
    public String loginUserEmail { get; set; }
    public date fromDate { get; set; }
    public date toDate { get; set; }
    public List<String> projects { get; set; }
    public String roleValue { get; set; }
  }

  public class TaskDetail {
    public String task { get; set; }
    public String hour { get; set; }
    public String description { get; set; }
  }
}
