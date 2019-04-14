var recaptchaPrecacheDebugger=new function(){this.log=function(dataType,postData){chrome.runtime.sendMessage({type:"notifyRecaptchaPrecacheDebugPage",dataType:dataType,postData:postData},function(result){})}};var RecaptchaPrecache=function(parameter){return new function(parameter){var RecaptchaPrecache=this;var recalculateSolvingTimeForHostCallback=$.Callbacks();recalculateSolvingTimeForHostCallback.add(function(fakeTaskId){if(typeof precachedSolutionsByFakeTaskId[fakeTaskId]!=="undefined"&&typeof precachedSolutions[precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname]!=="undefined"){var hostnameInfo=precachedSolutions[precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname];hostnameInfo.totalSolvingTime+=precachedSolutionsByFakeTaskId[fakeTaskId].endTime-precachedSolutionsByFakeTaskId[fakeTaskId].startTime;hostnameInfo.totalSolvedTasks++;hostnameInfo.mediumSolvingTime=(hostnameInfo.totalSolvingTime+hostnameInfo.mediumSolvingTime)/(hostnameInfo.totalSolvedTasks+1)}});var recalculateFeelsLikeSolvingTimeForHostCallback=$.Callbacks();recalculateFeelsLikeSolvingTimeForHostCallback.add(function(fakeTaskId){if(typeof precachedSolutionsByFakeTaskId[fakeTaskId]!=="undefined"&&typeof precachedSolutions[precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname]!=="undefined"){var hostnameInfo=precachedSolutions[precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname];hostnameInfo.totalFeelsLikeSolvingTime+=precachedSolutionsByFakeTaskId[fakeTaskId].taskProcessingToContentScriptTime-precachedSolutionsByFakeTaskId[fakeTaskId].requestTime;hostnameInfo.mediumFeelsLikeSolvingTime=(hostnameInfo.totalFeelsLikeSolvingTime+hostnameInfo.mediumFeelsLikeSolvingTime)/(hostnameInfo.totalSolvedTasks+1)}});var taskListChangedCallback=$.Callbacks();taskListChangedCallback.add(function(hostname){if(typeof precachedSolutions[hostname]==="undefined"){return}var hostnameInfo=precachedSolutions[hostname];hostnameInfo.tasks=hostnameInfo.tasks.sort(function(a,b){if(precachedSolutionCanBeUsed(a)&&!precachedSolutionCanBeUsed(b)){return-1}else if(!precachedSolutionCanBeUsed(a)&&precachedSolutionCanBeUsed(b)){return 1}else{if(!a.error&&b.error){return-1}else if(a.error&&!b.error){return 1}else{if(a.endTime!==null&&b.endTime===null){return-1}else if(a.endTime===null&&b.endTime!==null){return 1}else if(a.endTime===null&&b.endTime===null){return 0}else{if(a.endTime<b.endTime){return-1}else if(a.endTime>b.endTime){return 1}else{if(a.startTime<b.startTime){return-1}else if(a.startTime>b.startTime){return 1}else{return 0}}}}}})});var taskActionCallback=$.Callbacks();taskActionCallback.add(function(fakeTaskId,action){if(typeof precachedSolutionsByFakeTaskId[fakeTaskId]!=="undefined"){switch(action.type){case"start":precachedSolutionsByFakeTaskId[fakeTaskId].startTime=currentTimestamp();break;case"error":precachedSolutionsByFakeTaskId[fakeTaskId].error=action.error.message;break;case"attach":case"detach":case"reattach":taskListChangedCallback.fire(precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname);break;case"setRealTaskId":precachedSolutionsByFakeTaskId[fakeTaskId].realTaskId=action.realTaskId;break;case"finish":precachedSolutionsByFakeTaskId[fakeTaskId].endTime=currentTimestamp();precachedSolutionsByFakeTaskId[fakeTaskId].solution=action.taskSolution;taskListChangedCallback.fire(precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname);break}}});var taskTabAttachCallback=$.Callbacks();taskTabAttachCallback.add(function(task,tabId){task.tabIdLastCheckTime=currentTimestamp();if(task.tabId!=tabId){task.tabId=tabId;task.requestTime=currentTimestamp();taskActionCallback.fire(task.fakeTaskId,{type:"attach"})}});var taskTabDetachCallback=$.Callbacks();taskTabDetachCallback.add(function(task){task.tabId=null;task.tabIdLastCheckTime=null;task.requestTime=null;taskActionCallback.fire(task.fakeTaskId,{type:"detach"})});var taskTabReattachCallback=$.Callbacks();taskTabReattachCallback.add(function(task,tabId){task.tabIdLastCheckTime=currentTimestamp();if(task.tabId!=tabId){task.tabId=tabId;taskActionCallback.fire(task.fakeTaskId,{type:"reattach"})}});var solutionHostExpirationCallback=$.Callbacks();solutionHostExpirationCallback.add(function(hostname,wasExpired){if(typeof precachedSolutions[hostname]!=="undefined"){var hostnameInfo=precachedSolutions[hostname];hostnameInfo.noCacheRequestsSinceLastSolutionExpiration=wasExpired}});var taskSolvingInterval=setInterval(function(){for(var fakeTaskId in precachedSolutionsByFakeTaskId){if(!precachedSolutionsByFakeTaskId[fakeTaskId].startTime){taskActionCallback.fire(fakeTaskId,{type:"start"});var anticaptcha=Anticaptcha(globalStatus.account_key);anticaptcha.setWebsiteURL("https://"+precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname+"/");anticaptcha.setWebsiteKey(precachedSolutionsByFakeTaskId[fakeTaskId].taskData.siteKey);anticaptcha.setSoftId(802);(function(fakeTaskId){anticaptcha.createTaskProxyless(function(err,taskId){if(err){console.error(err);taskActionCallback.fire(fakeTaskId,{type:"error",error:err});return}taskActionCallback.fire(fakeTaskId,{type:"setRealTaskId",realTaskId:taskId});anticaptcha.getTaskSolution(taskId,function(err,taskSolution){if(err){taskActionCallback.fire(fakeTaskId,{type:"error",error:err});console.error(err);return}taskActionCallback.fire(fakeTaskId,{type:"finish",taskSolution:taskSolution});recalculateSolvingTimeForHostCallback.fire(fakeTaskId)})})})(fakeTaskId)}}},1e3);var taskFreshnessCheckInterval=setInterval(function(){for(var fakeTaskId in precachedSolutionsByFakeTaskId){if(!precachedSolutionsByFakeTaskId[fakeTaskId].expired&&precachedSolutionExpired(precachedSolutionsByFakeTaskId[fakeTaskId])){ALogger.log("task expired, fakeid = ",fakeTaskId,precachedSolutionsByFakeTaskId[fakeTaskId]);precachedSolutionsByFakeTaskId[fakeTaskId].expired=true;if(!precachedSolutionsByFakeTaskId[fakeTaskId].taskProcessingToContentScriptTime){if(typeof precachedSolutions[precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname]!=="undefined"){solutionHostExpirationCallback.fire(precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname,true)}}}}},1e3);var tabIdAttachmentCheckInterval=setInterval(function(){for(var fakeTaskId in precachedSolutionsByFakeTaskId){if(!precachedSolutionIsFree(precachedSolutionsByFakeTaskId[fakeTaskId])&&precachedSolutionsByFakeTaskId[fakeTaskId].tabIdLastCheckTime&&precachedSolutionsByFakeTaskId[fakeTaskId].tabIdLastCheckTime+tabAttachmentFreshnessCheck<currentTimestamp()&&precachedSolutionCanBeUsed(precachedSolutionsByFakeTaskId[fakeTaskId])){ALogger.log("clear tabId attachment, taskid = ",fakeTaskId);taskTabDetachCallback.fire(precachedSolutionsByFakeTaskId[fakeTaskId])}}},1e3);var taskCloningInterval=setInterval(function(){for(var hostname in precachedSolutions){var availableTasks=0;for(var i in precachedSolutions[hostname].tasks){if(precachedSolutionCanBeUsed(precachedSolutions[hostname].tasks[i])&&precachedSolutionIsFree(precachedSolutions[hostname].tasks[i])){availableTasks++}}if(availableTasks<precachedSolutions[hostname].precachedSolutionsCountK&&!precachedSolutions[hostname].noCacheRequestsSinceLastSolutionExpiration){ALogger.log("Creating new tasks");for(var i=0;i<precachedSolutions[hostname].precachedSolutionsCountK-availableTasks;i++){RecaptchaPrecache.create(hostname,precachedSolutions[hostname].siteKey,null,true)}}}},3e3);var taskCleaningInterval=setInterval(function(){for(var hostname in precachedSolutions){for(var i in precachedSolutions[hostname].tasks){if(precachedSolutionCanBeRemoved(precachedSolutions[hostname].tasks[i],precachedSolutions[hostname])){delete precachedSolutionsByFakeTaskId[precachedSolutions[hostname].tasks[i].fakeTaskId];delete precachedSolutions[hostname].tasks[i]}}precachedSolutions[hostname].tasks=precachedSolutions[hostname].tasks.filter(function(n){return n!=undefined});if(precachedSolutions[hostname].tasks.length==0&&precachedSolutions[hostname].lastTaskCreateTime+hostWithoutTasksLifetime*60<currentTimestamp()){clearInterval(precachedSolutions[hostname].everyMinuteCheckInterval);delete precachedSolutions[hostname]}}},60*1e3);setInterval(function(){recaptchaPrecacheDebugger.log("precachedSolutions",precachedSolutions)},1e3);var precachedSolutions={"antcpt.com":{hostname:"antcpt.com",siteKey:"fdfsf2343fdsfds3424",tasks:[{fakeTaskId:123,realTaskId:321,startTime:1234567890,endTime:1234567890,solution:"",tabId:54321,tabIdLastCheckTime:1234567890,taskProcessingToContentScriptTime:0,error:null,taskData:{hostname:"antcpt.com",siteKey:"fdfsf2343fdsfds3424"}}],noCacheRequestsSinceLastSolutionExpiration:false,precachedSolutionsCountK:minPrecachedSolutions,totalSolvingTime:0,totalFeelsLikeSolvingTime:0,totalSolvedTasks:0,mediumSolvingTime:baseMediumSolvingTime,mediumFeelsLikeSolvingTime:baseMediumSolvingTime,mediumRatePerMinute:minPrecachedSolutions*(60/baseMediumSolvingTime),totalTasksRequested:0,totalMinutesWithTasks:0,lastMiniuteCheckTime:currentTimestamp()}};precachedSolutions={};RecaptchaPrecache.cacheFreshnessTime=110;var tabAttachmentFreshnessCheck=10;var baseMediumSolvingTime=40;var precachedSolutionsByFakeTaskId={};var minPrecachedSolutions=2;var hostWithoutTasksLifetime=5;this.getByHostname=function(hostname,tabId){ALogger.log("getByHostname called with arguments",arguments);solutionHostExpirationCallback.fire(hostname,false);if(typeof precachedSolutions[hostname]!="undefined"){for(var i in precachedSolutions[hostname].tasks){if(precachedSolutionCanBeUsed(precachedSolutions[hostname].tasks[i])&&(precachedSolutionIsFree(precachedSolutions[hostname].tasks[i])||precachedSolutionBelongsToThisTabId(precachedSolutions[hostname].tasks[i],tabId))){var taskInfo=precachedSolutions[hostname].tasks[i];taskTabAttachCallback.fire(taskInfo,tabId);return taskInfo}}return false}else{return false}};function precachedSolutionCanBeRemoved(task,hostnameInfo){return!precachedSolutionCanBeUsed(task)&&!wasRequestedInLastMinute(task,hostnameInfo)}function precachedSolutionIsFree(task){return!task.tabId}function precachedSolutionBelongsToThisTabId(task,tabId){return task.tabId==tabId}function precachedSolutionCanBeUsed(task){return!task.taskProcessingToContentScriptTime&&!task.expired&&!precachedSolutionExpired(task);task.tabId&&(typeof tabId=="undefined"||task.tabId!=tabId)||task.taskProcessingToContentScriptTime||task.expired||precachedSolutionExpired(task)}function precachedSolutionExpired(task){return task.endTime&&task.endTime+RecaptchaPrecache.cacheFreshnessTime<=currentTimestamp()}this.markTaskAsProcessedToContentScript=function(task){task.taskProcessingToContentScriptTime=currentTimestamp();recalculateFeelsLikeSolvingTimeForHostCallback.fire(task.fakeTaskId);solutionHostExpirationCallback.fire(task.taskData.hostname,false)};this.copyRequestTimeToAnotherTask=function(taskDst,taskSrc){taskDst.requestTime=taskSrc.requestTime};this.getByTaskId=function(fakeTaskId,tabId){ALogger.log("getByTaskId called with arguments",arguments);if(typeof precachedSolutionsByFakeTaskId[fakeTaskId]!="undefined"){if(precachedSolutionCanBeUsed(precachedSolutionsByFakeTaskId[fakeTaskId])&&(precachedSolutionIsFree(precachedSolutionsByFakeTaskId[fakeTaskId])||precachedSolutionBelongsToThisTabId(precachedSolutionsByFakeTaskId[fakeTaskId],tabId))){solutionHostExpirationCallback.fire(precachedSolutionsByFakeTaskId[fakeTaskId].taskData.hostname,false);if(tabId){taskTabReattachCallback.fire(precachedSolutionsByFakeTaskId[fakeTaskId],tabId)}return precachedSolutionsByFakeTaskId[fakeTaskId]}else{return false}}else{return false}};function wasRequestedInLastMinute(task,hostnameInfo){return task.requestTime&&task.requestTime>=hostnameInfo.lastMiniuteCheckTime}this.refreshPrecachedSolutionsCountKForEveryHost=function(){for(var hostname in precachedSolutions){normalizePrecachedSolutionsCountKForHostname(hostname)}};function normalizePrecachedSolutionsCountKForHostname(hostname){if(typeof globalStatus.k_precached_solution_count_min!="undefined"&&typeof precachedSolutions[hostname]!=="undefined"){precachedSolutions[hostname].precachedSolutionsCountK=Math.max(precachedSolutions[hostname].precachedSolutionsCountK,globalStatus.k_precached_solution_count_min)}if(typeof globalStatus.k_precached_solution_count_max!="undefined"&&typeof precachedSolutions[hostname]!=="undefined"){precachedSolutions[hostname].precachedSolutionsCountK=Math.min(precachedSolutions[hostname].precachedSolutionsCountK,globalStatus.k_precached_solution_count_max)}}this.createHost=function(hostname,siteKey){var precachedSolutionsCountK=typeof globalStatus.k_precached_solution_count_min!="undefined"?globalStatus.k_precached_solution_count_min:minPrecachedSolutions;precachedSolutions[hostname]={hostname:hostname,siteKey:siteKey,tasks:[],noCacheRequestsSinceLastSolutionExpiration:false,precachedSolutionsCountK:precachedSolutionsCountK,totalSolvingTime:0,totalFeelsLikeSolvingTime:0,totalSolvedTasks:0,mediumSolvingTime:baseMediumSolvingTime,mediumFeelsLikeSolvingTime:baseMediumSolvingTime,mediumRatePerMinute:precachedSolutionsCountK*(60/baseMediumSolvingTime),totalTasksRequested:0,totalMinutesWithTasks:0,lastTaskCreateTime:0,lastMiniuteCheckTime:currentTimestamp(),everyMinuteCheckInterval:setInterval(function(){ALogger.log("everyMinuteCheckInterval hostname = ",hostname);var lastMinuteTaskCount=0;for(var fakeTaskId in precachedSolutions[hostname].tasks){if(wasRequestedInLastMinute(precachedSolutions[hostname].tasks[fakeTaskId],precachedSolutions[hostname])&&!precachedSolutionIsFree(precachedSolutions[hostname].tasks[fakeTaskId])&&!precachedSolutions[hostname].tasks[fakeTaskId].error){lastMinuteTaskCount++}}precachedSolutions[hostname].lastMiniuteCheckTime=currentTimestamp();ALogger.log("lastMinuteTaskCount = ",lastMinuteTaskCount);if(lastMinuteTaskCount){precachedSolutions[hostname].totalTasksRequested+=lastMinuteTaskCount;precachedSolutions[hostname].totalMinutesWithTasks++;precachedSolutions[hostname].mediumRatePerMinute=precachedSolutions[hostname].totalTasksRequested/precachedSolutions[hostname].totalMinutesWithTasks;precachedSolutions[hostname].precachedSolutionsCountK=Math.round(precachedSolutions[hostname].mediumRatePerMinute*precachedSolutions[hostname].mediumSolvingTime/60);normalizePrecachedSolutionsCountKForHostname(hostname)}},60*1e3)}};this.create=function(hostname,siteKey,tabId,byCloning){byCloning=!!byCloning;ALogger.log("Task creation called with arguments",arguments);if(typeof precachedSolutions[hostname]=="undefined"){RecaptchaPrecache.createHost(hostname,siteKey)}var fakeTaskId;do{fakeTaskId=Math.round(Math.random()*1e6)}while(typeof precachedSolutionsByFakeTaskId[fakeTaskId]!="undefined");var newTask={fakeTaskId:fakeTaskId,realTaskId:null,createTime:currentTimestamp(),requestTime:null,startTime:null,endTime:null,expired:false,solution:"",tabId:null,tabIdLastCheckTime:null,taskProcessingToContentScriptTime:0,error:null,taskData:{hostname:hostname,siteKey:siteKey}};precachedSolutionsByFakeTaskId[fakeTaskId]=newTask;precachedSolutions[hostname].tasks.push(newTask);precachedSolutions[hostname].lastTaskCreateTime=currentTimestamp();if(!byCloning){solutionHostExpirationCallback.fire(hostname,false)}if(tabId){taskTabAttachCallback.fire(newTask,tabId)}ALogger.log("precachedSolutionsByFakeTaskId = ",precachedSolutionsByFakeTaskId);return fakeTaskId}}(parameter)};