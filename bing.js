// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.375
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
var default_search_words = ["党的二十届四中全会公报学习手账", "深圳机场回应郑智化吐槽", "专家怀疑太阳系星际访客是外星母舰", "“十五五”有哪些关键部署", "奥黛丽赫本之子在苏州胜诉", "首度披露！八路军活捉日军真实画面", "世界最大航母逼近拉美", "姚明谈近期状态：吃饭睡觉打魔兽", "河南农民自制烘干机烘30多万斤玉米", "山东姑娘赵娜获环球小姐中国总冠军", "8位烈士身份确认！请记住他们的名字", "网民造谣发生爆炸伤亡不明被查处", "郑智化发文控诉深圳机场", "6岁女童争吵后脑梗 母亲以为闹脾气", "这种保温杯可能引发慢性中毒", "台湾有151条以光复为名的路", "今年冬天会很冷？最新权威判断", "他带1650个苹果到抗美援朝烈士陵园", "女子谈恋爱2个月被骗181万", "女生参加荒野挑战赛半个月判若两人", "TES战胜BLG晋级八强", "“双十一”为什么越来越早了", "美国步步紧逼 哥总统：绝不下跪", "重庆副市长江敦涛被查", "乘客实拍高铁车厢缝隙爬满蟑螂", "重庆披露：刘海故意泄露国家秘密", "卷尺哥凭什么成为深圳的民间甲方", "向太曝李连杰周润发都由老婆管钱", "一面布满381个弹孔的战旗", "普京：至少生3个孩子应成俄罗斯常态", "75年前的今天：抗美援朝第一仗", "纪念台湾光复80周年大会在京召开", "赴台红色特工骨灰等待祖国统一日", "泰方称泰国禁娱30天传言不实", "你了解自己的“过冬搭子”吗", "200平别墅扩建到700平 谁给办的证", "越南任命首位女性副总理", "男子花4000元买“祖传药”成本仅5元", "监控拍下河北一小区发生地面沉降", "12306购票有新变化", "江苏一景区观光小火车被风吹翻落水", "台湾姑娘代爷爷回河南寻根", "茅台五年换了四任董事长", "江西一公安副局长充当保护伞被双开", "贵州省能源局局长陈华任茅台董事长", "货车蛇形走位恶意挡消防车 警方出手", "北方“专属”冷空气登场 气温再探底", "船员晕船自杀 家属索赔200万被驳回", "订婚花60万遭悔婚男子起诉 法院判了", "泰国王太后曾鼓励女儿学中文", "鸡排哥全国巡炸：代排标价299元"]

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
