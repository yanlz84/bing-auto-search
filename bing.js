// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.109
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
var default_search_words = ["中国中亚共筑友好合作的青春纽带", "河南问责210人 含多名县委书记县长", "巨大伊朗导弹残骸现以色列街头", "5月金融数据传递了这些关键信息", "北京暴雨故宫再现千龙吐水", "北大设滑梯外卖桌被指像猪食槽", "章子怡短发造型好飒", "中国海军三航母时代即将到来", "85岁妻子没上进心93岁男子起诉离婚", "湖南一学校买1万多公斤荔枝给师生", "杭州女子遭劫持被捅多刀 警方通报", "高考扁担女孩开通社媒账号？假", "伊朗对以色列报复行动已致以方4死", "小沈阳女儿讲韩语流利标准", "采购商回应婚宴吃掉50万东家拒付款", "杨幂：能和刘德华一起走红毯了", "伊朗：计划打击中东地区美军基地", "中方谴责以色列侵犯伊朗", "淮安看台一片红 堪比国足阵仗", "以色列：“暂无计划”杀死哈梅内伊", "劳力士店员否认曾毅戴表为自家品牌", "杨幂在红毯上给粉丝发荔枝", "以色列公布对伊朗行动视频", "专家：伊朗反间谍网络或已漏成筛子", "印度坠机已致279人死亡", "高考扁担女孩找到时薪12元暑假工", "郑钦文今晚冲击伦敦站决赛", "中国男排世排再升2位到第18", "大学通报职工子女驾车逼停骑行学生", "苏超南京1-1战平淮安", "#美国阅兵彩排画面曝光#", "空军招女飞行学员 可获清北双学籍", "伊万凌晨离开中国飞往卡塔尔", "第27届上海国际电影节开幕式", "24岁女孩患胃癌自述不良作息习惯", "3分钟轰两球 南京淮安疯狂进攻", "LABUBU在韩国线下不卖了", "南京摇来朱元璋岳飞孙权助阵", "台风“蝴蝶”在广东雷州再次登陆", "上海航空一航班飞行中有充电宝冒烟", "当地回应女孩暑假打工被血站抽血浆", "特工潜入伊朗建无人机基地画面公布", "雷霆逆转步行者 总决赛2-2", "伊朗称福尔多核设施受损有限", "藿香正气水的网红用法不靠谱", "村BA球王争霸赛", "伊朗武装部队2名高官遭袭身亡", "3岁小球迷现身苏超赛场为球队助力", "广汽承诺2个月内完成经销商返利兑现", "伊朗：无美国许可 以袭击不会发生", "上合组织就伊朗遭军事打击发表声明"]

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
