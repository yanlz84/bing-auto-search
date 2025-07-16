// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.172
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
var default_search_words = ["走出一条中国特色城市现代化新路子", "特朗普：关税征收将于8月1日开始", "考编“专用校”分数远超985", "半年经济大考成绩单透露哪些信号", "今天这些地区气温可达40℃以上", "中方已向日方提出严正交涉", "警方通报男子砸记者采访设备：刑拘", "暑期青少年扎堆整容 专家提醒", "南开大学教授因个人简介实诚走红", "“谁手上有黄柠檬 谁就有巨额资产”", "坐后备箱男孩曾因证件被扣押辍学", "台州一海狮被虐满身伤痕？是肥胖纹", "演员吴博君去世 曾参演《天龙八部》", "山姆上架好丽友被质疑背刺中产", "特朗普：将对小国征收略高于10%关税", "澳男子42米高悬崖跳水多处骨折昏迷", "演员房子斌杨雨婷回应女儿高考成绩", "上Uber 打萝卜", "基孔肯雅热是什么 如何预防", "向佐被曝欠赌债未还", "神似张柏芝素人女孩否认签于正", "特朗普：普京并未兑现想要和平的承诺", "工行高管实名举报妻子出轨健身教练", "朱雨玲父亲：打完比赛回来上班", "陆毅鲍蕾太会养女儿了", "国足1比0中国香港获东亚杯季军", "打砸记者摄像机当事人：冲动了", "中国男篮热身赛胜荷兰", "赵露思回应整容争议", "黄渤亮相中国电影导演之夜红毯", "美英法德将8月底定为伊核协议期限", "乌决定中止履行《渥太华禁雷公约》", "鹿晗称很想到现场看“苏超”", "以色列为何又盯上了叙利亚", "《大展鸿图》舞蹈原创是重庆不齐舞团", "四川雅江县附近发生3.2级地震", "咏梅和宋佳在后台互相祝贺", "中方回应美议员威胁对华征500%关税", "蒋欣吃关晓彤同款“彩椒碗”", "日本一地20余天震了超2000次", "志愿报了电竞的男孩 如今直播卖耳机", "朱正廷家里着火了", "洛杉矶奥运会首金是美国队强项", "格陵兰岛发生5.7级地震", "山姆APP下架低糖好丽友派", "特朗普：并不急于与伊朗进行对话", "董璇：我再婚让佟丽娅又相信爱情了", "董璇再婚老公疑为演员张维伊", "殡仪馆回应招表演等专业人员：有需要", "越南河内三环内将禁燃油摩托车", "女子下周就要生了发现月子中心没了"]

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
