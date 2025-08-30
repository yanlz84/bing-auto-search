// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.262
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
var default_search_words = ["中共中央政治局召开会议", "外交部：菲方行为必将付出代价", "9月新规来了", "北京宛平城：让抗战精神薪火相传", "男子电动车后绑60斤大鱼遛街展示", "特朗普大部分全球关税政策被裁定非法", "4次拒接特朗普电话后 莫迪奔向中日", "七夕垃圾桶寻宝火了", "访华前夕 普京接受新华社专访", "5岁男童撞倒1岁半幼童 警方介入", "佩通坦被解职 谁可能成泰国新总理", "“鸡蛋储存前要清洗”系误读", "美股三大指数集体收跌 均至少连涨4月", "男子贷款8.3万被收2.8万服务费", "特朗普取消特勤局对哈里斯保护", "深圳一小区被曝建坟墓 民政局回应", "尼泊尔中产买爆中国电动汽车", "多食超加工食品对男性生育能力有害", "上海多区斥资1.4亿采购学生运动手环", "土耳其切断与以色列所有经济联系", "一间房住百个孩子？佛山一学校回应", "马英九：中华儿女不容抗日历史被扭曲", "苹果三星要求小米停止“偷袭营销”", "40天女婴肝病恶化 父亲割肝救女", "县级领导下班后集体穿汉服", "乌官员：愿与俄在领导人层面直接对话", "专家谈深圳退休夫妇欠债1.2亿元", "女子试驾发生交通事故 被4S店起诉", "3.9元买蛋糕后退款被商家辱骂", "男子七夕送金镯分手后要女友还钱", "重庆丰都27岁挂车司机缅甸失联", "万斯称若特朗普遇不测已准备好接班", "男子转账备注自愿赠与 分手起诉返还", "作家马伯庸：儿子语文不好要上作文班", "骗子进小学班级群诈骗后群聊遭禁", "山东小学让新生家长集体宣誓引热议", "泽连斯基：俄军集结10万人准备进攻", "80岁老戏骨高雄感谢妻子相伴50载", "男子踩踏丹霞地貌 景区报警", "大爷开三轮撞伤假想情敌获刑11个月", "以军已开始对加沙城的初步行动", "54岁“庄嫂”李菁菁瘦到认不出", "国家级抗战纪念设施遗址名录公布", "世界泳联七夕节发全红婵比心图", "律师：七夕垃圾桶寻宝或涉嫌侵占罪", "电竞选手小蝶宣布退役", "武大电动车租价36元1小时 游客：天价", "长沙小伙领衔研发国产高端光学设备", "丢失“股王”宝座后 贵州茅台公告", "为泰党提名泰国新总理人选", "日本上半年新生儿数量创新低"]

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
