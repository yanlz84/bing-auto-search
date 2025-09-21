// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.307
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
var default_search_words = ["传统产业“绿”动“智”变", "广东气象罕见提醒：做好巨灾防御准备", "“南天门计划”有50万字了", "歼-20的首次静态展示有何重要意义", "女儿发现父亲500多万遗产用于保健", "始祖鸟事件后 多户外品牌集体表态", "多部门推进预制菜国家标准制定", "大爷蹲点进周杰伦演唱会卖水：5元1瓶", "菲军方宣布“红色警戒”状态", "为阻止印籍员工返美 美国人组团抢票", "刘强东“10年1元年薪”之约到期", "“学校组织签器官捐赠书”系谣言", "员工下班途中骑车倒地身亡算工伤吗", "18岁女孩发现男友已婚 饮酒后跳江", "“可惜我叫谢霆锋不叫谢停雨”", "中产还会为始祖鸟买账吗", "撞脸刘亦菲网红“刘一菲”改名", "女子要一次性筷子被告知下不为例", "以空袭也门报社 31名新闻工作者死亡", "曹骏不后悔巅峰期退圈读书", "深圳一网红景点还没开门就被指太贵", "一句道歉修复不了喜马拉雅", "母亲看虚构剧情直播花4万 女儿发声", "请彻查始祖鸟炸山秀审批三大漏洞", "43岁二胎妈妈患阿尔茨海默病", "飞机不基础 角度也不基础", "始祖鸟烟花秀后 人民日报新华社发声", "始祖鸟荒唐策划背后是缺乏常识", "三所“零近视”小学带来的启示", "9岁女孩在世界舞蹈大赛惊艳全场", "“永远不要和别人一起欺负自己”", "美国一黑熊闯进超市咬人被击毙", "村民称喜马拉雅山烟花味道很浓", "黄灿灿赚的第一笔钱给男朋友交学费", "以色列要美国下场干预", "AI开始闹情绪 打工人反向共情", "辽宁一高校原校长王彤被查细节曝光", "美国几乎撕裂 特朗普还要“战斗”", "院士称中国激光聚变方案效率高30倍", "网友称在上海一日料店里吃出活蛆", "西方多国将承认巴勒斯坦国", "女子患肾结石 老公帮忙倒立排结石", "特朗普在晚宴上怒斥拜登", "谁将为“喜马拉雅烟花秀”担责", "售价上千的始祖鸟屡出质量问题", "男子杀人后逃离又杀路人被核准死刑", "一代人有一代人的月饼", "潘长江和女儿否认“全家移民美国”", "永州足协“树上挂票指南”梗太多了", "不交物业费不能摇车位？法院回应", "美国政府10月1日面临“关门”危机"]

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
