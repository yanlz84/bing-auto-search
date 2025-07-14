// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.169
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
var default_search_words = ["城市归根结底是人民的城市", "这么热不报40℃？权威回应来了", "女孩街拍意外走红 神似张柏芝", "天气预报会“刻意”压低数值吗", "新疆的小孩一出生就带全妆", "公职人员烤鱼店殴打孕妇 当地回应", "大同：将奖励翻8吨垃圾找手表环卫工", "外卖大战已经进阶到负4元购了", "男子加拿大考公上岸：这里也卷", "找人工客服 为啥这么难", "律师：强吻男孩致水痘或涉故意伤害罪", "76元配送1吨奶茶？蜜雪冰城回应", "张本智和对阵王楚钦已8连败", "韩国一个西瓜涨到156元", "被强搂亲吻男孩妈妈发布视频遭下架", "局地40℃以上！最热的两天要来了", "被质疑“袭胸”男子：感到寒心", "曝秦岚聚会后直奔魏大勋家", "王楚钦4-0横扫张本智和夺冠", "春节档后的票房冠军 居然是“她”", "环卫工翻垃圾找手表为何暖心变闹心", "乌军：史上首次 俄军向机器人部队投降", "男子误把乙醇当汽油 点火时引火烧身", "中央气象台升级发布高温橙色预警", "侃爷演唱会被吐槽像去米其林吃白粥", "杭州多名小学生疑因工厂排放流鼻血", "侃爷回应：没有迟到 一直在现场等", "网红迅猛龙晒复旦大学录取通知书", "翻垃圾找手表环卫工不该被隐身", "为何高铁F座最受欢迎", "尾号“8个7”手机号拍出320万元", "张凌赫拍戏用矿泉水湿身引争议", "王楚钦和朱雨玲夺冠后合影", "环卫工翻垃圾找手表是游客投诉要求", "女篮亚洲杯韩国绝杀新西兰", "台湾超级电池工厂爆炸原因曝光", "天津不是北漂中产的退路", "“0元购”让奶茶店一小时500单", "台湾超级电池工厂爆炸 浓烟冲天", "外媒：以色列导弹致多名儿童死亡", "韩国高温致大白菜价格暴涨", "律师称被落石砸车家属索赔并无不妥", "中国女排3-2逆转美国", "美国副总统万斯游迪士尼引争议", "副部级“老虎”骆玉林被判死缓", "王楚钦把张本智和打笑了", "村民不满古镇收门票 指引游客逃票", "国防部：“台独”武装终将自取灭亡", "高温攻击 河南焊在40℃里了", "台湾爆炸的超级电池工厂刚运作两年", "男子划船下班 25分钟车程划了3小时"]

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
