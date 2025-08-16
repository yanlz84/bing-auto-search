// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.235
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
var default_search_words = ["山河铭记", "人民日报：“全民强制社保”系误读", "俄外长为何穿“苏联风”卫衣访美", "“下一站，受降！”", "乘客吐槽高铁邻座400斤男子致拥挤", "宇树机器人“撞人逃逸”火到国外", "净网：知道什么是“指尖陷阱”吗", "飞行学员出轨10余人 前女友发声", "9万元买的汗血宝马 高速事故中死亡", "普京提议下次莫斯科见 特朗普：有趣", "谷爱凌再次受伤：因人为事故", "四川德阳发生液化气罐车爆炸？假", "“亮证姐”丈夫被党内警告处分", "泽连斯基：我们指望美国结束战争", "山东载11人面包车坠海 已致6人遇难", "直击苏超：常州vs镇江", "荣成车祸进ICU小孩不幸去世", "半年流失14万人 峨眉山怎么了", "外交部回应日本政要参拜靖国神社", "人民日报专访迪丽热巴", "普京专机返俄途中美军战机护航", "夏克立被曝婚内出轨 睡女儿粉丝", "主人欠钱 3岁狸花猫被500元拍卖", "陪看男篮亚洲杯：中国vs新西兰", "向太谈2次从黑社会手上救出梅艳芳", "李世民扮演者称演员要养家糊口", "皈依“洞门”的年轻人被暴击", "俄记者送了美国记者一瓶伏特加", "“卷卷”警官走红 网友称撞脸张译", "山西大同1分钟地震2次 多地有震感", "年轻人开始流行租“三金”结婚", "美前高官：普京大获全胜 特朗普累惨", "岳云鹏曾因帮女艺人挡酒被换掉", "普京特朗普会晤 俄美透露哪些信息", "男童被带去冒名顶替打疫苗 当地回应", "直击苏超：苏州vs泰州", "奶茶店天花板掉落致1名店员身亡", "特朗普向乌总统提建议：你得达成协议", "当地称砌墙占200平大堂业主有产权", "黄一鸣曝王思聪不给抚养费", "直击苏超：无锡vs徐州", "警惕！热带低压携暴雨大暴雨靠近", "特朗普：停火取决于乌克兰", "被误读的“社保新规”", "女孩称分到的回迁房被姑姑霸占多年", "“00后”股民：行情热了 到处是机会", "宇树机器人百米障碍赛动作行云流水", "北京今天出现日晕景观", "证监会原处长杨郊红“逃逸式辞职”", "影石创新回应创始人向员工撒钱", "梅德韦杰夫列举俄美会晤5项成果"]

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
