// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.309
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
var default_search_words = ["情暖天山气象新", "歼-35完成在福建舰上弹射起飞", "中国航母又一突破", "国庆中秋临近 文旅部发出游提示", "港珠澳大桥主桥将封闭", "万豪酒店承认拖鞋循环多次使用", "中方回应“金正恩称绝不放弃核武”", "福建舰电磁弹射宣传片震撼发布", "广东或大范围停工", "背篓老人等公交被拒载 司机被开除", "多角度看歼-35弹射起飞", "业主私挖地下室挖通河道系谣言", "3×8还是8×3？80后90后家长吵翻了", "多国承认巴勒斯坦国 外交部表态", "广东多地宣布五停", "日本“苹果病”流行达历史顶点", "广东市民等风来：准备五六个充电宝", "台风逼近 广东：全面进入临战状态", "成都体育生跳越10把椅子一次成功", "“风王”完成眼墙置换 可能海水倒灌", "#罗永浩数字人又玩新花样#", "学生吃免费汤饭疑被校长骂臭要饭", "女子凌晨街头产子赤脚抱婴儿", "千万粉丝网红自曝年收入可达九位数", "台风“桦加沙”强度已达17级以上", "已有8国遭以色列袭击", "福建舰上新 西太战略格局将被重塑", "六旬男子连挖10座墓偷11个骨灰盒", "#英加澳为何要承认巴勒斯坦国#", "舰载机弹射起飞“首秀”高清大图", "走红的手搓“等离子脉冲炮”安全吗", "女子咳嗽8个月靠AI问诊致双肺空洞", "安踏市值蒸发125亿港元", "19岁女孩在赛场找到就业灵感", "美施压欧盟对中印加税 冯德莱恩回应", "福建舰三型机弹射成功意味着什么", "中方回应中美领导人是否在APEC会晤", "菲律宾总统遭遇执政后最大规模抗议", "央行行长潘功胜回应美联储降息", "特朗普马斯克齐发合照：献给查理", "产妇凌晨路边产子目击者发声", "受台风影响 海南铁路进出岛列车停运", "中国银行业总资产近470万亿元", "洪秀柱现身贵州小七孔景区", "“桦加沙”今晚开始影响浙江", "中国电动两轮车即将登陆日本", "李干杰当选中国统促会执行副会长", "垃圾布黑心棉被用作婴儿被", "郑州警方破获一起资金盘传销案", "景德镇鸡排哥爆火 忙到表情飞起", "宁波一小区推出“减重抵物业费”"]

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
