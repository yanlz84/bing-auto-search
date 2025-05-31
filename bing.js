// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.81
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
var default_search_words = ["爱国主义流淌在中华民族血脉之中", "只剩几面烂墙的别墅拍出2683万", "香港影坛“第一恶人”去世", "来自太空的端午祝福", "特朗普不要的中国留学生全球抢着要", "3年亏8亿 酒店送餐机器人其实在送钱", "印度首次承认有战机被击落", "#比亚迪兆瓦闪充生态快速扩张#", "最严控烟令出台10年 吸烟者少了么", "“龙舟吴彦祖”：我只是五官清晰些", "杭州一“凶宅”竞拍14轮后成交", "孩子淋雨演出老师打伞观看？假", "朴槿惠带女保镖逛菜市场", "35岁男子不结婚 爆改山洞隐居4年", "司机遇查酒驾当场吨吨吨喝下1瓶白酒", "土狗海外爆红被封狗王 有人给写传记", "端午快乐还是端午安康", "古天乐：狗仔都跟不到我", "刘德华用粤语送端午祝福突然断片了", "校门口的“游烟”该管管了", "央视2025端午特别节目", "老人住3600万豪宅拾荒 邻居被逼卖房", "河北一化工车间爆炸 已致5死2伤", "断眉吃粽子 好吃但粘牙", "女装抄不动了 但这是好事", "市民称在周大福买到假黄金项链", "县政府收到信访后不作为引发舆情", "新加坡公开赛女单4强国羽占3席", "南派三叔《九门》电视剧官宣阵容", "断眉力挺马嘉祺：非常完美", "江苏一医院推出“药膳粽”", "爵士已邀请杨瀚森参加试训", "女子长期被迫吸二手烟痛苦地猛洗澡", "曹德旺：为我们的孩子办自己的斯坦福", "男子跳入的兵马俑3号坑已可正常参观", "特朗普：马斯克将继续往返白宫", "刘楚昕是谁 文学大佬们为何力挺", "王楚钦回应巴黎奥运兼三项", "印军方首度证实：有战机被击落", "桨板哥一桨KO漏网鸭", "日本版安踏在中国卖疯了", "吴宣仪回应刘宇粉丝", "单依纯疑似回应演唱失误", "断眉袭榜单依纯成功", "“热带水果自由”要来了", "车辆坠桥致5死的断头路已加高护栏", "林青霞罕见现身 给粉丝送飞吻", "北方人不擅水战具象化了", "四川宜宾3.8级地震", "彩色眼影全卖给六一汇演了", "河北唐山3.2级地震"]

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
