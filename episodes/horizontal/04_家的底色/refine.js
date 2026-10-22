/* Layout refinements on the original scene clock. */
// Calendar movement continues through the action/result window, then settles.
const priorPauseRepair=pauseRepair;
pauseRepair=function(t){room(t,.53);const p=phase(t,60,64.3),q=ss(t,72,77.7);at(780,470,1.42,()=>meetingWorld(t,q,{pause:p,mood:t<65?.3:.1,phone:ss(t,60.5,64),dialogue:t>68?'刚才那样说，不合适':null,bubbleX:100,bubbleA:phase(t,68.4,72.5)}));calendarDetail(t,q,ss(t,72,73));alpha(1-ss(t,71.5,72.4),()=>{text(t<64.4?'先约好暂停':'再回到具体的问题',1510,487,40,P.gold,'NotoSerif',500,600);line([[1310,552],[1710,552]],'#e9c48555',2)});header('04','把道歉，接到具体的改变上','PAUSE · RETURN · TAKE RESPONSIBILITY');note('一般分歧的示例：暂停后回到问题，不以冷处理取代沟通')};
cooperation=function(t){room(t,.82);const bk=phase(t,98.3,103.5),q=ss(t,94.2,97.9);at(740,471,1.38,()=>meetingWorld(t,q,{pause:.50*phase(t,103.6,107.7),rest:1,bagK:bk,mood:0,dialogue:t<103.5?'明天我来接':'先停一下，再好好说',bubbleX:100,bubbleA:t<103.5?phase(t,98.3,103.4):phase(t,103.6,107.7)}));calendarDetail(t,q,1);header('06','让修复，出现在下一次行动里','AGREEMENTS THAT BECOME ACTIONS');note('接送与休息是生活示例；关系修复需要持续行动')};
SCENES[5].draw=pauseRepair;SCENES[8].draw=cooperation;
window.REFINE_READY=true;
