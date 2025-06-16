// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.112
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
var default_search_words = ["总书记关心的世界文化遗产", "泰国与印度空难幸存者座位都是11A", "伊导弹袭击目标包括以总理家族住所", "“棒棒”父亲收到了儿子的礼物", "伊朗首次白天发动袭击 当晚再发导弹", "幼儿园一年关掉2万所", "央视曝光偷工减料的公共健身器材", "泡泡玛特创始人：无用才是真正的永恒", "大学里的男生为什么越来越少了", "陈梦称求婚现场人越多越好", "特朗普：接受普京担任伊以冲突调解人", "90%的父亲都会听到过的谣言", "特朗普放话：伊以将达成协议暂停冲突", "以色列：伊朗空袭已致以方13死390伤", "曝以色列计划杀哈梅内伊 被美国否决", "无锡2-0常州 丨州变丨川了", "以总理证实打死伊朗情报部门负责人", "伊朗外交部大楼遭以军空袭", "45岁方力申官宣小14岁妻子怀孕", "世俱杯：拜仁10-0血洗奥克兰城", "尔冬升父女俩相差61岁引热议", "伊朗官员：严肃考虑封锁霍尔木兹海峡", "分析师：金价或将冲击历史新高", "25名学者被集中通报批评", "山东一大学禁用红米手机考试", "伊以冲突 有个中东国家态度耐人寻味", "特朗普：美国“有可能”介入伊以冲突", "王化回应一大学禁用红米手机考试", "48岁左小青教跳广场舞活力四射", "伊朗新一轮导弹袭击已致超200人死伤", "明十三陵主体陵寝2030年将全面开放", "以色列特工被捕", "王长田：《哪吒2》或拉动GDP超2000亿元", "女企业家称被职能部门“做局”", "男孩骑行不慎摔倒 自行车插进大腿", "中国女篮67分大胜波黑完成双杀", "以称13日以来已拦截上百架伊无人机", "广西梧柳高速迎客松被砍 官方回应", "伊朗中部一武器工厂遭以色列空袭", "以总理：若伊朗弃核 以愿停止行动", "徐州球员晃开4人 对手愣在原地", "美加州抗议活动持续 一天内38人被捕", "世俱杯大巴黎4-0马竞", "伊朗革命卫队情报负责人遭以暗杀", "球形机器人亮相苏超赛场", "张檬自曝生育后频现脑雾症状", "伊朗3名高级将领在以色列空袭中身亡", "李梦落选女篮名单 宫帅首度回应", "王欣瑜2-1胜贾巴尔晋级柏林正赛", "德黑兰上空再次传出密集爆炸声", "《哪吒2》片方或分账52亿元"]

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
