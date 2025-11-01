// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.389
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
var default_search_words = ["共同开创可持续的美好明天", "苏超总决赛来了！南通vs泰州", "世界唯一！中国核能科技实现新突破", "区域协调发展将如何改变你我生活", "杨国福1斤豆芽28元贵过山姆", "这件4000多年前的上古礼器有多绝", "中国明年将发射梦舟一号等4艘飞船", "3亿吨尾矿渣石正在“变废为宝”", "散装江苏终于合体了", "神二十一如何在太空穿针引线", "法官帮债务人直播卖螃蟹引热议", "网民编造“抢粮抢油”谣言被罚", "“前最帅央视主持人”复出", "“苏超”冠军奖杯长啥样", "中国人了不起！昨天上太空今天去南极", "6万多人现场见证苏超冠军诞生", "俄勇士飞行表演队炫特技“落叶飘”", "穿着外裤到底能不能直接坐床上", "这就是南通未尝一败的底气吗", "车主选中尾号6646号牌被告知作废", "一口气打包江苏“十三太保”热梗", "高市早苗主动上前搂住智利总统", "苏超无论谁赢江苏都赢了", "240斤女生为婚礼5个月瘦60斤", "268斤男子切胃手术后身亡 院方回应", "回顾苏超TOP5名场面", "一觉醒来从河北到天宫了", "学生没课也不能待宿舍？媒体：瞎折腾", "上海新增带薪休假 最长7天", "郑丽文怒批民进党 马英九激动落泪", "220万人抢苏超决赛门票", "湖北一派出所所长因公牺牲", "下雨天的时候鸟都在干什么？", "苏超决赛“岳家军”“穆桂英”同框", "多地网友拍到神二十一划破夜空瞬间", "关于安世半导体 中方最新回应", "小货车撞破墙体车身悬空险坠楼", "今日起新车上牌可线上办", "杨瀚森首次被弃用", "伊朗一飞机失控 飞行员弹射逃生", "库里首次成为NBA收入最高球员", "加总理：已就反关税广告向特朗普致歉", "郑丽文就任中国国民党主席", "航天员武飞：儿时在村里喜欢看星空", "泰州舰南通舰为苏超决赛加油", "陪爬泰山男演员承包百亩地赚了10万", "超市老板为100元寻失主跑遍工地", "茶叶制品添加番泻叶被罚没602万", "海南三亚28件深海装备首次国内亮相", "长春亚泰0比4北京国安", "车票带“宠”字 宠物托运服务上新了"]

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
