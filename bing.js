// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.449
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
var default_search_words = ["对网络乱象要敢于亮剑", "局地-40℃极寒 下半年最冷一天来了", "20元代上课50元代跑 校方出手了", "预防流感八问八答", "美可卓蓝胖子回应假奶粉事件", "中方回应澳国防部称监测到中国舰队", "香港大埔火灾：警方已拘捕13人", "《疯狂动物城2》进入中国影史动画前三", "中国男篮再负韩国 世预赛两连败", "笑星丁少华去世", "宁德时代基层员工每月涨薪150元", "“宁波有人醉酒持刀捅2人”系谣言", "小伙仅剩2元买米饭 店主给炒菜", "“情况危急，请求军舰援助！”", "33岁驻村干部病逝：孩子还不到一岁", "广东发现新物种 堪称植物界大熊猫", "香港火灾已致151死30多人失联", "200元一片的流感药购买人数暴增6倍", "男子婚宴酒后骑车身亡 家属索赔45万", "北京箭扣长城首次发现崇祯五年火炮", "马克龙将访华 外交部介绍有关安排", "中方回应有日本歌手演唱会被取消", "广州有车辆碰撞起火 沿路形成1条火线", "日本将采购新型反登陆导弹", "中方敦促日方老老实实收回错误言论", "普京签令对中国公民临时免签", "免费领鸡蛋诱骗35名老人共1.2万", "业主减25斤免756元物业费", "省委全会为两场婚宴腾会场", "上海业主私挖地下室事件追踪", "新加坡将禁止中学生校内用智能手机", "武汉高校研发艾滋病“基因剪刀”", "邓紫棋演唱会谈香港火灾情绪失控", "DeepSeek同时发布两个正式版模型", "文眉师故意文丑眉强迫顾客升单获刑", "俄计划到2030年吸引570万中国游客", "匈牙利译员给普京翻译漏洞百出", "曝GALA走是因为TheShy不打了", "马杜罗：美国为石油而来", "越南海军“陈兴道”护卫舰访问青岛", "中方回应日欲证明其对钓鱼岛非法主张", "几代人如何阻止两大沙漠合拢", "大学生回宿舍要安检是否“过度”", "中国首艘火箭网系回收海上平台交付", "搞事的高市如何完事", "英国广播公司苏格兰总部发生火灾", "中国单机容量最大效率最高燃机投产", "罗永浩宣布“大事”：年底开分享大会", "今起这些电动自行车全面禁售", "BLG官宣Xun回归", "美议员节目放言：美即将干预委内瑞拉"]

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
