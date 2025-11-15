// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.417
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
var default_search_words = ["与汉学结伴 和中国同行", "中方已做好对日实质反制准备", "恢复“大佐” 日本意欲何为", "10月份国民经济持续稳中有进", "福建前首富交棒 80后女儿上位", "日媒关注：中方愤怒正在升级", "多家航司：日本机票免费退改", "金鸡奖颁奖", "女子爆改公摊电梯厅涮火锅引争议", "00后女子每月花5千买“秒回师”服务", "高市早苗涉台谬论是越线挑衅", "男子为卖货造谣化工厂害死人被罚", "钟楚曦获金鸡奖最佳女配角奖", "中方收到俄方请求 细节披露", "陈建斌想牵手蒋勤勤三次都没牵上", "高市早苗为军国主义招魂让世人唾弃", "百亩葵花田遭哄抢 8人被行拘", "“速冻”模式要来了", "袁富华获金鸡奖最佳男配角奖", "淄博“苹果哥”走红 本人回应", "覃海洋摘得全运会200米蛙泳金牌", "苏有朋主持金鸡奖前争分夺秒背稿", "樊振东：王楚钦是国乒绝对的领军人物", "3位日本前首相警示高市早苗", "林诗栋首进全运会男单决赛", "陪看全运会乒乓球男团小组赛", "王楚钦回应不敌樊振东", "美国将拒绝肥胖外国人入境", "日本三大“毒土”长出来的高市早苗", "日本米价再创新高 民众感叹：奢侈品", "宁静走红毯像踩着高跷", "神舟二十二号飞船将满载货物上太空", "樊振东为决赛做好最困难的准备", "网红橙子姐姐柬埔寨失联超48小时", "王楚钦3-0横扫赵子豪", "关晓彤陈都灵金鸡奖红毯同框", "邓超走红毯帮观众捡水", "多位中国游客借记卡遭跨国盗刷", "驴友野游被困获救被追偿7.4万救援费", "刘诗雯卫冕全运会混双冠军", "“大湾鸡”又整活了 这次是散打", "杨利伟：神二十推迟返回是硬核检验", "新党：和平统一是为了更好的生活", "一言为定是中国网友的有力回应", "香港保安局更新日本外游警示资讯", "普通乘客买到残疾人专座？12306回应", "樊振东王楚钦对战神仙球频出", "男子路边停车等好友遭人泄愤砸车", "女生买“光腿神器”被勒出荨麻疹", "00后女孩贷款30万买金月赚4万", "老挝发生抢劫杀人案 一中国公民遇害"]

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
