// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.170
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
var default_search_words = ["总书记情牵中华文明瑰宝", "18岁高中生坐飞机到西双版纳后失联", "特朗普称对俄罗斯征收100%关税", "这个15.97%有何深意", "男子划船下班 25分钟车程划了3小时", "格陵兰居民懵了：一觉醒来冰山在门口", "大厂程序员被裁后制毒贩毒获刑", "侃爷回应：没有迟到 一直在现场等", "春节档后的票房冠军 居然是“她”", "奶茶店称外卖大战1天利润仅400元", "大同：将奖励翻8吨垃圾找手表环卫工", "76元配送1吨奶茶？蜜雪冰城回应", "外卖大战第一批受害者出现了", "朋友用狗喝水的盆浇花被狗撕咬", "环卫工翻垃圾找手表为何暖心变闹心", "女孩街拍意外走红 神似张柏芝", "穿纸尿裤小孩坐绿豆框玩耍 超市回应", "你过不了第2关的小游戏偷偷赚了上亿", "曝秦岚聚会后直奔魏大勋家", "张凌赫拍戏用矿泉水湿身引争议", "这么热不报40℃？权威回应来了", "解密文件曝美战机撞上UFO", "张本智和对阵王楚钦已8连败", "翻垃圾找手表环卫工不该被隐身", "被强搂亲吻男孩妈妈发布视频遭下架", "手机里这两个软件会盗取你的存款", "商家称被平台经理私自报名外卖大战", "天舟九号货运飞船择机发射", "乌军：史上首次 俄军向机器人部队投降", "新疆的小孩一出生就带全妆", "印度外长在北京发声", "网红迅猛龙晒复旦大学录取通知书", "韩国高温致大白菜价格暴涨", "台湾超级电池工厂爆炸原因曝光", "东莞：对酒吧娱乐场所驻唱应批尽批", "杭州多名小学生疑因工厂排放流鼻血", "杨少华幼子：老爷子去世大家都解放了", "韩松任上被查 上月曾主持会议", "王毅同印度外长苏杰生会谈", "尾号“8个7”手机号拍出320万元", "律师：强吻男孩致水痘或涉故意伤害罪", "夫妻西班牙自驾游整辆房车被偷", "河南今天71地高于40℃", "东北人排队装空调 订单排到半月后", "高考生被骗至缅甸 曾称朋友提供路费", "律师称被落石砸车家属索赔并无不妥", "硅谷巨头上演AI人才争夺战", "男子误把乙醇当汽油 点火时引火烧身", "台湾爆炸的超级电池工厂刚运作两年", "韩国一个西瓜涨到156元", "美国副总统万斯游迪士尼引争议"]

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
