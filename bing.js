// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.441
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
var default_search_words = ["建设人民城市 致广大而尽精微", "李家超：香港大埔火灾已全部受控", "中方回应“日本有人称能击沉福建舰”", "一图区分普通感冒和流感", "国防部回应“演习是否意在警告日本”", "香港特区政府向每户灾民派发1万港元", "净网：“千亩辣椒免费摘”系谣言", "香港大埔火灾已致55人遇难", "外交部：中方绝不接受日方的自说自话", "香港起火大楼内发现生还者", "国家铁路局调查昆明致11死事故", "“珠峰安装电梯”系谣言", "高市再发涉台谬论", "国防部回应中国是否正建造核动力航母", "香港大埔明火基本扑灭 搜救仍在进行", "世界冠军兴奋剂阳性 处理结果公布", "香港火灾一名31楼被困老人获救送医", "33岁大熊猫高高离世 曾旅居美国", "中方敦促日方加快处理在华遗弃化武", "特朗普施压高市别在台湾问题上挑衅", "前湖北首富晒证据硬刚金龙鱼", "国防部回应日本在台培养媚日人士", "官方通报“新郎新娘先后坠亡”", "国防部：日方招事惹事必付出惨痛代价", "西安通报多车连撞事故：肇事者被控制", "绝不允许日本军国主义幽灵再为祸人间", "日本朝日集团道歉：大批客户信息泄露", "特朗普所有刑事指控已终结", "三逃人员成山姆配送员 送货途中被捕", "国台办：“台独”意味着战争 死路一条", "宝成铁路线列车碰撞施工人员致2死", "人民网发布视频 欢迎加入预备役", "首例“医保价”脑机接口手术完成", "俄方发出明确信号：关键问题上不退让", "福建舰战斗力如何？国防部：用事实说话", "4万元现金被大风刮飞 众人合力找回", "高层起火往哪跑？记住这些能救命", "外交部：敦促日方立即收回错误言论", "售货阿姨与主播互动被停职后复工", "非法出售玳瑁标本 买家卖家均获刑", "欧盟猛烈抨击美国称其使用勒索手段", "俄“联盟MS-28”载人飞船发射升空", "香港警方以涉嫌误杀罪拘捕3人", "高市一句话引“钟声”“钧声”齐轰", "特朗普对乌接受和平计划作出让步", "航行警告 黄海部分海域有军事活动", "鸿蒙智行：遭大量集中攻击已收集证据", "高市早苗被石破茂接连批了三次", "中央港澳办工作小组赴港协助开展救灾", "日本商家不断收到中国游客取消通知", "乌官员：和平计划不包含全面赦免条款"]

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
