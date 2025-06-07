// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.94
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
var default_search_words = ["中美对话和合作是唯一正确的选择", "今年丢准考证的高考生已出现", "特朗普：乌方给了普京轰炸他们的理由", "全球品牌 如何赢在中国", "北大韦神账号涨粉千万成高考祝福区", "2025年全国高考正式拉开帷幕", "三亚被咬身亡女子家属不赞成尸检", "牛弹琴：全世界都在吃美国的瓜", "为何每年高考都会下雨？", "甲骨文版高考祝福来啦", "全国人大常委会原副委员长热地逝世", "可高价买高考试题和答案？假", "国防部发来硬核高考祝福", "高考第1天多地大到暴雨考生需防范", "高考第一天张桂梅的小喇叭又响了", "明星们都来给考生送祝福了", "点燃十万明灯祝学子金榜题名", "张婧仪黑发红唇港风美人", "老师穿状元服与考生击掌送祝福", "高考时间为何从7月改到6月", "女子去世前家属求助7小时无医生救治", "七旬老农被五步蛇咬后割肉放血自救", "退休教授雨夜爬山失足坠崖遇难", "张本美和将缺席乒超第一阶段比赛", "乱港分子黄之锋狱中再被捕", "国足出局 最后一个主场球票停止退票", "乌称对俄军用机场“成功”发动袭击", "10个月宝宝患病 父亲不愿被拖累离婚", "将老人抠伤双眼者患妄想症", "法国女排3-1取首胜", "#为2025高考加油#", "全运会吉林男篮战胜湖北男篮", "张真源撕名牌飞起来了", "韦神评论区变高考许愿池", "《西游记》演员叶以萌去世", "女子被毒蛇咬伤两年后仍有后遗症", "全红婵夸陈梦好漂亮", "17岁女孩代孕涉事公司被罚25万", "北大韦神1天涨粉超700万", "高考期间考生一日三餐如何吃", "日本气象厅：随时可能发生大规模地震", "挪威3比0意大利", "范玮琪一开口就跑调", "狗咬狗后两主人摔倒纠纷案一审判决", "中汽协：4月汽车零部件出口同比增长", "《奔跑吧》范丞丞再现甄嬛式演法", "苏轼李白杜甫也来为考生打call了", "范玮琪淘汰", "7月广东将举办“粤超”", "高三考生排队摸985车牌持向日葵出征", "白鹿用中式美学打开《临江仙》"]

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
