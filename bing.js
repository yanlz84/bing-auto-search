// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.192
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
var default_search_words = ["让中国新发展成为各国的新机遇", "印度换了一种同中国打交道的方式", "越来越多餐厅正在抛弃包间", "接连来袭 “双台风效应”有何影响", "全球资管巨头“抄底”中国房地产", "女演员高海宁回应患精神疾病", "确诊超4000例 基孔肯雅热啥来头", "泰国与柬埔寨边境再次交火", "泰方确认使用集束弹药：不受公约约束", "“左行右立”不再是文明礼仪的标配", "企业回应学生溺亡应急队38分钟到场", "呼和浩特公交因降雨全线停运？假", "50多名犹太少年在西班牙被赶下飞机", "广州白云机场查获人体藏毒大案", "开价185亿 刘强东竞买德国超市", "直击广州集中灭蚊现场", "《年轮》纠纷 撕裂了谁的体面", "8人偷渡一听要去缅甸逼停车辆", "柬埔寨士兵赤裸上身向泰国开火", "看脸吃饭 餐饮业刮起“男色消费”风", "洪森回应他信称要给其一个教训", "证监会：全力巩固市场回稳向好态势", "中国女篮大运会力压美国队夺得冠军", "山东乳山现216套“1元起拍”海景房", "基孔肯雅热不会人传人为何仍需隔离", "公安“摇人”摇来张嘉益胡歌任贤齐", "泰国改口称不拒绝第三方调解", "iPhone 17 Pro橙色新配色", "玲娜贝儿遭男游客掀裙子", "河北阜平县暴雨 积水涨至膝盖以上", "佛山顺德确诊3627例基孔肯雅热", "第三批国补资金已下达", "中央巡视组刚进驻 赵忠发被查", "暴雨黄色预警！多省份有大到暴雨", "呼和浩特一外卖小哥积水中触电身亡", "法国为何此时宣布将承认巴勒斯坦国", "汪苏泷大雨中边剪雨衣边唱歌", "在韩外籍劳工被挂叉车上 李在明发声", "印度是否为中企设下“杀猪盘”", "甘肃内蒙古云南夜间地震 最高4.7级", "泰柬边境冲突已致19名泰国人死亡", "女婴被家长喂出肝衰竭 医生提醒", "梅西和阿尔巴在美职联被禁赛", "30分7秒按45分收费 向上取整成惯例", "体感超40℃！河南天气越来越极端了吗", "普京出席俄最新核潜艇入列仪式", "泰军称冲突已致柬方约100名士兵死亡", "中国最神秘军校72年来首次招女生", "一个美国重刑犯去了苏格兰", "台湾当局官员窜访日本 外交部抗议", "“假发大王”瑞贝卡被证监会立案"]

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
