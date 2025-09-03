// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.271
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
var default_search_words = ["习近平发表重要讲话", "九三阅兵全程回顾", "受阅部队跑步登车画面被怒夸", "九三阅兵高清大图合集来了", "外籍记者热泪盈眶：这辈子值了家人们", "纪念抗战胜利80周年文艺晚会", "法新社镜头下的中国阅兵", "霍震霆：父子同场见证盛事是一种光荣", "妈妈在上百人的方阵中一眼认出儿子", "咱们有飞飞飞不完的飞机了", "甄子丹观看阅兵后发文：荣幸震撼自豪", "警方辟谣领育儿补贴需先交保证金", "阅兵最帅女机长 是她", "“覆盖全球”的东风-5C有多大", "韩议长在北京与金正恩碰面并握手", "武契奇诉苦 普京：都看在眼里", "阅兵时五角大楼附近披萨订单激增", "中国军队装备已经Next Level", "坦克到底有没有后视镜", "阅兵礼炮发令人员：紧张到能坐在地上", "台网红馆长：这是全世界最厉害的阅兵", "坐地铁发现大家都在看阅兵", "特朗普谈谣言：我都不知道我死了", "金正恩邀请卢卡申科访问朝鲜", "霍启刚：强大军队展示了中国底气", "埃文凯尔看受阅飞机表示：不可思议", "普京与金正恩在北京会谈", "在北京街头和东风-61“擦肩而过”", "武契奇来华出席阅兵后发帖感谢中国", "阅兵飞机飞过北京站 旅客纷纷掏手机", "东风26D从北极飞南极不到3个半小时", "胜利日大阅兵震撼长卷 请横屏观看", "1小时单独交流后 普京邀金正恩访俄", "中国石油拟将5.41亿股转给中国移动", "普京：中国举行的纪念活动很精彩", "现场观看九三阅兵后 李家超发声", "张凯丽称作为中国人太幸运了", "特朗普宣布将搬迁美国太空司令部", "台网红馆长谈九三阅兵：非常骄傲", "郭帆“边看阅兵边改剧本”", "肖思远烈士弟弟肖荣基参加阅兵活动", "国防科大博士吕家杰两次参加阅兵", "陈梦观看阅兵后发文：触及心灵的震撼", "阅兵没看够？让时间慢下来", "退役大学生士兵天安门广场圆指挥梦", "咱家飞机飞过我家啦", "王楚钦现身北京大学正式报到", "阅兵场上英姿飒爽 彩排花絮活泼开朗", "马龙汪顺的阅兵观后感", "88岁老兵回忆1954年国庆阅兵", "人手一个瞄准镜意味着什么"]

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
