// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.180
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["千年天堑变通途", "高考604分女生收到高职录取通知书", "妻子抑郁症发作伤人 丈夫反杀被判刑", "三伏天会更热吗？专家解答", "吉林省委书记：理直气壮讲渤海国历史", "福耀科大投档线超多所双一流名校", "水木年华怒怼郝蕾不够专业", "马克龙从美国抢人成功", "苏超武松在几万观众注视下认真打虎", "停课停航！台风“韦帕”加强为台风级", "牛弹琴：印度又要气炸了", "女子怕男友殴打编造“被拐卖”谣言", "马上过期的“红色尖叫”被炒到68元", "一男子吃馒头噎死 家人申请理赔遭拒", "张馨予雨林徒步后脚肿成“猪蹄”", "女儿想赴韩当练习生 黄奕：没苦硬吃", "刘宇宁：早知道练点肌肉了", "菌中之王火了 最贵卖到每公斤1800元", "男主播被指出轨多名女粉丝 本人回应", "郭德纲一家三口罕见露面", "杭州紧急提醒：不要去钱塘江抢潮头鱼", "越南一游船因雷暴倾覆多人死亡", "央视曝光职业背债人产业链", "日本参议院选举 石破茂面临下台压力", "中国新贵们为何不爱玛莎拉蒂了", "女篮输日本 韩旭泪洒发布会", "中足联：反对对球员及其家属侮辱言行", "12306回应高铁不要食用方便面提醒", "记者实测“万能遥控器”可开道闸", "宫鲁鸣回应不敌日本女篮", "中国女篮不敌日本 无缘亚洲杯决赛", "叶珂被网友狂问到底生没生", "汪峰卖299元音乐课被指销量惨淡", "《华尔街日报》怼特朗普：法庭见", "台湾女子查监控发现邻居狂闻鞋", "在逃人员在浙BA比赛现场被抓", "水上乐园可能“要命”", "特朗普：伊朗应在新地点重建核设施", "李隼费翔同框 身高成亮点", "贾跃亭新车被质疑抄袭魏牌高山", "朱拉尼会是下一个卡扎菲吗", "上半年国内车企销量前十出炉", "仨小孩相约游泳 电梯遇民警被劝退", "超十地餐协呼吁外卖停止“内卷”", "游客爬到泰山悬崖上打坐 景区回应", "韩旭称为国家队放弃了很多机会", "成都蓉城回应球迷辱骂韦世豪家属", "学者：台风韦帕或反复多次登陆华南", "男子落水被自家金毛救上岸", "7月20日正式进入三伏", "美警察挥拳击打示威民众"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
